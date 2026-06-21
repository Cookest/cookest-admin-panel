import { describe, it, expect, beforeEach } from "vitest";
import { useAuth } from "../lib/auth";

describe("Auth store", () => {
  beforeEach(() => {
    // Reset state between tests
    useAuth.setState({ token: null });
  });

  it("starts with null token", () => {
    expect(useAuth.getState().token).toBeNull();
  });

  it("sets token", () => {
    useAuth.getState().setToken("tok_abc");
    expect(useAuth.getState().token).toBe("tok_abc");
  });

  it("clears token on logout", () => {
    useAuth.getState().setToken("tok_abc");
    useAuth.getState().logout();
    expect(useAuth.getState().token).toBeNull();
  });

  it("replaces token when set again", () => {
    useAuth.getState().setToken("tok_1");
    useAuth.getState().setToken("tok_2");
    expect(useAuth.getState().token).toBe("tok_2");
  });

  it("can set token to null explicitly", () => {
    useAuth.getState().setToken("tok_1");
    useAuth.getState().setToken(null);
    expect(useAuth.getState().token).toBeNull();
  });
});
