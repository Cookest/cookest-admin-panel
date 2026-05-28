"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { adminLogin } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setToken = useAuth((s) => s.setToken);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { access_token } = await adminLogin(email, password);
      setToken(access_token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-dim">
      <div className="w-full max-w-md p-8 bg-surface rounded-xl shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold text-primary">🍳 Cookest</h1>
          <p className="text-on-surface-dim mt-2">Admin Panel</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-danger/10 text-danger rounded-md text-sm">{error}</div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-on-surface mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-surface-container-high rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="admin@cookest.local"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-on-surface mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-surface-container-high rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 font-medium"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
