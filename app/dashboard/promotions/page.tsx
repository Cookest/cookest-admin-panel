"use client";

export default function PromotionsPage() {
  return (
    <div>
      <h1 className="text-3xl font-heading font-bold mb-6">Store Promotions</h1>
      <div className="bg-surface rounded-xl p-6 shadow-sm border border-surface-container">
        <p className="text-on-surface-dim">
          Manage store promotions extracted from PDF flyers. Review promotion candidates,
          approve or reject matches, and monitor the PDF processing pipeline.
        </p>
        <p className="text-sm text-on-surface-muted mt-4">
          Requires the PDF pipeline to be enabled in settings.
        </p>
      </div>
    </div>
  );
}
