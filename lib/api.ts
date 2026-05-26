const API_BASE = process.env.APP_API_INTERNAL_URL || process.env.NEXT_PUBLIC_APP_API_URL || "http://localhost:8080";
const FOOD_API_BASE = process.env.FOOD_API_INTERNAL_URL || process.env.NEXT_PUBLIC_FOOD_API_URL || "http://localhost:8081";

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
  return request<{ access_token: string }>(`${API_BASE}/auth/login`, {
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
