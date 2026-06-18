import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Must import after mocking fetch
import {
  adminLogin,
  getUsers,
  getUser,
  updateUser,
  getRecipes,
  getDashboardStats,
  getSystemHealth,
  getSettings,
  updateSettings,
} from "../lib/api";

describe("API client", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  function mockJsonResponse(data: unknown, status = 200) {
    mockFetch.mockResolvedValueOnce({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(JSON.stringify(data)),
    });
  }

  // ── adminLogin ──

  it("sends correct login request", async () => {
    mockJsonResponse({ access_token: "tok_123" });
    const result = await adminLogin("admin@test.com", "pass");

    expect(result.access_token).toBe("tok_123");
    expect(mockFetch).toHaveBeenCalledOnce();

    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain("/auth/login");
    expect(opts.method).toBe("POST");
    expect(JSON.parse(opts.body)).toEqual({
      email: "admin@test.com",
      password: "pass",
    });
  });

  it("throws ApiError on failed login", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: () => Promise.resolve("Unauthorized"),
    });

    await expect(adminLogin("bad@test.com", "wrong")).rejects.toMatchObject({
      status: 401,
      message: "Unauthorized",
    });
  });

  // ── getUsers ──

  it("fetches users with auth header", async () => {
    mockJsonResponse({ users: [{ id: "1" }], total: 1 });
    const result = await getUsers("my-token", 1, 10);

    expect(result.users).toHaveLength(1);
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain("/admin/users?page=1&per_page=10");
    expect(opts.headers.Authorization).toBe("Bearer my-token");
  });

  it("uses default pagination for getUsers", async () => {
    mockJsonResponse({ users: [], total: 0 });
    await getUsers("tok");

    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain("page=1&per_page=20");
  });

  // ── getUser ──

  it("fetches single user", async () => {
    mockJsonResponse({ id: "abc", email: "u@test.com" });
    const result = await getUser("tok", "abc");

    expect(result.id).toBe("abc");
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain("/admin/users/abc");
  });

  // ── updateUser ──

  it("sends PATCH to update user", async () => {
    mockJsonResponse({ id: "abc", is_admin: true });
    await updateUser("tok", "abc", { is_admin: true });

    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain("/admin/users/abc");
    expect(opts.method).toBe("PATCH");
    expect(JSON.parse(opts.body)).toEqual({ is_admin: true });
  });

  // ── getRecipes ──

  it("fetches recipes from food API", async () => {
    mockJsonResponse({ recipes: [{ id: "r1" }], total: 1 });
    const result = await getRecipes("tok", 2, 5);

    expect(result.recipes).toHaveLength(1);
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain("/recipes?page=2&per_page=5");
  });

  // ── getDashboardStats ──

  it("fetches dashboard stats", async () => {
    const stats = { total_users: 10, total_recipes: 50, total_ingredients: 200, active_meal_plans: 5, ai_chats_today: 3, system_health: {} };
    mockJsonResponse(stats);
    const result = await getDashboardStats("tok");

    expect(result.total_users).toBe(10);
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain("/admin/stats");
  });

  // ── getSystemHealth ──

  it("fetches system health", async () => {
    mockJsonResponse({ food_db: "healthy", app_db: "healthy" });
    const result = await getSystemHealth("tok");

    expect(result.food_db).toBe("healthy");
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain("/admin/health");
  });

  // ── getSettings / updateSettings ──

  it("fetches settings", async () => {
    mockJsonResponse({ instance_name: "My Cookest" });
    const result = await getSettings("tok");

    expect(result.instance_name).toBe("My Cookest");
  });

  it("updates settings", async () => {
    mockJsonResponse({ ok: true });
    await updateSettings("tok", { maintenance: true });

    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain("/admin/settings");
    expect(opts.method).toBe("PATCH");
    expect(JSON.parse(opts.body)).toEqual({ maintenance: true });
  });

  // ── Content-Type header ──

  it("always sends Content-Type: application/json", async () => {
    mockJsonResponse({});
    await getSettings("tok");

    const [, opts] = mockFetch.mock.calls[0];
    expect(opts.headers["Content-Type"]).toBe("application/json");
  });
});
