import Link from "next/link";

type Product = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  user_id: number;
};

async function fetchProducts(): Promise<Product[]> {
  const apiUrl = process.env.INTERNAL_API_URL;
  if (!apiUrl) throw new Error("INTERNAL_API_URL is not set");
  const res = await fetch(`${apiUrl}/api/v1/products`, { cache: "no-store" });
  if (!res.ok) throw new Error("商品の取得に失敗しました");
  return res.json();
}

export default async function ProductsPage() {
  const products = await fetchProducts();

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>商品一覧</h1>
      {products.length === 0 ? (
        <p>商品がありません</p>
      ) : (
        <ul>
          {products.map((product) => (
            <li key={product.id} style={{ marginBottom: "1rem" }}>
              <Link href={`/products/${product.id}`} style={{ color: "blue", textDecoration: "underline" }}>
                <strong>{product.name}</strong>
              </Link>{" "}
              — {product.price}円
              {product.description && <p>{product.description}</p>}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
