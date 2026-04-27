import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CancelOrderButton from "../CancelOrderButton";

const cancelOrderMock = vi.fn();
const refreshMock = vi.fn();

vi.mock("../../actions", () => ({
  cancelOrder: (...args: unknown[]) => cancelOrderMock(...args),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: refreshMock }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(window, "confirm").mockReturnValue(true);
  vi.spyOn(window, "alert").mockImplementation(() => {});
});

describe("CancelOrderButton", () => {
  it("クリックで cancelOrder を呼び、router.refresh() する", async () => {
    cancelOrderMock.mockResolvedValue({ id: 1, status: "cancelled" });
    render(<CancelOrderButton orderId={1} />);
    await userEvent.click(screen.getByRole("button", { name: "注文をキャンセル" }));

    await waitFor(() => {
      expect(cancelOrderMock).toHaveBeenCalledWith(1);
      expect(refreshMock).toHaveBeenCalled();
    });
  });

  it("確認ダイアログをキャンセルすると処理しない", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<CancelOrderButton orderId={1} />);
    await userEvent.click(screen.getByRole("button", { name: "注文をキャンセル" }));

    expect(cancelOrderMock).not.toHaveBeenCalled();
  });

  it("失敗時に alert する", async () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    cancelOrderMock.mockRejectedValue(new Error("すでにキャンセル済みです"));
    render(<CancelOrderButton orderId={2} />);
    await userEvent.click(screen.getByRole("button", { name: "注文をキャンセル" }));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("すでにキャンセル済みです");
    });
  });
});
