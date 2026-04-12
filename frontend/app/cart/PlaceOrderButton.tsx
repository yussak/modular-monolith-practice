"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { placeOrder } from "../orders/actions";

export default function PlaceOrderButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleClick() {
    if (!confirm("注文を確定しますか？")) return;
    setLoading(true);
    try {
      const order = await placeOrder();
      router.push(`/orders/${order.id}`);
    } catch (e) {
      alert(e instanceof Error ? e.message : "注文に失敗しました");
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      style={{ marginTop: "1rem", padding: "0.5rem 1rem", fontSize: "1rem" }}
    >
      {loading ? "処理中..." : "注文を確定する"}
    </button>
  );
}
