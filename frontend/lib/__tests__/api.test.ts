import { describe, it, expect, beforeEach, vi } from "vitest";

const authMock = vi.fn();
const redirectMock = vi.fn((url: string) => {
  throw new Error(`NEXT_REDIRECT:${url}`);
});

vi.mock("@/auth", () => ({
  auth: () => authMock(),
}));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => redirectMock(url),
}));

import { apiFetch } from "../api";

const fetchMock = vi.fn();

beforeEach(() => {
  authMock.mockReset();
  redirectMock.mockReset();
  redirectMock.mockImplementation((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  });
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
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("session が null のとき Authorization ヘッダーを付けない", async () => {
    authMock.mockResolvedValue(null);
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }));

    await apiFetch("/api/v1/products");

    const [, init] = fetchMock.mock.calls[0];
    expect((init.headers as Record<string, string>).Authorization).toBeUndefined();
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("401 のとき /auth/logout へリダイレクトする", async () => {
    authMock.mockResolvedValue({ apiToken: "expired-token" });
    fetchMock.mockResolvedValue(new Response(null, { status: 401 }));

    await expect(apiFetch("/api/v1/products", { method: "POST" })).rejects.toThrow("NEXT_REDIRECT:/auth/logout");
    expect(redirectMock).toHaveBeenCalledWith("/auth/logout");
  });

  it("200 のときリダイレクトしない", async () => {
    authMock.mockResolvedValue({ apiToken: "token" });
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }));

    await apiFetch("/api/v1/products");

    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("INTERNAL_API_URL が未設定ならエラー", async () => {
    delete process.env.INTERNAL_API_URL;
    await expect(apiFetch("/api/v1/products")).rejects.toThrow("INTERNAL_API_URL is not set");
  });
});
