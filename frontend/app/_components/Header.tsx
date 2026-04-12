"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import LogoutButton from "./LogoutButton";

export default function Header() {
  const { data: session } = useSession();

  if (!session) return null;

  return (
    <header style={{ padding: "1rem", borderBottom: "1px solid #ccc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <nav style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <span>{session.user?.email}</span>
        <Link href="/products">商品一覧</Link>
        <Link href="/cart">カート</Link>
        <Link href="/orders">注文履歴</Link>
      </nav>
      <LogoutButton />
    </header>
  );
}
