"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { getDashboardStats } from "@/lib/api";
import { Card, CardBody, Alert } from "@cookest/ui";
import { Users, Utensils, Carrot, ClipboardList, Activity } from "lucide-react";

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
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: any;
}) {
  return (
    <Card>
      <CardBody className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-on-surface-dim">{label}</p>
            <p className="text-3xl font-heading font-bold mt-2">{value}</p>
          </div>
          <div className="p-3 bg-primary/10 rounded-xl">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        </div>
      </CardBody>
    </Card>
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
    <div className="space-y-8">
      <h1 className="text-3xl font-heading font-bold">Dashboard Overview</h1>

      {error && (
        <Alert variant="warning" title="Backend not connected" className="mb-6">
          {error}
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total Users"
          value={stats?.total_users ?? "—"}
          icon={Users}
        />
        <StatCard
          label="Recipes"
          value={stats?.total_recipes ?? "—"}
          icon={Utensils}
        />
        <StatCard
          label="Ingredients"
          value={stats?.total_ingredients ?? "—"}
          icon={Carrot}
        />
        <StatCard
          label="Active Meal Plans"
          value={stats?.active_meal_plans ?? "—"}
          icon={ClipboardList}
        />
      </div>

      {/* System health */}
      <Card>
        <CardBody className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-heading font-bold">System Health Quick Look</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["Food DB", "App DB", "Food API", "App API"].map((service) => {
              const status = stats?.system_health?.[service.toLowerCase().replace(" ", "_")];
              return (
                <div
                  key={service}
                  className="flex items-center gap-3 p-4 bg-surface-dim rounded-xl border border-surface-container"
                >
                  <span
                    className={`w-3 h-3 rounded-full shadow-sm ${
                      status === "healthy" ? "bg-success shadow-success/40" : "bg-on-surface-muted"
                    }`}
                  />
                  <span className="text-sm font-medium">{service}</span>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
