"use client";

import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function DeleteButton({ productId }: { productId: number }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("本当に削除しますか？")) return;
    const res = await apiFetch(`/api/v1/products/${productId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/products");
    } else if (res.status === 403) {
      alert("削除する権限がありません");
    } else {
      alert("削除に失敗しました");
    }
  }

  return (
    <button onClick={handleDelete} style={{ color: "white", background: "red", border: "none", padding: "0.5rem 1rem", cursor: "pointer" }}>
      削除
    </button>
  );
}
