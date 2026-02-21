import { describe, it, expect, beforeEach } from "vitest";
import { getToken, setToken, removeToken } from "../auth";

beforeEach(() => {
  document.cookie = "auth_token=; path=/; max-age=0";
});

describe("auth utilities", () => {
  it("setToken でトークンを保存できる", () => {
    setToken("test-token");
    expect(getToken()).toBe("test-token");
  });

  it("removeToken でトークンを削除できる", () => {
    setToken("test-token");
    removeToken();
    expect(getToken()).toBeNull();
  });

  it("トークンがないとき getToken は null を返す", () => {
    expect(getToken()).toBeNull();
  });
});
