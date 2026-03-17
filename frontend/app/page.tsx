import Link from "next/link";
import LogoutButton from "./_components/LogoutButton";

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <LogoutButton />
      </div>
      <Link href="/products/" style={{ display: "inline-block", marginBottom: "1rem" }}>
        <h2>商品一覧</h2>
      </Link>
    </main>
  );
}
