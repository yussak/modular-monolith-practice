"use client";

import { useRouter } from "next/navigation";
import { apiFetch } from "../../lib/api";

export default function DeleteProductButton({ productId }: { productId: number }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("本当に削除しますか？")) return;
    const res = await apiFetch(`/api/v1/products/${productId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/products");
    } else {
      alert("削除に失敗しました");
    }
  }

  return (
    <button onClick={handleDelete}>削除</button>
  );
}
