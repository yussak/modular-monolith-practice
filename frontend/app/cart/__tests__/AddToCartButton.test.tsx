import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddToCartButton from "../AddToCartButton";

const addToCartMock = vi.fn();
const useSessionMock = vi.fn();

vi.mock("../actions", () => ({
  addToCart: (...args: unknown[]) => addToCartMock(...args),
}));

vi.mock("next-auth/react", () => ({
  useSession: () => useSessionMock(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("AddToCartButton", () => {
  it("未ログインなら何もレンダリングしない", () => {
    useSessionMock.mockReturnValue({ data: null });
    const { container } = render(<AddToCartButton productId={1} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("ログイン済みならボタンを表示する", () => {
    useSessionMock.mockReturnValue({ data: { user: { email: "x@example.com" } } });
    render(<AddToCartButton productId={1} />);
    expect(screen.getByRole("button", { name: "カートに追加" })).toBeInTheDocument();
  });

  it("クリックで addToCart(productId) を呼び、成功メッセージを出す", async () => {
    useSessionMock.mockReturnValue({ data: { user: {} } });
    addToCartMock.mockResolvedValue(undefined);
    render(<AddToCartButton productId={123} />);
    await userEvent.click(screen.getByRole("button", { name: "カートに追加" }));

    await waitFor(() => {
      expect(addToCartMock).toHaveBeenCalledWith(123);
      expect(screen.getByText("カートに追加しました")).toBeInTheDocument();
    });
  });

  it("失敗時にエラーメッセージを表示する", async () => {
    useSessionMock.mockReturnValue({ data: { user: {} } });
    addToCartMock.mockRejectedValue(new Error("商品が見つかりません"));
    render(<AddToCartButton productId={999} />);
    await userEvent.click(screen.getByRole("button", { name: "カートに追加" }));

    await waitFor(() => {
      expect(screen.getByText("商品が見つかりません")).toBeInTheDocument();
    });
  });
});
