async function fetchHealth() {
  const apiUrl = process.env.INTERNAL_API_URL ?? "http://localhost:3000";
  const res = await fetch(`${apiUrl}/api/v1/health`, { cache: "no-store" });
  if (!res.ok) throw new Error("API request failed");
  return res.json() as Promise<{ message: string; status: string }>;
}

export default async function Home() {
  let data: { message: string; status: string } | null = null;
  let error: string | null = null;

  try {
    data = await fetchHealth();
  } catch (e) {
    error = e instanceof Error ? e.message : "Unknown error";
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>EC Site - Modular Monolith Practice</h1>
      <h2>Rails API 疎通確認</h2>
      {data ? (
        <div style={{ color: "green" }}>
          <p>ステータス: {data.status}</p>
          <p>メッセージ: {data.message}</p>
        </div>
      ) : (
        <div style={{ color: "red" }}>
          <p>エラー: {error}</p>
        </div>
      )}
    </main>
  );
}
