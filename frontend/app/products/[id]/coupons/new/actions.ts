"use server";

import { apiFetch } from "@/lib/api";
import { redirect } from "next/navigation";

export async function createCoupon(
  productId: number,
  formData: { discount_type: string; discount_value: number; expires_at: string }
) {
  const res = await apiFetch(`/api/v1/products/${productId}/coupons`, {
    method: "POST",
    body: JSON.stringify(formData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.errors?.join(", ") ?? "クーポンの作成に失敗しました");
  redirect(`/products/${productId}`);
}
