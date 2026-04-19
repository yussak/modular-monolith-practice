import { auth } from "@/auth";
import { redirect } from "next/navigation";

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
  const res = await fetch(`${internalApiUrl}${path}`, { ...options, headers });
  if (res.status === 401) {
    redirect("/auth/logout");
  }
  return res;
}
