"use client";

import { useState, FormEvent } from "react";
import { createProduct } from "./actions";

export default function NewProductPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createProduct({ name, description: description || null, price: Number(price) });
    } catch (e) {
      setError(e instanceof Error ? e.message : "商品の作成に失敗しました");
    }
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "400px" }}>
      <h1>商品を登録</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">商品名</label>
          <br />
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: "100%", marginBottom: "1rem" }}
          />
        </div>
        <div>
          <label htmlFor="description">説明（任意）</label>
          <br />
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ width: "100%", marginBottom: "1rem" }}
          />
        </div>
        <div>
          <label htmlFor="price">価格（円）</label>
          <br />
          <input
            id="price"
            type="number"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            style={{ width: "100%", marginBottom: "1rem" }}
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit">登録する</button>
      </form>
      <p>
        <a href="/products">商品一覧に戻る</a>
      </p>
    </main>
  );
}
