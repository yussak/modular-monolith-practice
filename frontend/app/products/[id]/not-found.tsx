import Link from "next/link";

export default function ProductNotFound() {
  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>商品が見つかりません</h1>
      <Link href="/products">商品一覧に戻る</Link>
    </main>
  );
}
