"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { updateSettings } from "@/lib/api";

export default function AiPage() {
  const token = useAuth((s) => s.token);
  const [config, setConfig] = useState({
    enabled: true,
    provider: "ollama",
    model: "llama3.2",
    visionModel: "llava",
    ollamaUrl: "http://ollama:11434",
    chatRateLimitFree: 10,
    chatRateLimitPro: 0,
  });
  const [saved, setSaved] = useState(false);

  function update(key: string, value: any) {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function save() {
    if (!token) return;
    try {
      await updateSettings(token, { ai: config });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {}
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-heading font-bold">AI Configuration</h1>
        {saved && <span className="text-success text-sm font-medium">Saved ✓</span>}
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* Main toggle */}
        <div className="bg-surface rounded-xl p-6 shadow-sm border border-surface-container">
          <label className="flex items-center justify-between">
            <div>
              <h2 className="font-heading font-bold text-lg">AI Features</h2>
              <p className="text-sm text-on-surface-dim mt-1">
                Enable or disable all AI-powered features including chat, meal plan generation,
                and PDF vision processing.
              </p>
            </div>
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => update("enabled", e.target.checked)}
              className="w-6 h-6 accent-primary"
            />
          </label>
        </div>

        {config.enabled && (
          <>
            {/* Provider */}
            <div className="bg-surface rounded-xl p-6 shadow-sm border border-surface-container space-y-4">
              <h2 className="font-heading font-bold">LLM Provider</h2>

              <div>
                <label className="block text-sm font-medium mb-1">Provider</label>
                <select
                  value={config.provider}
                  onChange={(e) => update("provider", e.target.value)}
                  className="w-full px-3 py-2 border border-surface-container-high rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="ollama">Ollama (self-hosted)</option>
                </select>
                <p className="text-xs text-on-surface-muted mt-1">
                  Ollama runs locally — no data leaves your server.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Ollama URL</label>
                <input
                  type="text"
                  value={config.ollamaUrl}
                  onChange={(e) => update("ollamaUrl", e.target.value)}
                  className="w-full px-3 py-2 border border-surface-container-high rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Chat Model</label>
                  <select
                    value={config.model}
                    onChange={(e) => update("model", e.target.value)}
                    className="w-full px-3 py-2 border border-surface-container-high rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="llama3.2">llama3.2</option>
                    <option value="llama3.1:8b">llama3.1:8b</option>
                    <option value="mistral">mistral</option>
                    <option value="gemma2">gemma2</option>
                    <option value="phi3">phi3</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Vision Model</label>
                  <select
                    value={config.visionModel}
                    onChange={(e) => update("visionModel", e.target.value)}
                    className="w-full px-3 py-2 border border-surface-container-high rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="llava">llava</option>
                    <option value="qwen2.5vl:7b">qwen2.5vl:7b</option>
                    <option value="llava:13b">llava:13b</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Rate limits */}
            <div className="bg-surface rounded-xl p-6 shadow-sm border border-surface-container space-y-4">
              <h2 className="font-heading font-bold">Rate Limits</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Free tier (messages/day)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={config.chatRateLimitFree}
                    onChange={(e) => update("chatRateLimitFree", parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-surface-container-high rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-on-surface-muted mt-1">0 = disabled for free tier</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Pro tier (messages/day)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={config.chatRateLimitPro}
                    onChange={(e) => update("chatRateLimitPro", parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-surface-container-high rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-on-surface-muted mt-1">0 = unlimited</p>
                </div>
              </div>
            </div>


          </>
        )}

        <button
          onClick={save}
          className="px-6 py-2.5 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors font-medium"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
