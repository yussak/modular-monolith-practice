"use client";

import { deleteProduct } from "./actions";

export default function DeleteButton({ productId }: { productId: number }) {
  async function handleDelete() {
    if (!confirm("本当に削除しますか？")) return;
    try {
      await deleteProduct(productId);
    } catch (e) {
      if (e instanceof Error && e.message === "forbidden") {
        alert("削除する権限がありません");
      } else {
        alert("削除に失敗しました");
      }
    }
  }

  return (
    <button onClick={handleDelete} style={{ color: "white", background: "red", border: "none", padding: "0.5rem 1rem", cursor: "pointer" }}>
      削除
    </button>
  );
}
