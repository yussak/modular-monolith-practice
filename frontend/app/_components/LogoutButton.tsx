"use client";

import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { removeToken } from "@/lib/auth";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await apiFetch("/api/v1/auth/logout", { method: "DELETE" });
    removeToken();
    router.push("/auth/login");
  }

  return <button onClick={handleLogout}>ログアウト</button>;
}
