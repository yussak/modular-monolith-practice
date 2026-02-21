"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { setToken } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await apiFetch("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      setToken(data.token);
      router.push("/");
    } else {
      setError("メールアドレスまたはパスワードが正しくありません");
    }
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "400px" }}>
      <h1>ログイン</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">メールアドレス</label>
          <br />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", marginBottom: "1rem" }}
          />
        </div>
        <div>
          <label htmlFor="password">パスワード</label>
          <br />
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", marginBottom: "1rem" }}
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit">ログイン</button>
      </form>
      <p>
        アカウントをお持ちでない方は <a href="/auth/register">会員登録</a>
      </p>
    </main>
  );
}
