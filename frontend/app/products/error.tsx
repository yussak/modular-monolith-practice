"use client";

export default function ProductsError({ error }: { error: Error }) {
  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>商品一覧</h1>
      <p style={{ color: "red" }}>{error.message}</p>
    </main>
  );
}
