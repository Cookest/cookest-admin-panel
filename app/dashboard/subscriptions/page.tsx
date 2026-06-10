"use client";

export default function SubscriptionsPage() {
  return (
    <div>
      <h1 className="text-3xl font-heading font-bold mb-6">Subscriptions</h1>

      <div className="space-y-6 max-w-2xl">
        <div className="bg-surface rounded-xl p-6 shadow-sm border border-surface-container">
          <h2 className="font-heading font-bold text-lg mb-2">Subscription Tiers</h2>
          <p className="text-sm text-on-surface-dim mb-4">
            Configure what features are available per tier. For self-hosted instances,
            you may want to set the default tier to Pro to unlock all features without Stripe.
          </p>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-container">
                <th className="text-left py-2 font-medium">Feature</th>
                <th className="text-center py-2 font-medium">Free</th>
                <th className="text-center py-2 font-medium">Pro</th>
                <th className="text-center py-2 font-medium">Family</th>
              </tr>
            </thead>
            <tbody className="text-on-surface-dim">
              <tr className="border-b border-surface-container">
                <td className="py-2">Inventory + Meal Plan</td>
                <td className="text-center">✅</td>
                <td className="text-center">✅</td>
                <td className="text-center">✅</td>
              </tr>
              <tr className="border-b border-surface-container">
                <td className="py-2">AI Meal Plan Generation</td>
                <td className="text-center">❌</td>
                <td className="text-center">✅</td>
                <td className="text-center">✅</td>
              </tr>
              <tr className="border-b border-surface-container">
                <td className="py-2">AI Chat</td>
                <td className="text-center">10/day</td>
                <td className="text-center">∞</td>
                <td className="text-center">∞</td>
              </tr>
              <tr className="border-b border-surface-container">
                <td className="py-2">Price Comparison</td>
                <td className="text-center">❌</td>
                <td className="text-center">✅</td>
                <td className="text-center">✅</td>
              </tr>
              <tr className="border-b border-surface-container">
                <td className="py-2">User-Created Recipes</td>
                <td className="text-center">❌</td>
                <td className="text-center">✅</td>
                <td className="text-center">✅</td>
              </tr>
              <tr>
                <td className="py-2">Multiple Household Profiles</td>
                <td className="text-center">❌</td>
                <td className="text-center">❌</td>
                <td className="text-center">✅</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-surface rounded-xl p-6 shadow-sm border border-surface-container">
          <h2 className="font-heading font-bold text-lg mb-2">Stripe Integration</h2>
          <p className="text-sm text-on-surface-dim">
            Stripe payment integration is configured via the CLI using{" "}
            <code className="px-1.5 py-0.5 bg-surface-dim rounded text-xs font-mono">
              cookest config set services.stripe_enabled true
            </code>
          </p>
        </div>
      </div>
    </div>
  );
}
