import { auth } from "@/auth";

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const internalApiUrl = process.env.INTERNAL_API_URL;
  if (!internalApiUrl) throw new Error("INTERNAL_API_URL is not set");

  const session = await auth();
  const token = (session as { apiToken?: string } | null)?.apiToken;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  };
  return fetch(`${internalApiUrl}${path}`, { ...options, headers });
}
