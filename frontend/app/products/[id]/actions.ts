"use server";

import { apiFetch } from "@/lib/api";
import { redirect } from "next/navigation";

export async function deleteProduct(productId: number) {
  const res = await apiFetch(`/api/v1/products/${productId}`, { method: "DELETE" });
  if (res.ok) redirect("/products");
  if (res.status === 403) throw new Error("forbidden");
  throw new Error("failed");
}
