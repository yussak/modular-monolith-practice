"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cancelOrder } from "../actions";

export default function CancelOrderButton({ orderId }: { orderId: number }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleClick() {
    if (!confirm("注文をキャンセルしますか？")) return;
    setLoading(true);
    try {
      await cancelOrder(orderId);
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "キャンセルに失敗しました");
    }
    setLoading(false);
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      style={{ marginTop: "1rem", padding: "0.5rem 1rem", color: "red" }}
    >
      {loading ? "処理中..." : "注文をキャンセル"}
    </button>
  );
}
