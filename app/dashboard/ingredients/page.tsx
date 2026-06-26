"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  getIngredients,
  getIngredientCategories,
  getIngredientDetail,
  createIngredient,
  updateIngredient,
  deleteIngredient,
  scanIngredientImport,
  importIngredientsFile,
  IngredientListItem,
  IngredientPayload,
} from "@/lib/api";
import { Card, CardBody, Badge, Button, Input, Modal, Select, Alert, Spinner } from "@cookest/ui";
import { Carrot, Search, Pencil, Trash2, Plus, Upload } from "lucide-react";

const PER_PAGE = 20;

const EMPTY_FORM = {
  name: "",
  category: "",
  calories: "",
  protein_g: "",
  carbs_g: "",
  fat_g: "",
  image_url: "",
};

type FormState = typeof EMPTY_FORM;

function numOrNull(v: string): number | null {
  const t = v.trim();
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

export default function IngredientsPage() {
  const token = useAuth((s) => s.token);

  const [items, setItems] = useState<IngredientListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");

  // Add/Edit modal state
  const [editing, setEditing] = useState<null | "new" | number>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<IngredientListItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Import-from-directory state
  const [importOpen, setImportOpen] = useState(false);
  const [importFolder, setImportFolder] = useState("/data/imports");
  const [importFiles, setImportFiles] = useState<string[]>([]);
  const [scanning, setScanning] = useState(false);
  const [importBusy, setImportBusy] = useState(false);
  const [importError, setImportError] = useState("");
  const [importResult, setImportResult] = useState("");

  const loadList = useCallback(() => {
    if (!token) return;
    setLoading(true);
    setListError("");
    getIngredients(token, search, category, page, PER_PAGE)
      .then((data) => {
        setItems(data.data);
        setTotal(data.total);
      })
      .catch((e) => setListError(e?.message || "Failed to load ingredients"))
      .finally(() => setLoading(false));
  }, [token, search, category, page]);

  // Debounced reload on search/category/page change.
  useEffect(() => {
    const t = setTimeout(loadList, 250);
    return () => clearTimeout(t);
  }, [loadList]);

  // Load categories once.
  useEffect(() => {
    if (!token) return;
    getIngredientCategories(token)
      .then((d) => setCategories(d.categories))
      .catch(() => {});
  }, [token]);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setFormError("");
    setEditing("new");
  };

  const openEdit = async (item: IngredientListItem) => {
    if (!token) return;
    setFormError("");
    setForm({ ...EMPTY_FORM, name: item.name, category: item.category || "" });
    setEditing(item.id);
    try {
      const detail = await getIngredientDetail(token, item.id);
      const n = detail.nutrients || {};
      setForm({
        name: detail.name || "",
        category: detail.category || "",
        image_url: detail.image_url || "",
        calories: n.calories != null ? String(n.calories) : "",
        protein_g: n.protein_g != null ? String(n.protein_g) : "",
        carbs_g: n.carbs_g != null ? String(n.carbs_g) : "",
        fat_g: n.fat_g != null ? String(n.fat_g) : "",
      });
    } catch {
      // keep the lightweight prefill if the detail fetch fails
    }
  };

  const handleSave = async () => {
    if (!token || editing === null) return;
    if (!form.name.trim()) {
      setFormError("Name is required.");
      return;
    }
    setSaving(true);
    setFormError("");

    const nutrientFields = [form.calories, form.protein_g, form.carbs_g, form.fat_g];
    const hasNutrients = nutrientFields.some((v) => v.trim() !== "");
    const payload: IngredientPayload = {
      name: form.name.trim(),
      category: form.category.trim() || null,
      image_url: form.image_url.trim() || null,
      nutrients: hasNutrients
        ? {
            calories: numOrNull(form.calories),
            protein_g: numOrNull(form.protein_g),
            carbs_g: numOrNull(form.carbs_g),
            fat_g: numOrNull(form.fat_g),
          }
        : null,
    };

    try {
      if (editing === "new") {
        await createIngredient(token, payload);
      } else {
        await updateIngredient(token, editing, payload);
      }
      setEditing(null);
      loadList();
    } catch (e: any) {
      setFormError(e?.message || "Failed to save ingredient");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!token || !deleteTarget) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteIngredient(token, deleteTarget.id);
      setDeleteTarget(null);
      loadList();
    } catch (e: any) {
      setDeleteError(e?.message || "Failed to delete ingredient");
    } finally {
      setDeleting(false);
    }
  };

  const handleScan = async () => {
    if (!token) return;
    setScanning(true);
    setImportError("");
    setImportResult("");
    setImportFiles([]);
    try {
      const data = await scanIngredientImport(token, importFolder);
      setImportFiles(data.files);
      if (data.files.length === 0) setImportError("No .csv/.json files found in that folder.");
    } catch (e: any) {
      setImportError(e?.message || "Failed to scan folder");
    } finally {
      setScanning(false);
    }
  };

  const handleImportFile = async (filename: string) => {
    if (!token) return;
    setImportBusy(true);
    setImportError("");
    setImportResult("");
    try {
      const res = await importIngredientsFile(token, importFolder, filename);
      setImportResult(res.message || `Imported ${res.rows_imported} ingredients`);
      loadList();
      getIngredientCategories(token).then((d) => setCategories(d.categories)).catch(() => {});
    } catch (e: any) {
      setImportError(e?.message || "Failed to import file");
    } finally {
      setImportBusy(false);
    }
  };

  const categoryOptions = [
    { value: "", label: "All categories" },
    ...categories.map((c) => ({ value: c, label: c })),
  ];

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-heading font-bold flex items-center gap-3">
          <Carrot className="w-8 h-8 text-primary" />
          Ingredients
        </h1>
        <div className="flex items-center gap-3">
          <Badge variant="default">{total} Total</Badge>
          <Button
            variant="secondary"
            onClick={() => {
              setImportError("");
              setImportResult("");
              setImportFiles([]);
              setImportOpen(true);
            }}
            iconLeft={<Upload className="w-4 h-4" />}
          >
            Import
          </Button>
          <Button variant="primary" onClick={openAdd} iconLeft={<Plus className="w-4 h-4" />}>
            Add Ingredient
          </Button>
        </div>
      </div>

      <p className="text-sm text-on-surface-dim">
        The master ingredient catalog. Recipes, the pantry, and the AI can only use ingredients listed
        here. Bulk-load more via the{" "}
        <a href="/dashboard/database" className="text-primary underline">
          Database import
        </a>{" "}
        page.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <div className="max-w-sm flex-1 min-w-[220px]">
          <Input
            placeholder="Search ingredients..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            iconLeft={<Search className="w-4 h-4" />}
            fullWidth
          />
        </div>
        <div className="w-56">
          <Select
            value={category}
            onChange={(val) => {
              setCategory(val);
              setPage(1);
            }}
            options={categoryOptions}
          />
        </div>
      </div>

      {listError && (
        <Alert variant="error" title="Error">
          {listError}
        </Alert>
      )}

      <Card>
        <CardBody className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-surface-container bg-surface-dim">
                <th className="px-6 py-4 font-medium text-on-surface-dim">Ingredient</th>
                <th className="px-6 py-4 font-medium text-on-surface-dim">Category</th>
                <th className="px-6 py-4 font-medium text-on-surface-dim text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-surface-container last:border-0 hover:bg-surface-dim/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 overflow-hidden">
                        {item.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Carrot className="w-4 h-4" />
                        )}
                      </div>
                      <p className="font-medium">{item.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {item.category ? (
                      <Badge variant="default">{item.category}</Badge>
                    ) : (
                      <span className="text-on-surface-dim">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(item)}
                        iconLeft={<Pencil className="w-4 h-4" />}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setDeleteTarget(item);
                          setDeleteError("");
                        }}
                        iconLeft={<Trash2 className="w-4 h-4" />}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {loading && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center">
                    <Spinner size="md" />
                  </td>
                </tr>
              )}
              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-on-surface-dim">
                    No ingredients found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardBody>
      </Card>

      {/* Pagination */}
      {total > PER_PAGE && (
        <div className="flex justify-center gap-2 mt-4">
          <Button
            variant="secondary"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-on-surface-dim">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="secondary"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === "new" ? "Add Ingredient" : "Edit Ingredient"}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} loading={saving}>
              {editing === "new" ? "Create" : "Save Changes"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {formError && (
            <Alert variant="error" title="Error">
              {formError}
            </Alert>
          )}
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            fullWidth
          />
          <Input
            label="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            helperText="e.g. protein, dairy, vegetable, grain, fruit, fat, spice"
            fullWidth
          />
          <Input
            label="Image URL"
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            fullWidth
          />
          <p className="text-sm font-medium text-on-surface-dim pt-2">Nutrients (per 100g, optional)</p>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Calories"
              type="number"
              value={form.calories}
              onChange={(e) => setForm({ ...form, calories: e.target.value })}
              fullWidth
            />
            <Input
              label="Protein (g)"
              type="number"
              value={form.protein_g}
              onChange={(e) => setForm({ ...form, protein_g: e.target.value })}
              fullWidth
            />
            <Input
              label="Carbs (g)"
              type="number"
              value={form.carbs_g}
              onChange={(e) => setForm({ ...form, carbs_g: e.target.value })}
              fullWidth
            />
            <Input
              label="Fat (g)"
              type="number"
              value={form.fat_g}
              onChange={(e) => setForm({ ...form, fat_g: e.target.value })}
              fullWidth
            />
          </div>
        </div>
      </Modal>

      {/* Delete confirmation */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Ingredient"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={deleting}>
              Delete
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {deleteError && (
            <Alert variant="error" title="Cannot delete">
              {deleteError}
            </Alert>
          )}
          <p>
            Delete <span className="font-semibold">{deleteTarget?.name}</span> from the catalog? This
            cannot be undone. Ingredients used by a recipe cannot be deleted.
          </p>
        </div>
      </Modal>

      {/* Import from directory */}
      <Modal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        title="Import ingredients from a folder"
        size="md"
        footer={
          <Button variant="ghost" onClick={() => setImportOpen(false)}>
            Close
          </Button>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-on-surface-dim">
            Drop CSV files (columns: <code>name,category,calories,protein_g,carbs_g,fat_g</code>) into a
            folder on the server, then scan and import. Default is the mounted{" "}
            <code>/data/imports</code> directory.
          </p>
          {importError && (
            <Alert variant="error" title="Error">
              {importError}
            </Alert>
          )}
          {importResult && (
            <Alert variant="success" title="Done">
              {importResult}
            </Alert>
          )}
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Input
                label="Folder"
                value={importFolder}
                onChange={(e) => setImportFolder(e.target.value)}
                fullWidth
              />
            </div>
            <Button variant="secondary" onClick={handleScan} loading={scanning}>
              Scan
            </Button>
          </div>
          {importFiles.length > 0 && (
            <div className="border border-surface-container rounded-lg divide-y divide-surface-container">
              {importFiles.map((f) => (
                <div key={f} className="flex items-center justify-between px-3 py-2">
                  <span className="text-sm">{f}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={importBusy}
                    onClick={() => handleImportFile(f)}
                    iconLeft={<Upload className="w-4 h-4" />}
                  >
                    Import
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
