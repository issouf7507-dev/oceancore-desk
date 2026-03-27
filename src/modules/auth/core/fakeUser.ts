/**
 * Utilisateur factice pour les tests (mode développement).
 * Connexion : test@test.com / test123
 */
export const FAKE_USER = {
  id: 1,
  name: "Test User",
  email: "test@test.com",
};

export const FAKE_CREDENTIALS = {
  email: "test@test.com",
  password: "09901432",
};

export const FAKE_API_TOKEN = "fake-api-token-for-test";

export function isFakeUser(email: string, password: string): boolean {
  return (
    email === FAKE_CREDENTIALS.email && password === FAKE_CREDENTIALS.password
  );
}
