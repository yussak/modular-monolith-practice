"use server";

import { apiFetch } from "@/lib/api";
import { redirect } from "next/navigation";

export async function createProduct(formData: { name: string; description: string | null; price: number }) {
  const res = await apiFetch("/api/v1/products", {
    method: "POST",
    body: JSON.stringify(formData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.errors?.join(", ") ?? "商品の作成に失敗しました");
  redirect(`/products/${data.id}`);
}
