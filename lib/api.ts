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
