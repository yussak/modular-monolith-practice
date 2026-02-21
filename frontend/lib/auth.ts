const TOKEN_KEY = "auth_token";

export function getToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${TOKEN_KEY}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function setToken(token: string): void {
  document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; path=/; SameSite=Lax`;
}

export function removeToken(): void {
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`;
}
