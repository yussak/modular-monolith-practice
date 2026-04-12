import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("next-auth/react", () => ({
  signIn: vi.fn(),
}));

import { signIn } from "next-auth/react";

vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:3000");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("RegisterPage", () => {
  it("フォームが表示される", async () => {
    const { default: RegisterPage } = await import("../page");
    render(<RegisterPage />);
    expect(screen.getByLabelText("名前")).toBeInTheDocument();
    expect(screen.getByLabelText("メールアドレス")).toBeInTheDocument();
    expect(screen.getByLabelText("パスワード")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "登録" })).toBeInTheDocument();
  });

  it("正常に登録できるとトップへリダイレクトする", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ token: "jwt-token" }),
    });
    vi.mocked(signIn).mockResolvedValue({ error: undefined, ok: true, status: 200, url: "" });

    const { default: RegisterPage } = await import("../page");
    render(<RegisterPage />);
    await userEvent.type(screen.getByLabelText("名前"), "テストユーザー");
    await userEvent.type(screen.getByLabelText("メールアドレス"), "test@example.com");
    await userEvent.type(screen.getByLabelText("パスワード"), "password123");
    await userEvent.click(screen.getByRole("button", { name: "登録" }));

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/v1/auth/register",
        expect.objectContaining({ method: "POST" })
      );
      expect(signIn).toHaveBeenCalledWith("credentials", {
        email: "test@example.com",
        password: "password123",
        redirect: false,
      });
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  it("登録失敗時にエラーメッセージを表示する", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ errors: ["Email has already been taken"] }),
    });

    const { default: RegisterPage } = await import("../page");
    render(<RegisterPage />);
    await userEvent.type(screen.getByLabelText("名前"), "テストユーザー");
    await userEvent.type(screen.getByLabelText("メールアドレス"), "test@example.com");
    await userEvent.type(screen.getByLabelText("パスワード"), "password123");
    await userEvent.click(screen.getByRole("button", { name: "登録" }));

    await waitFor(() => {
      expect(screen.getByText("Email has already been taken")).toBeInTheDocument();
    });
  });
});
