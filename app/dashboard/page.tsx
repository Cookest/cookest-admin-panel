"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { getDashboardStats } from "@/lib/api";

interface Stats {
  total_users: number;
  total_recipes: number;
  total_ingredients: number;
  active_meal_plans: number;
  ai_chats_today: number;
  system_health: Record<string, string>;
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: string;
}) {
  return (
    <div className="bg-surface rounded-xl p-6 shadow-sm border border-surface-container">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-on-surface-dim">{label}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const token = useAuth((s) => s.token);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    getDashboardStats(token)
      .then(setStats)
      .catch(() => setError("Failed to load stats — admin API may not be running yet."));
  }, [token]);

  return (
    <div>
      <h1 className="text-3xl font-heading font-bold mb-6">Dashboard</h1>

      {error && (
        <div className="p-4 bg-warning/10 text-on-surface rounded-lg mb-6 border border-warning/30">
          <p className="font-medium">Backend not connected</p>
          <p className="text-sm text-on-surface-dim mt-1">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Users"
          value={stats?.total_users ?? "—"}
          icon="👥"
        />
        <StatCard
          label="Recipes"
          value={stats?.total_recipes ?? "—"}
          icon="🍽️"
        />
        <StatCard
          label="Ingredients"
          value={stats?.total_ingredients ?? "—"}
          icon="🥕"
        />
        <StatCard
          label="Active Meal Plans"
          value={stats?.active_meal_plans ?? "—"}
          icon="📋"
        />
      </div>

      {/* System health */}
      <div className="bg-surface rounded-xl p-6 shadow-sm border border-surface-container">
        <h2 className="text-lg font-heading font-bold mb-4">System Health</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {["Food DB", "App DB", "Food API", "App API"].map((service) => {
            const status = stats?.system_health?.[service.toLowerCase().replace(" ", "_")];
            return (
              <div
                key={service}
                className="flex items-center gap-2 p-3 bg-surface-dim rounded-lg"
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    status === "healthy" ? "bg-success" : "bg-on-surface-muted"
                  }`}
                />
                <span className="text-sm">{service}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
