import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { apiFetch } from "@/lib/api";
import DeleteButton from "./DeleteButton";
import AddToCartButton from "../../cart/AddToCartButton";

type Product = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  user_id: number;
};

// データ取得・認証判定はサーバー側で行うべき by claude（ブラウザに機密情報を渡さない、APIキーを隠蔽する）。
// onClickなどのイベントハンドラもhooksも使わないためClient Componentにする理由がない。
async function fetchProduct(id: string): Promise<Product | null> {
  const res = await apiFetch(`/api/v1/products/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("商品の取得に失敗しました");
  return res.json();
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, session] = await Promise.all([fetchProduct(id), auth()]);

  if (!product) notFound();

  const currentUserId = (session?.user as { id?: string } | undefined)?.id;
  const isOwner = currentUserId === String(product.user_id);

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>{product.name}</h1>
      <p>価格: {product.price}円</p>
      {product.description && <p>説明: {product.description}</p>}
      <AddToCartButton productId={product.id} />
      {isOwner && <a href={`/products/${product.id}/edit`}>編集</a>}
      {isOwner && <DeleteButton productId={product.id} />}
    </main>
  );
}
