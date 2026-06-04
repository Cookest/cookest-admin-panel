"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { getRecipes } from "@/lib/api";

export default function RecipesPage() {
  const token = useAuth((s) => s.token);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!token) return;
    getRecipes(token, page)
      .then((data) => {
        setRecipes(data.recipes || []);
        setTotal(data.total || 0);
      })
      .catch(() => {});
  }, [token, page]);

  const filtered = search
    ? recipes.filter((r) => r.name?.toLowerCase().includes(search.toLowerCase()))
    : recipes;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-heading font-bold">Recipes</h1>
        <p className="text-on-surface-dim">{total} total</p>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search recipes..."
          className="w-full max-w-sm px-3 py-2 border border-surface-container-high rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((recipe) => (
          <div
            key={recipe.id}
            className="bg-surface rounded-xl p-4 shadow-sm border border-surface-container hover:shadow-md transition-shadow"
          >
            <h3 className="font-medium mb-1 truncate">{recipe.name}</h3>
            <div className="flex items-center gap-2 text-sm text-on-surface-dim mb-2">
              {recipe.cuisine && <span className="px-2 py-0.5 bg-surface-dim rounded">{recipe.cuisine}</span>}
              {recipe.difficulty && <span className="px-2 py-0.5 bg-surface-dim rounded">{recipe.difficulty}</span>}
              {recipe.total_time_min && <span>{recipe.total_time_min} min</span>}
            </div>
            <div className="flex items-center gap-3 text-xs text-on-surface-muted">
              {recipe.average_rating && <span>⭐ {recipe.average_rating}</span>}
              <span>{recipe.servings || 2} servings</span>
              {recipe.is_vegetarian && <span className="text-success">🌱 Vegetarian</span>}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-on-surface-dim">
            No recipes found
          </div>
        )}
      </div>

      {total > 20 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded border border-surface-container-high disabled:opacity-30"
          >
            Previous
          </button>
          <span className="px-3 py-1.5 text-on-surface-dim">
            Page {page} of {Math.ceil(total / 20)}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page * 20 >= total}
            className="px-3 py-1.5 rounded border border-surface-container-high disabled:opacity-30"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
