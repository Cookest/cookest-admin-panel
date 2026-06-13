"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";

export default function DatabasePage() {
  const token = useAuth((s) => s.token);
  const [backupInProgress, setBackupInProgress] = useState(false);

  return (
    <div>
      <h1 className="text-3xl font-heading font-bold mb-6">Database</h1>

      <div className="space-y-6 max-w-2xl">
        {/* Overview */}
        <div className="bg-surface rounded-xl p-6 shadow-sm border border-surface-container">
          <h2 className="font-heading font-bold text-lg mb-4">Database Overview</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-surface-dim rounded-lg">
              <p className="text-sm text-on-surface-dim">Food Database</p>
              <p className="font-medium mt-1">PostgreSQL 16</p>
              <p className="text-xs text-on-surface-muted mt-1">Port 5432</p>
            </div>
            <div className="p-4 bg-surface-dim rounded-lg">
              <p className="text-sm text-on-surface-dim">App Database</p>
              <p className="font-medium mt-1">PostgreSQL 16</p>
              <p className="text-xs text-on-surface-muted mt-1">Port 5433</p>
            </div>
          </div>
        </div>

        {/* Backup & Restore */}
        <div className="bg-surface rounded-xl p-6 shadow-sm border border-surface-container">
          <h2 className="font-heading font-bold text-lg mb-2">Backup & Restore</h2>
          <p className="text-sm text-on-surface-dim mb-4">
            Database backups are managed via the CLI for security. Use these commands:
          </p>
          <div className="space-y-2">
            <div className="p-3 bg-surface-dim rounded-lg font-mono text-sm">
              <span className="text-on-surface-muted">$</span> cookest backup
            </div>
            <div className="p-3 bg-surface-dim rounded-lg font-mono text-sm">
              <span className="text-on-surface-muted">$</span> cookest restore --food-db backup.dump
            </div>
          </div>
        </div>

        {/* Migrations */}
        <div className="bg-surface rounded-xl p-6 shadow-sm border border-surface-container">
          <h2 className="font-heading font-bold text-lg mb-2">Migrations</h2>
          <p className="text-sm text-on-surface-dim">
            Migrations run automatically on every server start. All operations use{" "}
            <code className="px-1 py-0.5 bg-surface-dim rounded text-xs font-mono">IF NOT EXISTS</code>{" "}
            making them safe to replay. No manual migration steps needed.
          </p>
        </div>

        {/* ETL */}
        <div className="bg-surface rounded-xl p-6 shadow-sm border border-surface-container">
          <h2 className="font-heading font-bold text-lg mb-2">Data Seeding (ETL)</h2>
          <p className="text-sm text-on-surface-dim mb-4">
            Seed the database with recipe and ingredient data from USDA FoodData Central
            and TheMealDB using the ETL pipeline.
          </p>
          <div className="p-3 bg-surface-dim rounded-lg font-mono text-sm">
            <span className="text-on-surface-muted">$</span> docker compose exec etl python main.py
          </div>
        </div>
      </div>
    </div>
  );
}
