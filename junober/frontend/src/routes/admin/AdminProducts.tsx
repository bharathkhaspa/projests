import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  adminFetchProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminUpdateVariant,
  adminFetchVariants,
} from "../../lib/catalogApi";

const BRAND = "#FF6B00";
const BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

function imgSrc(path: string | null | undefined) {
  if (!path) return null;
  return path.startsWith("http") ? path : `${BASE}/${path}`;
}

const GARMENT_TYPES = [
  { value: "tshirt", label: "T-Shirt" },
  { value: "polo", label: "Polo" },
  { value: "hoodie", label: "Hoodie" },
  { value: "tank", label: "Tank" },
];

const emptyForm = {
  name: "", slug: "", garment_type: "tshirt",
  base_price: "", description: "", is_active: true, is_featured: false,
};

function Spinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
      <div style={{ width: 40, height: 40, border: "4px solid #eee", borderTop: `4px solid ${BRAND}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#444", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", border: "1px solid #ddd", borderRadius: 8,
  padding: "9px 12px", fontSize: 14, outline: "none", boxSizing: "border-box",
  fontFamily: "system-ui",
};

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null); // null = add, object = edit
  const [form, setForm] = useState({ ...emptyForm });
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [thumbPreview, setThumbPreview] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [expandedStock, setExpandedStock] = useState<string | null>(null);
  const [variantEdits, setVariantEdits] = useState<Record<number, number>>({});
  const [stockVariants, setStockVariants] = useState<any[]>([]);
  const [loadingVariants, setLoadingVariants] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data: products = [], isLoading, isError } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: adminFetchProducts,
  });

  const deleteMutation = useMutation({
    mutationFn: (slug: string) => adminDeleteProduct(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      setDeleteConfirm(null);
    },
  });

  const variantMutation = useMutation({
    mutationFn: ({ id, stock_count }: { id: number; stock_count: number }) =>
      adminUpdateVariant(id, { stock_count }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "products"] }),
  });

  function openAdd() {
    setEditProduct(null);
    setForm({ ...emptyForm });
    setThumbFile(null);
    setThumbPreview(null);
    setFormError("");
    setFormSuccess("");
    setShowModal(true);
  }

  function openEdit(p: any) {
    setEditProduct(p);
    setForm({
      name: p.name ?? "",
      slug: p.slug ?? "",
      garment_type: p.garment_type ?? "tshirt",
      base_price: String(p.base_price ?? ""),
      description: p.description ?? "",
      is_active: !!p.is_active,
      is_featured: !!p.is_featured,
    });
    setThumbFile(null);
    setThumbPreview(imgSrc(p.thumbnail));
    setFormError("");
    setFormSuccess("");
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setFormError("");
    setFormSuccess("");
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setForm(f => ({ ...f, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
      // auto-generate slug from name
      if (name === "name" && !editProduct) {
        setForm(f => ({ ...f, name: value, slug: value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") }));
      }
    }
  }

  function handleThumb(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbFile(file);
    setThumbPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("slug", form.slug);
    fd.append("garment_type", form.garment_type);
    fd.append("base_price", form.base_price);
    fd.append("description", form.description);
    fd.append("is_active", String(form.is_active));
    fd.append("is_featured", String(form.is_featured));
    if (thumbFile) fd.append("thumbnail", thumbFile);

    try {
      if (editProduct) {
        await adminUpdateProduct(editProduct.slug, fd);
        setFormSuccess("Product updated!");
      } else {
        await adminCreateProduct(fd);
        setFormSuccess("Product created!");
      }
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      setTimeout(closeModal, 1000);
    } catch (err: any) {
      const msg = err?.response?.data
        ? Object.entries(err.response.data).map(([k, v]) => `${k}: ${(v as string[]).join?.(" ") ?? v}`).join(" | ")
        : "Failed to save product.";
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleField(product: any, field: "is_active" | "is_featured") {
    const fd = new FormData();
    fd.append(field, String(!product[field]));
    try {
      await adminUpdateProduct(product.slug, fd);
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    } catch {}
  }

  async function handleExpandStock(product: any) {
    if (expandedStock === product.slug) {
      setExpandedStock(null);
      return;
    }
    setExpandedStock(product.slug);
    setLoadingVariants(true);
    try {
      const variants = await adminFetchVariants(product.slug);
      setStockVariants(Array.isArray(variants) ? variants : variants.results ?? []);
      const edits: Record<number, number> = {};
      (Array.isArray(variants) ? variants : variants.results ?? []).forEach((v: any) => {
        edits[v.id] = v.stock_count ?? 0;
      });
      setVariantEdits(edits);
    } catch {
      setStockVariants([]);
    } finally {
      setLoadingVariants(false);
    }
  }

  function saveStock() {
    Object.entries(variantEdits).forEach(([id, stock_count]) => {
      variantMutation.mutate({ id: Number(id), stock_count });
    });
    setExpandedStock(null);
  }

  if (isLoading) return <Spinner />;
  if (isError) return (
    <div style={{ padding: 40, textAlign: "center", color: "#ef4444", fontFamily: "system-ui" }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
      <div>Failed to load products. Make sure the backend is running.</div>
    </div>
  );

  return (
    <div style={{ padding: 32, fontFamily: "system-ui", minHeight: "100vh", background: "#f8f9fa" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f1115", margin: 0 }}>Products</h1>
          <p style={{ color: "#888", margin: "4px 0 0", fontSize: 14 }}>
            {(products as any[]).length} product{(products as any[]).length !== 1 ? "s" : ""}
          </p>
        </div>
        <button onClick={openAdd} style={{
          background: BRAND, color: "#fff", border: "none", borderRadius: 8,
          padding: "10px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          + Add Product
        </button>
      </div>

      {/* Empty state */}
      {(products as any[]).length === 0 && (
        <div style={{
          background: "#fff", borderRadius: 12, border: "1px solid #eee",
          padding: 60, textAlign: "center",
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0f1115" }}>No products yet</h3>
          <p style={{ color: "#888", margin: "8px 0 24px" }}>Add your first product to start selling</p>
          <button onClick={openAdd} style={{
            background: BRAND, color: "#fff", border: "none", borderRadius: 8,
            padding: "12px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer",
          }}>
            + Add Your First Product
          </button>
        </div>
      )}

      {/* Products Table */}
      {(products as any[]).length > 0 && (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #eee", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "#fafafa", borderBottom: "2px solid #f0f0f0" }}>
                  {["", "Product", "Type", "Price", "Stock", "Active", "Featured", "Actions"].map(h => (
                    <th key={h} style={{
                      textAlign: "left", padding: "12px 16px", fontWeight: 600,
                      color: "#888", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(products as any[]).map((p: any) => {
                  const totalStock = (p.variants || []).reduce((s: number, v: any) => s + (v.stock_count ?? 0), 0);
                  const thumb = imgSrc(p.thumbnail);
                  const isExpanded = expandedStock === p.slug;

                  return (
                    <>
                      <tr key={p.id}
                        style={{ borderBottom: "1px solid #f5f5f5", transition: "background 0.1s" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#fafafa")}
                        onMouseLeave={e => (e.currentTarget.style.background = "")}
                      >
                        {/* Thumbnail */}
                        <td style={{ padding: "12px 12px 12px 16px", width: 56 }}>
                          {thumb
                            ? <img src={thumb} alt={p.name} style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover", border: "1px solid #eee" }} />
                            : <div style={{ width: 48, height: 48, borderRadius: 8, background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>👕</div>
                          }
                        </td>

                        {/* Name */}
                        <td style={{ padding: "12px 16px", maxWidth: 200 }}>
                          <div style={{ fontWeight: 600, color: "#0f1115", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>{p.slug}</div>
                        </td>

                        {/* Type */}
                        <td style={{ padding: "12px 16px", color: "#555", textTransform: "capitalize" }}>
                          <span style={{ background: "#f0f0f0", padding: "2px 8px", borderRadius: 12, fontSize: 12 }}>{p.garment_type}</span>
                        </td>

                        {/* Price */}
                        <td style={{ padding: "12px 16px", fontWeight: 600 }}>₹{Number(p.base_price).toFixed(0)}</td>

                        {/* Stock */}
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{
                            background: totalStock === 0 ? "#ffebee" : totalStock < 10 ? "#fff3e0" : "#e8f5e9",
                            color: totalStock === 0 ? "#c62828" : totalStock < 10 ? "#e65100" : "#2e7d32",
                            borderRadius: 12, padding: "3px 10px", fontSize: 12, fontWeight: 600,
                          }}>
                            {totalStock} units
                          </span>
                        </td>

                        {/* Active toggle */}
                        <td style={{ padding: "12px 16px" }}>
                          <button onClick={() => toggleField(p, "is_active")} style={{
                            background: p.is_active ? "#e8f5e9" : "#f5f5f5",
                            color: p.is_active ? "#2e7d32" : "#999",
                            border: "none", borderRadius: 20, padding: "4px 12px",
                            cursor: "pointer", fontSize: 12, fontWeight: 600,
                          }}>
                            {p.is_active ? "✓ Active" : "Hidden"}
                          </button>
                        </td>

                        {/* Featured toggle */}
                        <td style={{ padding: "12px 16px" }}>
                          <button onClick={() => toggleField(p, "is_featured")} style={{
                            background: p.is_featured ? "#fff3e0" : "#f5f5f5",
                            color: p.is_featured ? "#e65100" : "#999",
                            border: "none", borderRadius: 20, padding: "4px 12px",
                            cursor: "pointer", fontSize: 12, fontWeight: 600,
                          }}>
                            {p.is_featured ? "⭐ Featured" : "Normal"}
                          </button>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button onClick={() => openEdit(p)} style={{
                              background: "#e3f2fd", color: "#1565c0",
                              border: "none", borderRadius: 6, padding: "5px 10px",
                              cursor: "pointer", fontSize: 12, fontWeight: 500,
                            }}>✏️ Edit</button>
                            <button onClick={() => handleExpandStock(p)} style={{
                              background: isExpanded ? "#FF6B00" : "#f0f0f0",
                              color: isExpanded ? "#fff" : "#555",
                              border: "none", borderRadius: 6, padding: "5px 10px",
                              cursor: "pointer", fontSize: 12, fontWeight: 500,
                            }}>📦 Stock</button>
                            <button onClick={() => setDeleteConfirm(p.slug)} style={{
                              background: "#ffebee", color: "#c62828",
                              border: "none", borderRadius: 6, padding: "5px 10px",
                              cursor: "pointer", fontSize: 12, fontWeight: 500,
                            }}>🗑</button>
                          </div>
                        </td>
                      </tr>

                      {/* Stock editor row */}
                      {isExpanded && (
                        <tr key={`${p.id}-stock`} style={{ background: "#fff8f0" }}>
                          <td colSpan={8} style={{ padding: "16px 24px", borderBottom: "2px solid #ffe0b2" }}>
                            <div style={{ fontWeight: 700, color: "#e65100", marginBottom: 12, fontSize: 13 }}>
                              📦 Edit Stock — {p.name}
                            </div>
                            {loadingVariants && <div style={{ color: "#888", fontSize: 13 }}>Loading variants…</div>}
                            {!loadingVariants && stockVariants.length === 0 && (
                              <div style={{ color: "#aaa", fontSize: 13 }}>
                                No variants yet. Go to Django Admin → Products → {p.name} to add color/size variants.
                              </div>
                            )}
                            {!loadingVariants && stockVariants.length > 0 && (
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
                                {stockVariants.map((v: any) => (
                                  <div key={v.id} style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", borderRadius: 8, padding: "8px 12px", border: "1px solid #ffe0b2" }}>
                                    <div style={{ width: 14, height: 14, borderRadius: "50%", background: v.color?.hex_code || "#ccc", border: "1px solid rgba(0,0,0,0.1)", flexShrink: 0 }} />
                                    <span style={{ fontSize: 13, fontWeight: 500, color: "#333" }}>
                                      {v.color?.name} / {v.size?.code}
                                    </span>
                                    <input
                                      type="number" min={0}
                                      value={variantEdits[v.id] ?? v.stock_count ?? 0}
                                      onChange={e => setVariantEdits(prev => ({ ...prev, [v.id]: parseInt(e.target.value) || 0 }))}
                                      style={{ width: 64, border: "1px solid #ddd", borderRadius: 6, padding: "4px 8px", fontSize: 13, textAlign: "center" }}
                                    />
                                  </div>
                                ))}
                                <button onClick={saveStock} style={{
                                  background: BRAND, color: "#fff", border: "none",
                                  borderRadius: 8, padding: "8px 20px", cursor: "pointer",
                                  fontSize: 13, fontWeight: 700,
                                }}>
                                  Save Stock
                                </button>
                                <button onClick={() => setExpandedStock(null)} style={{
                                  background: "#f0f0f0", color: "#555", border: "none",
                                  borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13,
                                }}>
                                  Cancel
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}

                      {/* Delete confirm row */}
                      {deleteConfirm === p.slug && (
                        <tr key={`${p.id}-del`} style={{ background: "#fff8f8" }}>
                          <td colSpan={8} style={{ padding: "14px 24px", borderBottom: "2px solid #ffcdd2" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                              <span style={{ color: "#c62828", fontWeight: 500, fontSize: 14 }}>
                                Delete <strong>{p.name}</strong>? This cannot be undone.
                              </span>
                              <button onClick={() => deleteMutation.mutate(p.slug)} style={{ background: "#c62828", color: "#fff", border: "none", borderRadius: 6, padding: "7px 18px", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
                                Yes, Delete
                              </button>
                              <button onClick={() => setDeleteConfirm(null)} style={{ background: "#f0f0f0", color: "#555", border: "none", borderRadius: 6, padding: "7px 16px", cursor: "pointer", fontSize: 13 }}>
                                Cancel
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
          onClick={e => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: "100%", maxWidth: 560, maxHeight: "92vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.25)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#0f1115" }}>
                {editProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <button onClick={closeModal} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#aaa", lineHeight: 1 }}>✕</button>
            </div>

            {formError && (
              <div style={{ background: "#ffebee", color: "#c62828", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13 }}>
                {formError}
              </div>
            )}
            {formSuccess && (
              <div style={{ background: "#e8f5e9", color: "#2e7d32", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13 }}>
                {formSuccess}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Thumbnail upload */}
              <Field label="Product Image / Thumbnail">
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{
                    width: 80, height: 80, borderRadius: 10, border: "2px dashed #ddd",
                    background: "#fafafa", overflow: "hidden",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    {thumbPreview
                      ? <img src={thumbPreview} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <span style={{ fontSize: 28, color: "#ccc" }}>📷</span>}
                  </div>
                  <div>
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleThumb} style={{ display: "none" }} id="thumb-upload" />
                    <label htmlFor="thumb-upload" style={{
                      display: "inline-block", padding: "8px 16px", background: "#f0f0f0",
                      borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#444",
                    }}>
                      {thumbPreview ? "Change Image" : "Upload Image"}
                    </label>
                    <div style={{ fontSize: 11, color: "#aaa", marginTop: 6 }}>JPG, PNG, WebP — max 5MB</div>
                  </div>
                </div>
              </Field>

              {/* Name */}
              <Field label="Product Name *">
                <input name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Oversized Cotton T-Shirt"
                  style={inputStyle} />
              </Field>

              {/* Slug */}
              <Field label="Slug (URL identifier) *">
                <input name="slug" value={form.slug} onChange={handleChange} required placeholder="e.g. oversized-cotton-tshirt"
                  style={{ ...inputStyle, fontFamily: "monospace", background: "#fafafa" }} />
              </Field>

              {/* Price + Garment in one row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#444", marginBottom: 6 }}>Garment Type *</label>
                  <select name="garment_type" value={form.garment_type} onChange={handleChange}
                    style={{ ...inputStyle, background: "#fff" }}>
                    {GARMENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#444", marginBottom: 6 }}>Base Price (₹) *</label>
                  <input name="base_price" type="number" min={0} step={0.01} value={form.base_price} onChange={handleChange} required placeholder="499"
                    style={inputStyle} />
                </div>
              </div>

              {/* Description */}
              <Field label="Description">
                <textarea name="description" value={form.description} onChange={handleChange} rows={3}
                  placeholder="Describe the product materials, fit, and features..."
                  style={{ ...inputStyle, resize: "vertical" }} />
              </Field>

              {/* Toggles */}
              <div style={{ display: "flex", gap: 32, marginBottom: 28 }}>
                {[{ name: "is_active", label: "Active (visible to customers)" }, { name: "is_featured", label: "Featured (shown on homepage)" }].map(cb => (
                  <label key={cb.name} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14, fontWeight: 500, color: "#444" }}>
                    <input type="checkbox" name={cb.name} checked={(form as any)[cb.name]} onChange={handleChange}
                      style={{ width: 16, height: 16, accentColor: BRAND }} />
                    {cb.label}
                  </label>
                ))}
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button type="submit" disabled={submitting} style={{
                  flex: 1, background: submitting ? "#ccc" : BRAND, color: "#fff",
                  border: "none", borderRadius: 8, padding: 12,
                  fontSize: 15, fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer",
                }}>
                  {submitting ? "Saving…" : editProduct ? "Save Changes" : "Create Product"}
                </button>
                <button type="button" onClick={closeModal} style={{
                  flex: 1, background: "#f0f0f0", color: "#555",
                  border: "none", borderRadius: 8, padding: 12, fontSize: 15, fontWeight: 500, cursor: "pointer",
                }}>
                  Cancel
                </button>
              </div>
            </form>

            {!editProduct && (
              <p style={{ marginTop: 16, fontSize: 12, color: "#aaa", textAlign: "center" }}>
                After creating, go to <strong>Edit Stock</strong> in the table to set color/size variants and stock counts.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
