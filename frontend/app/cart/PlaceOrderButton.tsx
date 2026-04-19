"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { placeOrder } from "../orders/actions";

export default function PlaceOrderButton() {
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const router = useRouter();

  async function handleClick() {
    if (!confirm("注文を確定しますか？")) return;
    setLoading(true);
    try {
      const order = await placeOrder(couponCode.trim() || undefined);
      router.push(`/orders/${order.id}`);
    } catch (e) {
      alert(e instanceof Error ? e.message : "注文に失敗しました");
      setLoading(false);
    }
  }

  return (
    <div style={{ marginTop: "1rem" }}>
      <div style={{ marginBottom: "0.5rem" }}>
        <label>
          クーポンコード:{" "}
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            disabled={loading}
            style={{ padding: "0.25rem 0.5rem", fontSize: "1rem" }}
          />
        </label>
      </div>
      <button
        onClick={handleClick}
        disabled={loading}
        style={{ padding: "0.5rem 1rem", fontSize: "1rem" }}
      >
        {loading ? "処理中..." : "注文を確定する"}
      </button>
    </div>
  );
}
