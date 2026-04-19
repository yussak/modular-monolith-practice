"use client";

import { useState, FormEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createCoupon } from "./actions";

export default function NewCouponPage() {
  const params = useParams();
  const productId = Number(params.id);
  const [discountType, setDiscountType] = useState("fixed");
  const [discountValue, setDiscountValue] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createCoupon(productId, {
        discount_type: discountType,
        discount_value: Number(discountValue),
        expires_at: new Date(expiresAt).toISOString(),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "クーポンの作成に失敗しました");
    }
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "400px" }}>
      <h1>クーポンを作成</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="discountType">割引種類</label>
          <br />
          <select
            id="discountType"
            value={discountType}
            onChange={(e) => setDiscountType(e.target.value)}
            style={{ width: "100%", marginBottom: "1rem" }}
          >
            <option value="fixed">固定額（円）</option>
            <option value="percentage">割合（%）</option>
          </select>
        </div>
        <div>
          <label htmlFor="discountValue">
            {discountType === "fixed" ? "割引額（円）" : "割引率（%）"}
          </label>
          <br />
          <input
            id="discountValue"
            type="number"
            min="1"
            max={discountType === "percentage" ? "100" : undefined}
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            required
            style={{ width: "100%", marginBottom: "1rem" }}
          />
        </div>
        <div>
          <label htmlFor="expiresAt">有効期限</label>
          <br />
          <input
            id="expiresAt"
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            required
            style={{ width: "100%", marginBottom: "1rem" }}
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit">作成する</button>
      </form>
      <p>
        <Link href={`/products/${productId}`}>商品詳細に戻る</Link>
      </p>
    </main>
  );
}
