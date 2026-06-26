"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { getSystemHealth } from "@/lib/api";
import { Card, CardBody, Badge } from "@cookest/ui";
import { Activity, Server } from "lucide-react";

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
    <div className="space-y-8 max-w-5xl">
      <h1 className="text-3xl font-heading font-bold flex items-center gap-3">
        <Server className="w-8 h-8 text-primary" />
        System Health
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((svc) => (
          <Card key={svc.name}>
            <CardBody className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-3 h-3 rounded-full shadow-sm ${
                      svc.status === "healthy"
                        ? "bg-success shadow-success/40"
                        : svc.status === "unhealthy"
                        ? "bg-danger shadow-danger/40"
                        : "bg-on-surface-muted"
                    }`}
                  />
                  <h3 className="font-heading font-bold text-lg">{svc.name}</h3>
                </div>
                <Badge variant={svc.status === "healthy" ? "success" : svc.status === "unhealthy" ? "danger" : "default"}>
                  {svc.status}
                </Badge>
              </div>
              <div className="mt-4 flex flex-col gap-1 text-sm text-on-surface-dim">
                {svc.latency_ms !== undefined && (
                  <span className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-on-surface-muted" />
                    Latency: {svc.latency_ms}ms
                  </span>
                )}
                {svc.details && (
                  <p className="mt-2 text-xs text-on-surface-muted bg-surface-dim p-2 rounded-md font-mono">
                    {svc.details}
                  </p>
                )}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Docker info */}
      <Card>
        <CardBody className="p-6">
          <h2 className="font-heading font-bold text-lg mb-2">Container Info</h2>
          <p className="text-sm text-on-surface-dim">
            Container status and resource usage is available via the CLI:{" "}
            <code className="px-2 py-1 bg-surface-dim rounded text-xs font-mono border border-surface-container">
              cookest status
            </code>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
