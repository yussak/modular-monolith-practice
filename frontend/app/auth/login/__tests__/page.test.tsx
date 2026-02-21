import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "../page";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/lib/api", () => ({
  apiFetch: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  setToken: vi.fn(),
}));

import { apiFetch } from "@/lib/api";
import { setToken } from "@/lib/auth";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("LoginPage", () => {
  it("フォームが表示される", () => {
    render(<LoginPage />);
    expect(screen.getByLabelText("メールアドレス")).toBeInTheDocument();
    expect(screen.getByLabelText("パスワード")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ログイン" })).toBeInTheDocument();
  });

  it("正常にログインできるとトップへリダイレクトする", async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      ok: true,
      json: async () => ({ token: "jwt-token" }),
    } as Response);

    render(<LoginPage />);
    await userEvent.type(screen.getByLabelText("メールアドレス"), "test@example.com");
    await userEvent.type(screen.getByLabelText("パスワード"), "password123");
    await userEvent.click(screen.getByRole("button", { name: "ログイン" }));

    await waitFor(() => {
      expect(setToken).toHaveBeenCalledWith("jwt-token");
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  it("ログイン失敗時にエラーメッセージを表示する", async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Invalid email or password" }),
    } as Response);

    render(<LoginPage />);
    await userEvent.type(screen.getByLabelText("メールアドレス"), "test@example.com");
    await userEvent.type(screen.getByLabelText("パスワード"), "wrongpassword");
    await userEvent.click(screen.getByRole("button", { name: "ログイン" }));

    await waitFor(() => {
      expect(
        screen.getByText("メールアドレスまたはパスワードが正しくありません")
      ).toBeInTheDocument();
    });
  });
});
