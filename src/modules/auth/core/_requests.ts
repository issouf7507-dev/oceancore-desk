export async function logoutRequest(token: string) {
  const base = `${import.meta.env.VITE_API_URL}`.replace(/\/+$/, "");
  const response = await fetch(`${base}/api/v1/logout`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Logout failed (${response.status}). ${text ? `Details: ${text}` : ""}`.trim(),
    );
  }
  if (!response.ok || response.status === 401) {
    window.location.href = "/auth";
    return;
  }

  const data = await response.json();

  if (data?.message === "Unauthenticated.") {
    window.location.href = "/auth";
    return;
  }

  localStorage.removeItem("kt-auth-react-v");

  return data;
}
