import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "../page";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("next-auth/react", () => ({
  signIn: vi.fn(),
}));

import { signIn } from "next-auth/react";

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
    vi.mocked(signIn).mockResolvedValue({ error: undefined, ok: true, status: 200, url: "" });

    render(<LoginPage />);
    await userEvent.type(screen.getByLabelText("メールアドレス"), "test@example.com");
    await userEvent.type(screen.getByLabelText("パスワード"), "password123");
    await userEvent.click(screen.getByRole("button", { name: "ログイン" }));

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith("credentials", {
        email: "test@example.com",
        password: "password123",
        redirect: false,
      });
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  it("ログイン失敗時にエラーメッセージを表示する", async () => {
    vi.mocked(signIn).mockResolvedValue({ error: "CredentialsSignin", ok: false, status: 401, url: "" });

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
