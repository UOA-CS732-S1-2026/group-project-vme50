import { beforeEach, describe, expect, it } from "vitest";

import { clearAuth, getUser, isAuthenticated, setAuth, TOKEN_KEY, USER_KEY } from "./auth.util";

describe("auth utilities", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("reports unauthenticated when no token exists", () => {
    expect(isAuthenticated()).toBe(false);
  });

  it("reports authenticated when a token exists", () => {
    window.localStorage.setItem(TOKEN_KEY, "test-token");

    expect(isAuthenticated()).toBe(true);
  });

  it("stores token and normalizes user id during login", () => {
    setAuth("test-token", {
      id: "user-1",
      name: "Test User",
      email: "test@aucklanduni.ac.nz",
    });

    expect(window.localStorage.getItem(TOKEN_KEY)).toBe("test-token");
    expect(getUser()).toEqual({
      id: "user-1",
      _id: "user-1",
      name: "Test User",
      email: "test@aucklanduni.ac.nz",
    });
  });

  it("returns null when stored user JSON is invalid", () => {
    window.localStorage.setItem(USER_KEY, "{bad-json");

    expect(getUser()).toBeNull();
  });

  it("clears token and user details during logout", () => {
    setAuth("test-token", {
      _id: "user-1",
      name: "Test User",
      email: "test@aucklanduni.ac.nz",
    });

    clearAuth();

    expect(window.localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(window.localStorage.getItem(USER_KEY)).toBeNull();
    expect(isAuthenticated()).toBe(false);
  });
});
