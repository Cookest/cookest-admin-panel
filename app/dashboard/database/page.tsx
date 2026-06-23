"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Input,
  Select,
  Spinner,
} from "@cookest/ui";

const API_BASE = process.env.NEXT_PUBLIC_APP_API_URL || "http://localhost:8080";

export default function DatabasePage() {
  const token = useAuth((s) => s.token);
  const [backupInProgress, setBackupInProgress] = useState(false);

  // Dataset Import state
  const [importFolder, setImportFolder] = useState("/data/imports");
  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [foundFiles, setFoundFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [importFormat, setImportFormat] = useState<"csv" | "json">("csv");
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    rows_imported: number;
    message: string;
  } | null>(null);

  async function handleScanFolder() {
    setScanLoading(true);
    setScanError(null);
    setFoundFiles([]);
    setSelectedFile(null);
    setImportResult(null);
    try {
      const res = await fetch(
        `${API_BASE}/api/admin/database/import/scan?folder=${encodeURIComponent(importFolder)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) {
        const body = await res.text();
        throw new Error(body || `Request failed with status ${res.status}`);
      }
      const data: { files: string[] } = await res.json();
      setFoundFiles(data.files);
    } catch (err) {
      setScanError(err instanceof Error ? err.message : "Failed to scan folder");
    } finally {
      setScanLoading(false);
    }
  }

  function handleSelectFile(filename: string) {
    setSelectedFile(filename);
    setImportResult(null);
    if (filename.endsWith(".csv")) {
      setImportFormat("csv");
    } else if (filename.endsWith(".json")) {
      setImportFormat("json");
    }
  }

  async function handleImport() {
    if (!selectedFile) return;
    setImportLoading(true);
    setImportResult(null);
    try {
      const res = await fetch(`${API_BASE}/api/admin/database/import/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          folder: importFolder,
          filename: selectedFile,
          format: importFormat,
        }),
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(body || `Request failed with status ${res.status}`);
      }
      const data: { success: boolean; rows_imported: number; message: string } =
        await res.json();
      setImportResult(data);
    } catch (err) {
      setImportResult({
        success: false,
        rows_imported: 0,
        message: err instanceof Error ? err.message : "Import failed",
      });
    } finally {
      setImportLoading(false);
    }
  }

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

        {/* Dataset Import */}
        <Card>
          <CardHeader>
            <h2 className="font-heading font-bold text-lg">Dataset Import</h2>
            <p className="text-sm text-on-surface-dim mt-1">
              Scan a server folder and import CSV or JSON dataset files into the database.
            </p>
          </CardHeader>

          <CardBody>
            <div className="space-y-4">
              {/* Folder input row */}
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <Input
                    label="Folder path"
                    value={importFolder}
                    onChange={(e) => setImportFolder(e.target.value)}
                    placeholder="/data/imports"
                    fullWidth
                  />
                </div>
                <Button
                  variant="secondary"
                  onClick={handleScanFolder}
                  disabled={scanLoading || !importFolder.trim()}
                  loading={scanLoading}
                >
                  {scanLoading ? "Scanning…" : "Scan Folder"}
                </Button>
              </div>

              {/* Scan error */}
              {scanError && (
                <Alert variant="error" title="Scan failed">
                  {scanError}
                </Alert>
              )}

              {/* Scanning spinner */}
              {scanLoading && (
                <div className="flex items-center gap-2 py-2">
                  <Spinner size="sm" />
                  <span className="text-sm text-on-surface-dim">Scanning folder…</span>
                </div>
              )}

              {/* File list */}
              {!scanLoading && foundFiles.length > 0 && (
                <div className="space-y-1">
                  <p className="text-sm font-medium mb-2">
                    Found {foundFiles.length} file{foundFiles.length !== 1 ? "s" : ""}
                  </p>
                  {foundFiles.map((file) => (
                    <button
                      key={file}
                      type="button"
                      onClick={() => handleSelectFile(file)}
                      className={[
                        "w-full text-left px-3 py-2 rounded-lg text-sm font-mono transition-colors",
                        selectedFile === file
                          ? "bg-primary/10 text-primary font-semibold ring-1 ring-primary/40"
                          : "bg-surface-dim hover:bg-surface-container text-on-surface",
                      ].join(" ")}
                    >
                      {file}
                    </button>
                  ))}
                </div>
              )}

              {!scanLoading && foundFiles.length === 0 && !scanError && importFolder && (
                <p className="text-sm text-on-surface-dim">
                  No files found yet. Enter a folder path and click Scan Folder.
                </p>
              )}

              {/* Format selector + Import button — only visible once a file is selected */}
              {selectedFile && (
                <div className="space-y-3 pt-2 border-t border-surface-container">
                  <Select
                    label="Import format"
                    value={importFormat}
                    onChange={(val) => setImportFormat(val as "csv" | "json")}
                    options={[
                      { value: "csv", label: "CSV" },
                      { value: "json", label: "JSON" },
                    ]}
                  />

                  {/* Import result alert */}
                  {importResult && (
                    <Alert
                      variant={importResult.success ? "success" : "error"}
                      title={importResult.success ? "Import complete" : "Import failed"}
                    >
                      {importResult.message}
                      {importResult.success && importResult.rows_imported > 0 && (
                        <span className="block mt-1 text-xs">
                          {importResult.rows_imported.toLocaleString()} row
                          {importResult.rows_imported !== 1 ? "s" : ""} imported.
                        </span>
                      )}
                    </Alert>
                  )}
                </div>
              )}
            </div>
          </CardBody>

          {selectedFile && (
            <CardFooter>
              <Button
                variant="primary"
                onClick={handleImport}
                disabled={importLoading}
                loading={importLoading}
              >
                {importLoading ? "Importing…" : "Import Dataset"}
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
