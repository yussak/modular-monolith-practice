import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { apiFetch } from "@/lib/api";
import EditCouponForm from "./EditCouponForm";

type Product = {
  id: number;
  user_id: number;
};

type Coupon = {
  id: number;
  code: string;
  discount_type: "fixed" | "percentage";
  discount_value: number;
  expires_at: string;
  product_id: number;
};

async function fetchProduct(id: string): Promise<Product | null> {
  const res = await apiFetch(`/api/v1/products/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("商品の取得に失敗しました");
  return res.json();
}

async function fetchCoupons(productId: number): Promise<Coupon[]> {
  const res = await apiFetch(`/api/v1/products/${productId}/coupons`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export default async function EditCouponPage({
  params,
}: {
  params: Promise<{ id: string; couponId: string }>;
}) {
  const { id, couponId } = await params;
  const [product, session] = await Promise.all([fetchProduct(id), auth()]);

  if (!product) notFound();

  const currentUserId = (session?.user as { id?: string } | undefined)?.id;
  if (currentUserId !== String(product.user_id)) notFound();

  const coupons = await fetchCoupons(product.id);
  const coupon = coupons.find((c) => c.id === Number(couponId));
  if (!coupon) notFound();

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "400px" }}>
      <h1>クーポンを編集</h1>
      <EditCouponForm productId={product.id} coupon={coupon} />
      <p>
        <a href={`/products/${product.id}`}>商品詳細に戻る</a>
      </p>
    </main>
  );
}
