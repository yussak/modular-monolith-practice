import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PlaceOrderButton from "../PlaceOrderButton";

const placeOrderMock = vi.fn();
const pushMock = vi.fn();

vi.mock("../../orders/actions", () => ({
  placeOrder: (...args: unknown[]) => placeOrderMock(...args),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(window, "confirm").mockReturnValue(true);
  vi.spyOn(window, "alert").mockImplementation(() => {});
});

describe("PlaceOrderButton", () => {
  it("クーポンコードなしで注文を確定し、注文詳細ページへ遷移する", async () => {
    placeOrderMock.mockResolvedValue({ id: 42 });
    render(<PlaceOrderButton />);
    await userEvent.click(screen.getByRole("button", { name: "注文を確定する" }));

    await waitFor(() => {
      expect(placeOrderMock).toHaveBeenCalledWith(undefined);
      expect(pushMock).toHaveBeenCalledWith("/orders/42");
    });
  });

  it("クーポンコードを入力すると placeOrder に渡される", async () => {
    placeOrderMock.mockResolvedValue({ id: 7 });
    render(<PlaceOrderButton />);
    await userEvent.type(screen.getByLabelText(/クーポンコード/), "SAVE10");
    await userEvent.click(screen.getByRole("button", { name: "注文を確定する" }));

    await waitFor(() => {
      expect(placeOrderMock).toHaveBeenCalledWith("SAVE10");
    });
  });

  it("確認ダイアログをキャンセルすると注文しない", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<PlaceOrderButton />);
    await userEvent.click(screen.getByRole("button", { name: "注文を確定する" }));

    expect(placeOrderMock).not.toHaveBeenCalled();
  });

  it("注文に失敗するとエラーメッセージを alert する", async () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    placeOrderMock.mockRejectedValue(new Error("カートが空です"));
    render(<PlaceOrderButton />);
    await userEvent.click(screen.getByRole("button", { name: "注文を確定する" }));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("カートが空です");
    });
  });
});
