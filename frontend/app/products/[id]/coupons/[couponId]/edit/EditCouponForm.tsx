"use client";

import { useState, FormEvent } from "react";
import { updateCoupon } from "./actions";

type Props = {
  productId: number;
  coupon: {
    id: number;
    discount_type: "fixed" | "percentage";
    discount_value: number;
    expires_at: string;
  };
};

export default function EditCouponForm({ productId, coupon }: Props) {
  const [discountType, setDiscountType] = useState(coupon.discount_type);
  const [discountValue, setDiscountValue] = useState(String(coupon.discount_value));
  const [expiresAt, setExpiresAt] = useState(coupon.expires_at.slice(0, 10));
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await updateCoupon(productId, coupon.id, {
        discount_type: discountType,
        discount_value: Number(discountValue),
        expires_at: new Date(expiresAt).toISOString(),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "クーポンの更新に失敗しました");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="discountType">割引種類</label>
        <br />
        <select
          id="discountType"
          value={discountType}
          onChange={(e) => setDiscountType(e.target.value as "fixed" | "percentage")}
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
      <button type="submit">更新する</button>
    </form>
  );
}
