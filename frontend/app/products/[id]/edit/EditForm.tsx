"use client";

import { useState, FormEvent } from "react";
import { updateProduct } from "./actions";

type Props = {
  product: {
    id: number;
    name: string;
    description: string | null;
    price: number;
  };
};

export default function EditForm({ product }: Props) {
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description ?? "");
  const [price, setPrice] = useState(String(product.price));
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await updateProduct(product.id, { name, description: description || null, price: Number(price) });
    } catch (e) {
      setError(e instanceof Error ? e.message : "商品の更新に失敗しました");
    }
  }

  return (
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
      <button type="submit">更新する</button>
    </form>
  );
}
