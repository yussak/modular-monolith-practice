import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CartItemRow from "../CartItemRow";

const updateMock = vi.fn();
const removeMock = vi.fn();

vi.mock("../actions", () => ({
  updateCartItemQuantity: (...args: unknown[]) => updateMock(...args),
  removeCartItem: (...args: unknown[]) => removeMock(...args),
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(window, "confirm").mockReturnValue(true);
  vi.spyOn(window, "alert").mockImplementation(() => {});
});

function renderRow(overrides = {}) {
  const item = {
    id: 1,
    product_id: 10,
    product_name: "商品A",
    unit_price: 1000,
    quantity: 2,
    subtotal: 2000,
    product_deleted: false,
    ...overrides,
  };
  return render(
    <table>
      <tbody>
        <CartItemRow item={item} />
      </tbody>
    </table>
  );
}

describe("CartItemRow", () => {
  it("商品情報と小計を表示する", () => {
    renderRow();
    expect(screen.getByText("商品A")).toBeInTheDocument();
    expect(screen.getByText("1000円")).toBeInTheDocument();
    expect(screen.getByText("2000円")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("+ ボタンで数量を +1 する", async () => {
    renderRow({ quantity: 2 });
    await userEvent.click(screen.getByRole("button", { name: "＋" }));
    expect(updateMock).toHaveBeenCalledWith(1, 3);
  });

  it("− ボタンで数量を -1 する", async () => {
    renderRow({ quantity: 2 });
    await userEvent.click(screen.getByRole("button", { name: "−" }));
    expect(updateMock).toHaveBeenCalledWith(1, 1);
  });

  it("数量 1 のとき − ボタンは無効化される", () => {
    renderRow({ quantity: 1 });
    expect(screen.getByRole("button", { name: "−" })).toBeDisabled();
  });

  it("削除ボタンで removeCartItem を呼ぶ", async () => {
    renderRow();
    await userEvent.click(screen.getByRole("button", { name: "削除" }));
    expect(removeMock).toHaveBeenCalledWith(1);
  });

  it("確認ダイアログでキャンセルすると削除しない", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    renderRow();
    await userEvent.click(screen.getByRole("button", { name: "削除" }));
    expect(removeMock).not.toHaveBeenCalled();
  });

  it("product_deleted=true のとき削除メッセージを表示し数量操作ボタンを出さない", () => {
    renderRow({ product_deleted: true });
    expect(screen.getByText(/この商品は削除されました/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "＋" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "−" })).not.toBeInTheDocument();
  });
});
