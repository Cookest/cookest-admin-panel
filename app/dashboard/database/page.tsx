"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { getSettings, updateSettings, scanImportFolder, executeImport } from "@/lib/api";
import { Alert, Button, Card, CardBody, CardHeader, CardFooter, Input, Select, Spinner } from "@cookest/ui";
import { Database, Search } from "lucide-react";

export default function DatabasePage() {
  const token = useAuth((s) => s.token);

  // Settings state
  const [activeSource, setActiveSource] = useState<string>("local");
  const [sourceLoading, setSourceLoading] = useState<boolean>(true);
  const [saveSourceLoading, setSaveSourceLoading] = useState<boolean>(false);
  const [sourceError, setSourceError] = useState<string | null>(null);
  const [sourceSaved, setSourceSaved] = useState<boolean>(false);

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

  useEffect(() => {
    if (!token) return;
    setSourceLoading(true);
    getSettings(token)
      .then((data) => setActiveSource(data.food_data_source || "local"))
      .catch((err) => console.error("Failed to fetch food source", err))
      .finally(() => setSourceLoading(false));
  }, [token]);

  async function handleSaveSource(val: string) {
    if (!token) return;
    setSaveSourceLoading(true);
    setSourceError(null);
    setSourceSaved(false);
    try {
      await updateSettings(token, { food_data_source: val });
      setActiveSource(val);
      setSourceSaved(true);
      setTimeout(() => setSourceSaved(false), 3000);
    } catch (err: any) {
      setSourceError(err.message || "Failed to save food source");
    } finally {
      setSaveSourceLoading(false);
    }
  }

  async function handleScanFolder() {
    if (!token) return;
    setScanLoading(true);
    setScanError(null);
    setFoundFiles([]);
    setSelectedFile(null);
    setImportResult(null);
    try {
      const data = await scanImportFolder(token, importFolder);
      setFoundFiles(data.files);
    } catch (err: any) {
      setScanError(err.message || "Failed to scan folder");
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
    if (!token || !selectedFile) return;
    setImportLoading(true);
    setImportResult(null);
    try {
      const data = await executeImport(token, importFolder, selectedFile, importFormat);
      setImportResult(data);
    } catch (err: any) {
      setImportResult({
        success: false,
        rows_imported: 0,
        message: err.message || "Import failed",
      });
    } finally {
      setImportLoading(false);
    }
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <h1 className="text-3xl font-heading font-bold flex items-center gap-3">
        <Database className="w-8 h-8 text-primary" />
        Database
      </h1>

      {/* Overview */}
      <Card>
        <CardHeader>
          <h2 className="font-heading font-bold text-lg">Database Overview</h2>
        </CardHeader>
        <CardBody className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-surface-dim rounded-xl border border-surface-container flex items-center gap-4">
              <Database className="w-6 h-6 text-primary/70" />
              <div>
                <p className="text-sm font-medium text-on-surface-dim">Food Database</p>
                <p className="font-bold">PostgreSQL 16</p>
                <p className="text-xs text-on-surface-muted mt-0.5">Port 5432</p>
              </div>
            </div>
            <div className="p-4 bg-surface-dim rounded-xl border border-surface-container flex items-center gap-4">
              <Database className="w-6 h-6 text-primary/70" />
              <div>
                <p className="text-sm font-medium text-on-surface-dim">App Database</p>
                <p className="font-bold">PostgreSQL 16</p>
                <p className="text-xs text-on-surface-muted mt-0.5">Port 5433</p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Food Catalog Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div>
              <h2 className="font-heading font-bold text-lg">Food Catalog Data Source</h2>
              <p className="text-sm text-on-surface-dim mt-1">
                Choose where the app fetches ingredients, macros, and images from.
              </p>
            </div>
            {sourceSaved && <span className="text-success text-sm font-medium whitespace-nowrap ml-4">Saved ✓</span>}
          </div>
        </CardHeader>
        <CardBody className="p-6">
          {sourceLoading ? (
            <div className="flex justify-center p-4"><Spinner size="md" color="primary" /></div>
          ) : (
            <div className="space-y-4">
              <Select
                label="Active Data Source"
                value={activeSource}
                onChange={(val) => handleSaveSource(val)}
                disabled={saveSourceLoading}
                options={[
                  { value: "local", label: "Local Database Only" },
                  { value: "fatsecret", label: "FatSecret API Only" },
                  { value: "openfoodfacts", label: "OpenFoodFacts API Only" },
                  { value: "hybrid", label: "Hybrid (Local DB + OFF + FatSecret)" },
                ]}
              />
              
              {sourceError && (
                <Alert variant="error" title="Failed to save">
                  {sourceError}
                </Alert>
              )}

              <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
                <p className="text-sm text-primary font-medium">
                  Note: Hybrid mode tries resolving barcodes and ingredients locally first. If missing, it queries OpenFoodFacts (with dynamic image caching) and falls back to FatSecret.
                </p>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Dataset Import */}
      <Card>
        <CardHeader>
          <h2 className="font-heading font-bold text-lg">Dataset Import</h2>
          <p className="text-sm text-on-surface-dim mt-1">
            Scan a server folder and import CSV or JSON dataset files into the database.
          </p>
        </CardHeader>

        <CardBody className="p-6 space-y-6">
          <div className="flex gap-4 items-end">
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
              iconLeft={<Search className="w-4 h-4" />}
            >
              {scanLoading ? "Scanning" : "Scan Folder"}
            </Button>
          </div>

          {scanError && (
            <Alert variant="error" title="Scan failed">
              {scanError}
            </Alert>
          )}

          {!scanLoading && foundFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">
                Found {foundFiles.length} file{foundFiles.length !== 1 ? "s" : ""}
              </p>
              <div className="grid gap-2">
                {foundFiles.map((file) => (
                  <button
                    key={file}
                    type="button"
                    onClick={() => handleSelectFile(file)}
                    className={[
                      "w-full text-left px-4 py-3 rounded-xl text-sm font-mono transition-all",
                      selectedFile === file
                        ? "bg-primary text-primary-foreground shadow-md font-medium"
                        : "bg-surface-dim hover:bg-surface-container text-on-surface",
                    ].join(" ")}
                  >
                    {file}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!scanLoading && foundFiles.length === 0 && !scanError && importFolder && (
            <p className="text-sm text-on-surface-dim italic">
              No files found yet. Enter a folder path and click Scan Folder.
            </p>
          )}

          {selectedFile && (
            <div className="pt-6 border-t border-surface-container space-y-4">
              <Select
                label="Import format"
                value={importFormat}
                onChange={(val) => setImportFormat(val as "csv" | "json")}
                options={[
                  { value: "csv", label: "CSV" },
                  { value: "json", label: "JSON" },
                ]}
              />

              {importResult && (
                <Alert
                  variant={importResult.success ? "success" : "error"}
                  title={importResult.success ? "Import complete" : "Import failed"}
                >
                  {importResult.message}
                  {importResult.success && importResult.rows_imported > 0 && (
                    <span className="block mt-2 text-sm font-medium">
                      {importResult.rows_imported.toLocaleString()} row
                      {importResult.rows_imported !== 1 ? "s" : ""} imported.
                    </span>
                  )}
                </Alert>
              )}
            </div>
          )}
        </CardBody>

        {selectedFile && (
          <CardFooter>
            <Button
              variant="primary"
              onClick={handleImport}
              disabled={importLoading}
              loading={importLoading}
              fullWidth
            >
              {importLoading ? "Importing…" : "Start Import"}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
