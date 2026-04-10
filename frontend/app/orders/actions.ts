"use server";

import { apiFetch } from "@/lib/api";
import { revalidatePath } from "next/cache";

export async function placeOrder() {
  const res = await apiFetch("/api/v1/orders", {
    method: "POST",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "注文に失敗しました");
  revalidatePath("/cart");
  revalidatePath("/orders");
  return data;
}

export async function cancelOrder(orderId: number) {
  const res = await apiFetch(`/api/v1/orders/${orderId}/cancel`, {
    method: "PATCH",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "キャンセルに失敗しました");
  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
  return data;
}
