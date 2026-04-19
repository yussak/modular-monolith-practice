import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

type OrderSummary = {
  id: number;
  order_number: string;
  status: string;
  subtotal: number;
  discount_amount: number;
  total: number;
  created_at: string;
};

async function fetchOrders(): Promise<OrderSummary[]> {
  const res = await apiFetch("/api/v1/orders", { cache: "no-store" });
  if (!res.ok) throw new Error("注文履歴の取得に失敗しました");
  return res.json();
}

function statusLabel(status: string): string {
  switch (status) {
    case "confirmed": return "確定済み";
    case "cancelled": return "キャンセル済み";
    default: return status;
  }
}

export default async function OrdersPage() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const orders = await fetchOrders();

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>注文履歴</h1>
      {orders.length === 0 ? (
        <p>注文履歴はありません</p>
      ) : (
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: "0.5rem" }}>注文番号</th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: "0.5rem" }}>日時</th>
              <th style={{ textAlign: "right", borderBottom: "1px solid #ccc", padding: "0.5rem" }}>合計</th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: "0.5rem" }}>ステータス</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td style={{ padding: "0.5rem" }}>
                  <Link href={`/orders/${order.id}`} style={{ color: "blue", textDecoration: "underline" }}>
                    {order.order_number.slice(0, 8)}...
                  </Link>
                </td>
                <td style={{ padding: "0.5rem" }}>{new Date(order.created_at).toLocaleString("ja-JP")}</td>
                <td style={{ textAlign: "right", padding: "0.5rem" }}>
                  {order.total}円
                  {order.discount_amount > 0 && (
                    <span style={{ fontSize: "0.8em", color: "#888", marginLeft: "0.3rem" }}>
                      (-{order.discount_amount}円)
                    </span>
                  )}
                </td>
                <td style={{ padding: "0.5rem" }}>{statusLabel(order.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
