"use server";

import { apiFetch } from "@/lib/api";
import { redirect } from "next/navigation";

export async function updateCoupon(
  productId: number,
  couponId: number,
  formData: { discount_type: string; discount_value: number; expires_at: string }
) {
  const res = await apiFetch(`/api/v1/products/${productId}/coupons/${couponId}`, {
    method: "PATCH",
    body: JSON.stringify(formData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.errors?.join(", ") ?? data.error ?? "クーポンの更新に失敗しました");
  redirect(`/products/${productId}`);
}
