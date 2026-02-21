import { getToken } from "./auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  };
  return fetch(`${API_BASE}${path}`, { ...options, headers });
}
