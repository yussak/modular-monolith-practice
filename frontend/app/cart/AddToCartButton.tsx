"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { addToCart } from "./actions";

export default function AddToCartButton({ productId }: { productId: number }) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!session) return null;

  async function handleClick() {
    setLoading(true);
    setMessage(null);
    try {
      await addToCart(productId);
      setMessage("カートに追加しました");
      setTimeout(() => setMessage(null), 2000);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "エラーが発生しました");
    }
    setLoading(false);
  }

  return (
    <span>
      <button onClick={handleClick} disabled={loading} style={{ marginLeft: "0.5rem" }}>
        {loading ? "追加中..." : "カートに追加"}
      </button>
      {message && <span style={{ marginLeft: "0.5rem", color: message.includes("エラー") ? "red" : "green" }}>{message}</span>}
    </span>
  );
}
