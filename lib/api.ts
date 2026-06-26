const getApiBase = () => {
  if (process.env.NEXT_PUBLIC_APP_API_URL) {
    return process.env.NEXT_PUBLIC_APP_API_URL;
  }
  if (process.env.APP_API_INTERNAL_URL) {
    return process.env.APP_API_INTERNAL_URL;
  }
  if (typeof window !== "undefined") {
    // Dynamically fallback to the current page hostname (e.g. 192.168.x.x) on port 8080 for local network testing
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    return `${protocol}//${hostname}:8080`;
  }
  return "http://localhost:8080";
};

const getFoodApiBase = () => {
  if (process.env.NEXT_PUBLIC_FOOD_API_URL) {
    return process.env.NEXT_PUBLIC_FOOD_API_URL;
  }
  if (process.env.FOOD_API_INTERNAL_URL) {
    return process.env.FOOD_API_INTERNAL_URL;
  }
  if (typeof window !== "undefined") {
    // Dynamically fallback to the current page hostname (e.g. 192.168.x.x) on port 8081 for local network testing
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    return `${protocol}//${hostname}:8081`;
  }
  return "http://localhost:8081";
};

const API_BASE = getApiBase();
const FOOD_API_BASE = getFoodApiBase();

export interface ApiError {
  status: number;
  message: string;
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw { status: res.status, message: body } satisfies ApiError;
  }

  return res.json();
}

// ── Auth ──
export async function adminLogin(email: string, password: string) {
  return request<{ access_token: string }>(`${API_BASE}/api/auth/login`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

// ── Users ──
export async function getUsers(token: string, page = 1, perPage = 20) {
  return request<{ users: any[]; total: number }>(
    `${API_BASE}/admin/users?page=${page}&per_page=${perPage}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

export async function getUser(token: string, id: string) {
  return request<any>(`${API_BASE}/admin/users/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function updateUser(token: string, id: string, data: Record<string, unknown>) {
  return request<any>(`${API_BASE}/admin/users/${id}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}

// ── Recipes ──
export async function getRecipes(token: string, page = 1, perPage = 20) {
  return request<{ recipes: any[]; total: number }>(
    `${FOOD_API_BASE}/recipes?page=${page}&per_page=${perPage}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

// ── Stats ──
export async function getDashboardStats(token: string) {
  return request<{
    total_users: number;
    total_recipes: number;
    total_ingredients: number;
    active_meal_plans: number;
    ai_chats_today: number;
    system_health: Record<string, string>;
  }>(`${API_BASE}/admin/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ── System ──
export async function getSystemHealth(token: string) {
  return request<Record<string, any>>(`${API_BASE}/admin/health`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ── Settings ──
export async function getSettings(token: string) {
  return request<Record<string, any>>(`${API_BASE}/admin/settings`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function updateSettings(token: string, settings: Record<string, unknown>) {
  return request<any>(`${API_BASE}/admin/settings`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(settings),
  });
}
