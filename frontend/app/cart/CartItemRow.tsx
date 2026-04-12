"use client";

import { useState } from "react";
import { updateCartItemQuantity, removeCartItem } from "./actions";

type CartItem = {
  id: number;
  product_id: number;
  product_name: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
  product_deleted: boolean;
};

export default function CartItemRow({ item }: { item: CartItem }) {
  const [loading, setLoading] = useState(false);

  async function handleQuantityChange(delta: number) {
    setLoading(true);
    try {
      await updateCartItemQuantity(item.id, item.quantity + delta);
    } catch (e) {
      alert(e instanceof Error ? e.message : "エラーが発生しました");
    }
    setLoading(false);
  }

  async function handleRemove() {
    if (!confirm("カートから削除しますか？")) return;
    setLoading(true);
    try {
      await removeCartItem(item.id);
    } catch (e) {
      alert(e instanceof Error ? e.message : "エラーが発生しました");
    }
    setLoading(false);
  }

  if (item.product_deleted) {
    return (
      <tr style={{ color: "#999" }}>
        <td style={{ padding: "0.5rem" }}>
          {item.product_name}（この商品は削除されました）
        </td>
        <td colSpan={3}></td>
        <td style={{ padding: "0.5rem" }}>
          <button onClick={handleRemove} disabled={loading}>削除</button>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td style={{ padding: "0.5rem" }}>{item.product_name}</td>
      <td style={{ textAlign: "right", padding: "0.5rem" }}>{item.unit_price}円</td>
      <td style={{ textAlign: "center", padding: "0.5rem" }}>
        <button onClick={() => handleQuantityChange(-1)} disabled={loading || item.quantity <= 1}>−</button>
        <span style={{ margin: "0 0.5rem" }}>{item.quantity}</span>
        <button onClick={() => handleQuantityChange(1)} disabled={loading}>＋</button>
      </td>
      <td style={{ textAlign: "right", padding: "0.5rem" }}>{item.subtotal}円</td>
      <td style={{ padding: "0.5rem" }}>
        <button onClick={handleRemove} disabled={loading}>削除</button>
      </td>
    </tr>
  );
}
