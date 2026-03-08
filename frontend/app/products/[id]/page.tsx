import { notFound } from "next/navigation";

type Product = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  user_id: number;
};

async function fetchProduct(id: string): Promise<Product | null> {
  const apiUrl = process.env.INTERNAL_API_URL;
  if (!apiUrl) throw new Error("INTERNAL_API_URL is not set");
  const res = await fetch(`${apiUrl}/api/v1/products/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("商品の取得に失敗しました");
  return res.json();
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await fetchProduct(id);

  if (!product) notFound();

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>{product.name}</h1>
      <p>価格: {product.price}円</p>
      {product.description && <p>説明: {product.description}</p>}
    </main>
  );
}
