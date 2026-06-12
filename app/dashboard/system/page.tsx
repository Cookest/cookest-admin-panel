"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { getSystemHealth } from "@/lib/api";

interface ServiceHealth {
  name: string;
  status: "healthy" | "unhealthy" | "unknown";
  latency_ms?: number;
  details?: string;
}

export default function SystemPage() {
  const token = useAuth((s) => s.token);
  const [services, setServices] = useState<ServiceHealth[]>([
    { name: "Food Database", status: "unknown" },
    { name: "App Database", status: "unknown" },
    { name: "Food API", status: "unknown" },
    { name: "App API", status: "unknown" },
    { name: "Ollama", status: "unknown" },
    { name: "Admin Panel", status: "healthy" },
  ]);

  useEffect(() => {
    if (!token) return;
    getSystemHealth(token)
      .then((data) => {
        if (data.services) setServices(data.services);
      })
      .catch(() => {});
  }, [token]);

  return (
    <div>
      <h1 className="text-3xl font-heading font-bold mb-6">System Health</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {services.map((svc) => (
          <div
            key={svc.name}
            className="bg-surface rounded-xl p-5 shadow-sm border border-surface-container"
          >
            <div className="flex items-center gap-3">
              <span
                className={`w-3 h-3 rounded-full ${
                  svc.status === "healthy"
                    ? "bg-success"
                    : svc.status === "unhealthy"
                    ? "bg-danger"
                    : "bg-on-surface-muted"
                }`}
              />
              <h3 className="font-medium">{svc.name}</h3>
            </div>
            <div className="mt-2 text-sm text-on-surface-dim">
              <span className="capitalize">{svc.status}</span>
              {svc.latency_ms !== undefined && <span> · {svc.latency_ms}ms</span>}
            </div>
            {svc.details && (
              <p className="mt-1 text-xs text-on-surface-muted">{svc.details}</p>
            )}
          </div>
        ))}
      </div>

      {/* Docker info */}
      <div className="bg-surface rounded-xl p-6 shadow-sm border border-surface-container">
        <h2 className="font-heading font-bold text-lg mb-4">Container Info</h2>
        <p className="text-sm text-on-surface-dim">
          Container status and resource usage is available via the CLI:{" "}
          <code className="px-1.5 py-0.5 bg-surface-dim rounded text-xs font-mono">
            cookest status
          </code>
        </p>
      </div>
    </div>
  );
}
