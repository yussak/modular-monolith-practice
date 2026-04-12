"use server";

import { apiFetch } from "@/lib/api";
import { redirect } from "next/navigation";

export async function updateProduct(
  productId: number,
  formData: { name: string; description: string | null; price: number }
) {
  const res = await apiFetch(`/api/v1/products/${productId}`, {
    method: "PATCH",
    body: JSON.stringify(formData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.errors?.join(", ") ?? data.error ?? "商品の更新に失敗しました");
  redirect(`/products/${productId}`);
}
