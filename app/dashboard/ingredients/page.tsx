"use client";

export default function IngredientsPage() {
  return (
    <div>
      <h1 className="text-3xl font-heading font-bold mb-6">Ingredients</h1>
      <div className="bg-surface rounded-xl p-6 shadow-sm border border-surface-container">
        <p className="text-on-surface-dim">
          Browse and manage the ingredient catalog. Ingredients are seeded by the ETL pipeline
          from USDA FoodData Central and Open Food Facts.
        </p>
        <p className="text-sm text-on-surface-muted mt-4">
          Full ingredient management coming soon. Use the Food API directly for now.
        </p>
      </div>
    </div>
  );
}
