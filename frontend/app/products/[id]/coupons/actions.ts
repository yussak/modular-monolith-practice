"use server";

import { apiFetch } from "@/lib/api";
import { revalidatePath } from "next/cache";

export async function deleteCoupon(productId: number, couponId: number) {
  const res = await apiFetch(`/api/v1/products/${productId}/coupons/${couponId}`, {
    method: "DELETE",
  });
  if (res.ok) {
    revalidatePath(`/products/${productId}`);
    return;
  }
  if (res.status === 403) throw new Error("forbidden");
  throw new Error("failed");
}
