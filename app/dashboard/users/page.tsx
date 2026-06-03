"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { getUsers, updateUser } from "@/lib/api";

export default function UsersPage() {
  const token = useAuth((s) => s.token);
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!token) return;
    getUsers(token, page)
      .then((data) => {
        setUsers(data.users);
        setTotal(data.total);
      })
      .catch(() => {});
  }, [token, page]);

  const filteredUsers = search
    ? users.filter(
        (u) =>
          u.name?.toLowerCase().includes(search.toLowerCase()) ||
          u.email?.toLowerCase().includes(search.toLowerCase())
      )
    : users;

  async function toggleAdmin(userId: string, isAdmin: boolean) {
    if (!token) return;
    await updateUser(token, userId, { is_admin: !isAdmin });
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, is_admin: !isAdmin } : u))
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-heading font-bold">Users</h1>
        <p className="text-on-surface-dim">{total} total</p>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="w-full max-w-sm px-3 py-2 border border-surface-container-high rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="bg-surface rounded-xl shadow-sm border border-surface-container overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-container bg-surface-dim">
              <th className="text-left px-4 py-3 font-medium text-on-surface-dim">Name</th>
              <th className="text-left px-4 py-3 font-medium text-on-surface-dim">Email</th>
              <th className="text-left px-4 py-3 font-medium text-on-surface-dim">Tier</th>
              <th className="text-left px-4 py-3 font-medium text-on-surface-dim">Admin</th>
              <th className="text-left px-4 py-3 font-medium text-on-surface-dim">Joined</th>
              <th className="text-left px-4 py-3 font-medium text-on-surface-dim">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b border-surface-container last:border-0 hover:bg-surface-dim transition-colors">
                <td className="px-4 py-3 font-medium">{user.name || "—"}</td>
                <td className="px-4 py-3 text-on-surface-dim">{user.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      user.subscription_tier === "pro"
                        ? "bg-primary/10 text-primary"
                        : user.subscription_tier === "family"
                        ? "bg-info/10 text-info"
                        : "bg-surface-container text-on-surface-dim"
                    }`}
                  >
                    {user.subscription_tier || "free"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {user.is_admin ? (
                    <span className="text-primary font-medium">Yes</span>
                  ) : (
                    <span className="text-on-surface-muted">No</span>
                  )}
                </td>
                <td className="px-4 py-3 text-on-surface-dim">
                  {user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleAdmin(user.id, user.is_admin)}
                    className="text-xs px-2 py-1 rounded border border-surface-container-high hover:bg-surface-dim transition-colors"
                  >
                    {user.is_admin ? "Remove admin" : "Make admin"}
                  </button>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-on-surface-dim">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > 20 && (
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded border border-surface-container-high disabled:opacity-30"
          >
            Previous
          </button>
          <span className="px-3 py-1.5 text-on-surface-dim">
            Page {page} of {Math.ceil(total / 20)}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page * 20 >= total}
            className="px-3 py-1.5 rounded border border-surface-container-high disabled:opacity-30"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
