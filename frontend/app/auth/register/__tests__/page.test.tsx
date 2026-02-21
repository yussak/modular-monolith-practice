import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterPage from "../page";

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

describe("RegisterPage", () => {
  it("フォームが表示される", () => {
    render(<RegisterPage />);
    expect(screen.getByLabelText("メールアドレス")).toBeInTheDocument();
    expect(screen.getByLabelText("パスワード")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "登録" })).toBeInTheDocument();
  });

  it("正常に登録できるとトップへリダイレクトする", async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      ok: true,
      json: async () => ({ token: "jwt-token" }),
    } as Response);

    render(<RegisterPage />);
    await userEvent.type(screen.getByLabelText("メールアドレス"), "test@example.com");
    await userEvent.type(screen.getByLabelText("パスワード"), "password123");
    await userEvent.click(screen.getByRole("button", { name: "登録" }));

    await waitFor(() => {
      expect(setToken).toHaveBeenCalledWith("jwt-token");
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  it("登録失敗時にエラーメッセージを表示する", async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      ok: false,
      json: async () => ({ errors: ["Email has already been taken"] }),
    } as Response);

    render(<RegisterPage />);
    await userEvent.type(screen.getByLabelText("メールアドレス"), "test@example.com");
    await userEvent.type(screen.getByLabelText("パスワード"), "password123");
    await userEvent.click(screen.getByRole("button", { name: "登録" }));

    await waitFor(() => {
      expect(screen.getByText("Email has already been taken")).toBeInTheDocument();
    });
  });
});
