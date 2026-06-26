"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { getSettings } from "@/lib/api";
import { Card, CardBody, Alert, Spinner } from "@cookest/ui";
import { Bot, CheckCircle2, XCircle } from "lucide-react";

export default function AiPage() {
  const token = useAuth((s) => s.token);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    getSettings(token)
      .then((data) => {
        setSettings(data);
      })
      .catch(() => setError("Failed to load settings."))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return <div className="p-8 flex justify-center"><Spinner size="lg" color="primary" /></div>;
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold flex items-center gap-3">
            <Bot className="w-8 h-8 text-primary" />
            AI Configuration
          </h1>
          <p className="text-on-surface-dim mt-2">View current AI configuration settings.</p>
        </div>
      </div>

      {error && <Alert variant="error" title="Error" dismissible onDismiss={() => setError("")}>{error}</Alert>}

      <Card>
        <CardBody className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-heading font-bold text-lg">AI Features Status</h2>
              <p className="text-sm text-on-surface-dim mt-1">
                AI features are configured via the server environment.
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-surface-dim rounded-xl border border-surface-container">
              <div>
                <p className="font-medium">AI Enabled</p>
                <p className="text-xs text-on-surface-muted mt-1">Is Ollama URL configured?</p>
              </div>
              <div className="flex items-center gap-2">
                {settings?.ai_enabled ? (
                  <><CheckCircle2 className="w-5 h-5 text-success" /><span className="text-sm font-medium text-success">Active</span></>
                ) : (
                  <><XCircle className="w-5 h-5 text-on-surface-muted" /><span className="text-sm font-medium text-on-surface-muted">Disabled</span></>
                )}
              </div>
            </div>
            
            {!settings?.ai_enabled && (
              <Alert variant="info" title="How to enable AI">
                To enable AI features, set the <code className="font-mono text-xs font-bold">OLLAMA_URL</code> environment variable on your server to point to your Ollama instance (e.g. <code className="font-mono text-xs">http://ollama:11434</code>).
              </Alert>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
