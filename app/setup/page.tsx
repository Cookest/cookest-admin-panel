"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

interface SetupStep {
  id: string;
  title: string;
  description: string;
}

const steps: SetupStep[] = [
  { id: "welcome", title: "Welcome", description: "Set up your Cookest instance" },
  { id: "admin", title: "Admin Account", description: "Create the admin account" },
  { id: "ai", title: "AI Features", description: "Configure AI and LLM settings" },
  { id: "services", title: "Services", description: "Enable optional services" },
  { id: "done", title: "Ready", description: "Your instance is configured" },
];

export default function SetupPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [config, setConfig] = useState({
    instanceName: "",
    adminEmail: "",
    adminPassword: "",
    aiEnabled: true,
    ollamaModel: "llama3.2",
    stripeEnabled: false,
    pdfPipelineEnabled: false,
  });
  const [error, setError] = useState("");
  const router = useRouter();
  const setToken = useAuth((s) => s.setToken);

  function updateConfig(key: string, value: any) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  function next() {
    if (currentStep < steps.length - 1) setCurrentStep((s) => s + 1);
  }
  function prev() {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  }

  async function finishSetup() {
    setError("");
    try {
      const apiBase =
        process.env.NEXT_PUBLIC_APP_API_URL ||
        `${window.location.protocol}//${window.location.hostname}:8080`;

      const res = await fetch(`${apiBase}/admin/setup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (res.ok) {
        const { access_token } = await res.json();
        setToken(access_token);
        router.push("/dashboard");
      } else if (res.status === 409) {
        setError("An admin account already exists. Please use the login page.");
      } else if (res.status === 403) {
        setError("Setup is only available on self-hosted instances.");
      } else {
        const body = await res.text();
        setError(body || "Setup failed. Check the server logs.");
      }
    } catch {
      setError("Could not reach the server. Make sure the backend is running.");
    }
  }

  const step = steps[currentStep];

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-dim">
      <div className="w-full max-w-2xl p-8 bg-surface rounded-xl shadow-lg">
        {/* Progress bar */}
        <div className="flex gap-2 mb-8">
          {steps.map((s, i) => (
            <div
              key={s.id}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= currentStep ? "bg-primary" : "bg-surface-container-high"
              }`}
            />
          ))}
        </div>

        <h1 className="text-2xl font-heading font-bold mb-1">{step.title}</h1>
        <p className="text-on-surface-dim mb-6">{step.description}</p>

        {/* Step content */}
        <div className="space-y-4 min-h-[200px]">
          {step.id === "welcome" && (
            <div className="text-center py-8">
              <p className="text-5xl mb-4">🍳</p>
              <h2 className="text-xl font-heading font-bold mb-2">Welcome to Cookest</h2>
              <p className="text-on-surface-dim">
                Let&apos;s set up your self-hosted meal planning platform.
                This wizard will guide you through the initial configuration.
              </p>
              <div className="mt-4">
                <label className="block text-sm font-medium mb-1">Instance Name</label>
                <input
                  type="text"
                  value={config.instanceName}
                  onChange={(e) => updateConfig("instanceName", e.target.value)}
                  placeholder="My Kitchen"
                  className="w-full max-w-sm mx-auto px-3 py-2 border border-surface-container-high rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          )}

          {step.id === "admin" && (
            <div className="max-w-sm mx-auto space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Admin Email</label>
                <input
                  type="email"
                  value={config.adminEmail}
                  onChange={(e) => updateConfig("adminEmail", e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-surface-container-high rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Admin Password</label>
                <input
                  type="password"
                  value={config.adminPassword}
                  onChange={(e) => updateConfig("adminPassword", e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-surface-container-high rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          )}

          {step.id === "ai" && (
            <div className="space-y-4">
              <label className="flex items-center gap-3 p-4 border border-surface-container-high rounded-lg cursor-pointer hover:bg-surface-dim transition-colors">
                <input
                  type="checkbox"
                  checked={config.aiEnabled}
                  onChange={(e) => updateConfig("aiEnabled", e.target.checked)}
                  className="w-5 h-5 accent-primary"
                />
                <div>
                  <p className="font-medium">Enable AI Features</p>
                  <p className="text-sm text-on-surface-dim">
                    Uses Ollama for AI chat, meal plan generation, and PDF vision processing.
                    Requires additional resources.
                  </p>
                </div>
              </label>

              {config.aiEnabled && (
                <div className="ml-8">
                  <label className="block text-sm font-medium mb-1">Chat Model</label>
                  <select
                    value={config.ollamaModel}
                    onChange={(e) => updateConfig("ollamaModel", e.target.value)}
                    className="w-full px-3 py-2 border border-surface-container-high rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="llama3.2">llama3.2 (recommended)</option>
                    <option value="llama3.1:8b">llama3.1:8b</option>
                    <option value="mistral">mistral</option>
                    <option value="gemma2">gemma2</option>
                    <option value="phi3">phi3</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {step.id === "services" && (
            <div className="space-y-3">
              {[
                {
                  key: "stripeEnabled",
                  label: "Stripe Payments",
                  desc: "Enable subscription tiers and payment processing",
                },

                {
                  key: "pdfPipelineEnabled",
                  label: "PDF Price Scraping",
                  desc: "Extract supermarket promotions from PDF flyers",
                },
              ].map((svc) => (
                <label
                  key={svc.key}
                  className="flex items-center gap-3 p-4 border border-surface-container-high rounded-lg cursor-pointer hover:bg-surface-dim transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={(config as any)[svc.key]}
                    onChange={(e) => updateConfig(svc.key, e.target.checked)}
                    className="w-5 h-5 accent-primary"
                  />
                  <div>
                    <p className="font-medium">{svc.label}</p>
                    <p className="text-sm text-on-surface-dim">{svc.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          )}

          {step.id === "done" && (
            <div className="text-center py-8">
              {error ? (
                <>
                  <p className="text-5xl mb-4">❌</p>
                  <h2 className="text-xl font-heading font-bold mb-2">Setup failed</h2>
                  <p className="text-danger text-sm">{error}</p>
                </>
              ) : (
                <>
                  <p className="text-5xl mb-4">✅</p>
                  <h2 className="text-xl font-heading font-bold mb-2">You&apos;re all set!</h2>
                  <p className="text-on-surface-dim">
                    Your Cookest instance is configured and ready to use.
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-4 border-t border-surface-container-high">
          <button
            onClick={prev}
            disabled={currentStep === 0}
            className="px-4 py-2 text-on-surface-dim hover:text-on-surface disabled:opacity-30 transition-colors"
          >
            Back
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={next}
              className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors font-medium"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={finishSetup}
              className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors font-medium"
            >
              Launch Cookest
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
