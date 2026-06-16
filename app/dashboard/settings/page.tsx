"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { updateSettings } from "@/lib/api";

export default function SettingsPage() {
  const token = useAuth((s) => s.token);
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    instanceName: process.env.COOKEST_INSTANCE_NAME || "Cookest",
    registrationEnabled: true,
    defaultTier: "free",
    maxUsersPerHousehold: 6,
    corsOrigin: "*",
    emailVerificationRequired: false,
    twoFactorEnabled: false,
    maintenanceMode: false,
  });

  function update(key: string, value: any) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function save() {
    if (!token) return;
    try {
      await updateSettings(token, { general: settings });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {}
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-heading font-bold">Settings</h1>
        {saved && <span className="text-success text-sm font-medium">Saved ✓</span>}
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* General */}
        <div className="bg-surface rounded-xl p-6 shadow-sm border border-surface-container space-y-4">
          <h2 className="font-heading font-bold text-lg">General</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Instance Name</label>
            <input
              type="text"
              value={settings.instanceName}
              onChange={(e) => update("instanceName", e.target.value)}
              className="w-full px-3 py-2 border border-surface-container-high rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">CORS Origin</label>
            <input
              type="text"
              value={settings.corsOrigin}
              onChange={(e) => update("corsOrigin", e.target.value)}
              className="w-full px-3 py-2 border border-surface-container-high rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-on-surface-muted mt-1">
              Use * to allow all origins, or specify your app domain
            </p>
          </div>
        </div>

        {/* Registration */}
        <div className="bg-surface rounded-xl p-6 shadow-sm border border-surface-container space-y-4">
          <h2 className="font-heading font-bold text-lg">Registration</h2>

          <label className="flex items-center justify-between">
            <div>
              <p className="font-medium">Allow new registrations</p>
              <p className="text-sm text-on-surface-dim">Users can create new accounts</p>
            </div>
            <input
              type="checkbox"
              checked={settings.registrationEnabled}
              onChange={(e) => update("registrationEnabled", e.target.checked)}
              className="w-5 h-5 accent-primary"
            />
          </label>

          <label className="flex items-center justify-between">
            <div>
              <p className="font-medium">Require email verification</p>
              <p className="text-sm text-on-surface-dim">
                New users must verify their email before accessing features
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.emailVerificationRequired}
              onChange={(e) => update("emailVerificationRequired", e.target.checked)}
              className="w-5 h-5 accent-primary"
            />
          </label>

          <div>
            <label className="block text-sm font-medium mb-1">Default subscription tier</label>
            <select
              value={settings.defaultTier}
              onChange={(e) => update("defaultTier", e.target.value)}
              className="w-full px-3 py-2 border border-surface-container-high rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="free">Free</option>
              <option value="pro">Pro (all features, no payment)</option>
              <option value="family">Family (all features, no payment)</option>
            </select>
            <p className="text-xs text-on-surface-muted mt-1">
              For self-hosted instances without Stripe, set this to Pro or Family to unlock all features
            </p>
          </div>
        </div>

        {/* Security */}
        <div className="bg-surface rounded-xl p-6 shadow-sm border border-surface-container space-y-4">
          <h2 className="font-heading font-bold text-lg">Security</h2>

          <label className="flex items-center justify-between">
            <div>
              <p className="font-medium">Two-factor authentication</p>
              <p className="text-sm text-on-surface-dim">Allow users to enable TOTP 2FA</p>
            </div>
            <input
              type="checkbox"
              checked={settings.twoFactorEnabled}
              onChange={(e) => update("twoFactorEnabled", e.target.checked)}
              className="w-5 h-5 accent-primary"
            />
          </label>

          <div>
            <label className="block text-sm font-medium mb-1">Max users per household</label>
            <input
              type="number"
              min={1}
              max={20}
              value={settings.maxUsersPerHousehold}
              onChange={(e) => update("maxUsersPerHousehold", parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-surface-container-high rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Maintenance */}
        <div className="bg-surface rounded-xl p-6 shadow-sm border border-surface-container">
          <label className="flex items-center justify-between">
            <div>
              <h2 className="font-heading font-bold text-lg">Maintenance Mode</h2>
              <p className="text-sm text-on-surface-dim mt-1">
                When enabled, the app shows a maintenance page to all non-admin users
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={(e) => update("maintenanceMode", e.target.checked)}
              className="w-6 h-6 accent-danger"
            />
          </label>
        </div>

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
