import { auth } from "@/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
const INTERNAL_API_URL = process.env.INTERNAL_API_URL ?? "http://backend:3000";

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const session = await auth();
  const token = (session as { apiToken?: string } | null)?.apiToken;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  };
  return fetch(`${INTERNAL_API_URL}${path}`, { ...options, headers });
}

export { API_BASE };
