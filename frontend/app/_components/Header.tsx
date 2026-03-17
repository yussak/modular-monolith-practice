"use client";

import { useSession } from "next-auth/react";
import LogoutButton from "./LogoutButton";

export default function Header() {
  const { data: session } = useSession();

  if (!session) return null;

  return (
    <header style={{ padding: "1rem", borderBottom: "1px solid #ccc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span>{session.user?.email}</span>
      <LogoutButton />
    </header>
  );
}
