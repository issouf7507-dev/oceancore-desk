/**
 * Helper pour gérer les erreurs API.
 * En cas d'erreur 401 (non authentifié), redirige vers la page de login "/".
 */

type ApiError = {
  status?: number;
  message?: string;
};

/**
 * Vérifie si une erreur est une erreur 401 et redirige si c'est le cas.
 * @param error - L'erreur reçue (Response, Error, ou objet custom)
 * @param redirectPath - Le chemin de redirection (défaut : "/")
 * @returns true si une redirection a eu lieu, false sinon
 */
export function handleApiError(
  error: unknown,
  redirectPath: string = "/",
): boolean {
  const status = extractStatus(error);

  if (status === 401) {
    // Optionnel : nettoyer le token/session avant de rediriger
    localStorage.removeItem("token");
    localStorage.removeItem("kt-auth-react-v");
    localStorage.removeItem("auth-storage");
    sessionStorage.clear();

    window.location.href = redirectPath;
    return true;
  }

  return false;
}

/**
 * Extrait le status HTTP depuis différents types d'erreurs.
 */
function extractStatus(error: unknown): number | null {
  if (!error) return null;

  // Cas fetch natif : Response object
  if (error instanceof Response) {
    return error.status;
  }

  // Cas objet avec propriété `status`
  if (typeof error === "object" && "status" in error) {
    return (error as ApiError).status ?? null;
  }

  // Cas axios : error.response.status
  if (
    typeof error === "object" &&
    "response" in error &&
    typeof (error as any).response === "object" &&
    "status" in (error as any).response
  ) {
    return (error as any).response.status;
  }

  return null;
}

/**
 * Wrapper pour les appels fetch avec gestion automatique du 401.
 * Usage : const data = await fetchWithAuth("/api/endpoint")
 */
export async function fetchWithAuth(
  input: RequestInfo | URL,
  init?: RequestInit,
  redirectPath: string = "/",
): Promise<Response> {
  const response = await fetch(input, init);

  if (response.status === 401) {
    handleApiError(response, redirectPath);
    // Lève quand même l'erreur pour arrêter le flux appelant
    throw new Error("Unauthorized – redirection en cours");
  }

  return response;
}
