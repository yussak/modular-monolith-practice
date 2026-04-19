import { describe, it, expect, beforeEach, vi } from "vitest";

const authMock = vi.fn();
const signOutMock = vi.fn();

vi.mock("@/auth", () => ({
  auth: () => authMock(),
  signOut: (args: unknown) => signOutMock(args),
}));

import { apiFetch } from "../api";

const fetchMock = vi.fn();

beforeEach(() => {
  authMock.mockReset();
  signOutMock.mockReset();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  process.env.INTERNAL_API_URL = "http://backend:3000";
});

describe("apiFetch", () => {
  it("session があるとき Authorization ヘッダーを付ける", async () => {
    authMock.mockResolvedValue({ apiToken: "token-abc" });
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }));

    await apiFetch("/api/v1/products");

    const [, init] = fetchMock.mock.calls[0];
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer token-abc");
    expect(signOutMock).not.toHaveBeenCalled();
  });

  it("session が null のとき Authorization ヘッダーを付けない", async () => {
    authMock.mockResolvedValue(null);
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }));

    await apiFetch("/api/v1/products");

    const [, init] = fetchMock.mock.calls[0];
    expect((init.headers as Record<string, string>).Authorization).toBeUndefined();
    expect(signOutMock).not.toHaveBeenCalled();
  });

  it("401 のとき signOut を /auth/login で呼ぶ", async () => {
    authMock.mockResolvedValue({ apiToken: "expired-token" });
    fetchMock.mockResolvedValue(new Response(null, { status: 401 }));

    await apiFetch("/api/v1/products", { method: "POST" });

    expect(signOutMock).toHaveBeenCalledWith({ redirectTo: "/auth/login" });
  });

  it("200 のとき signOut を呼ばない", async () => {
    authMock.mockResolvedValue({ apiToken: "token" });
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }));

    await apiFetch("/api/v1/products");

    expect(signOutMock).not.toHaveBeenCalled();
  });

  it("INTERNAL_API_URL が未設定ならエラー", async () => {
    delete process.env.INTERNAL_API_URL;
    await expect(apiFetch("/api/v1/products")).rejects.toThrow("INTERNAL_API_URL is not set");
  });
});
