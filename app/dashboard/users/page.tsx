"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { getUsers, updateUser } from "@/lib/api";
import { Card, CardBody, Badge, Button, Input, Modal, Select, Alert } from "@cookest/ui";
import { Users as UsersIcon, Search, Pencil } from "lucide-react";

export default function UsersPage() {
  const token = useAuth((s) => s.token);
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [editUser, setEditUser] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    getUsers(token, page)
      .then((data) => {
        setUsers(data.users);
        setTotal(data.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token, page]);

  const filteredUsers = search
    ? users.filter(
        (u) =>
          u.name?.toLowerCase().includes(search.toLowerCase()) ||
          u.email?.toLowerCase().includes(search.toLowerCase())
      )
    : users;

  const handleEditClick = (user: any) => {
    setEditUser(user);
    setEditForm({
      name: user.name || "",
      subscription_tier: user.subscription_tier || "free",
      is_admin: user.is_admin ? "true" : "false",
    });
    setError("");
  };

  const handleSave = async () => {
    if (!token || !editUser) return;
    setSaving(true);
    setError("");
    try {
      const data = {
        name: editForm.name,
        subscription_tier: editForm.subscription_tier,
        is_admin: editForm.is_admin === "true",
      };
      await updateUser(token, editUser.id, data);
      
      setUsers((prev) =>
        prev.map((u) => (u.id === editUser.id ? { ...u, ...data } : u))
      );
      setEditUser(null);
    } catch (err: any) {
      setError(err.message || "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-heading font-bold flex items-center gap-3">
          <UsersIcon className="w-8 h-8 text-primary" />
          Users
        </h1>
        <Badge variant="default">{total} Total</Badge>
      </div>

      <div className="flex items-center max-w-sm">
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          iconLeft={<Search className="w-4 h-4" />}
          fullWidth
        />
      </div>

      <Card>
        <CardBody className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-surface-container bg-surface-dim">
                <th className="px-6 py-4 font-medium text-on-surface-dim">User</th>
                <th className="px-6 py-4 font-medium text-on-surface-dim">Tier</th>
                <th className="px-6 py-4 font-medium text-on-surface-dim">Role</th>
                <th className="px-6 py-4 font-medium text-on-surface-dim">Joined</th>
                <th className="px-6 py-4 font-medium text-on-surface-dim text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-surface-container last:border-0 hover:bg-surface-dim/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold shrink-0 select-none">
                        {(user.name ?? user.email ?? "?").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{user.name || "—"}</p>
                        <p className="text-xs text-on-surface-dim">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={user.subscription_tier === "pro" ? "success" : user.subscription_tier === "family" ? "default" : "default"}>
                      {user.subscription_tier || "free"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    {user.is_admin ? (
                      <Badge variant="success" dot>Admin</Badge>
                    ) : (
                      <span className="text-on-surface-dim">User</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-on-surface-dim">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEditClick(user)} iconLeft={<Pencil className="w-4 h-4" />}>
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
              {!loading && filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-on-surface-dim">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardBody>
      </Card>

      {/* Pagination */}
      {total > 20 && (
        <div className="flex justify-center gap-2 mt-4">
          <Button
            variant="secondary"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-on-surface-dim">
            Page {page} of {Math.ceil(total / 20)}
          </span>
          <Button
            variant="secondary"
            onClick={() => setPage((p) => p + 1)}
            disabled={page * 20 >= total}
          >
            Next
          </Button>
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        open={!!editUser}
        onClose={() => setEditUser(null)}
        title="Edit User"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditUser(null)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} loading={saving}>Save Changes</Button>
          </>
        }
      >
        <div className="space-y-4">
          {error && <Alert variant="error" title="Error">{error}</Alert>}
          <Input
            label="Name"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            fullWidth
          />
          <Input
            label="Email"
            value={editUser?.email || ""}
            disabled
            fullWidth
            helperText="Emails cannot be changed from the dashboard."
          />
          <Select
            label="Subscription Tier"
            value={editForm.subscription_tier}
            onChange={(val) => setEditForm({ ...editForm, subscription_tier: val })}
            options={[
              { value: "free", label: "Free" },
              { value: "pro", label: "Pro" },
              { value: "family", label: "Family" },
            ]}
          />
          <Select
            label="Role"
            value={editForm.is_admin}
            onChange={(val) => setEditForm({ ...editForm, is_admin: val })}
            options={[
              { value: "false", label: "User" },
              { value: "true", label: "Admin" },
            ]}
          />
        </div>
      </Modal>
    </div>
  );
}
