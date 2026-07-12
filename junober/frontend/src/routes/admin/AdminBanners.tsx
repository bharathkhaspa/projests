import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminFetchBanners, adminCreateBanner, adminDeleteBanner } from "../../lib/catalogApi";
import { api } from "../../lib/api";

const BRAND = "#FF6B00";

const initialForm = {
  title: "",
  subtitle: "",
  link_url: "",
  link_label: "",
  sort_order: "0",
};

function Spinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
      <div style={{ width: 40, height: 40, border: "4px solid #eee", borderTop: `4px solid ${BRAND}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function AdminBanners() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ ...initialForm });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: banners = [], isLoading, isError } = useQuery({
    queryKey: ["admin", "banners"],
    queryFn: adminFetchBanners,
  });

  const createMutation = useMutation({
    mutationFn: (formData: FormData) => adminCreateBanner(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "banners"] });
      setForm({ ...initialForm });
      setImageFile(null);
      setImagePreview(null);
      if (fileRef.current) fileRef.current.value = "";
      setFormSuccess("Banner uploaded successfully!");
      setTimeout(() => setFormSuccess(""), 2500);
    },
    onError: () => {
      setFormError("Failed to upload banner. Please try again.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminDeleteBanner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "banners"] });
      setDeleteConfirm(null);
    },
  });

  const handleToggleActive = async (banner: any) => {
    try {
      await api.patch(`/api/catalog/admin-api/banners/${banner.id}/`, { is_active: !banner.is_active });
      queryClient.invalidateQueries({ queryKey: ["admin", "banners"] });
    } catch (err) {
      console.error("Failed to toggle banner:", err);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!imageFile) {
      setFormError("Please select an image file.");
      return;
    }
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("subtitle", form.subtitle);
    fd.append("link_url", form.link_url);
    fd.append("link_label", form.link_label);
    fd.append("sort_order", form.sort_order);
    fd.append("image", imageFile);
    createMutation.mutate(fd);
  };

  if (isLoading) return <Spinner />;
  if (isError) return <div style={{ padding: 40, color: "#ef4444", fontFamily: "system-ui" }}>Failed to load banners.</div>;

  return (
    <div style={{ padding: 32, fontFamily: "system-ui" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#0f1115", margin: 0 }}>Banners</h1>
        <p style={{ color: "#888", margin: "4px 0 0", fontSize: 14 }}>Manage homepage and promotional banners</p>
      </div>

      {/* Upload Form */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #eee", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", padding: 28, marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f1115", margin: "0 0 20px" }}>Upload New Banner</h2>

        {formError && <div style={{ background: "#ffebee", color: "#c62828", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13 }}>{formError}</div>}
        {formSuccess && <div style={{ background: "#e8f5e9", color: "#2e7d32", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13 }}>{formSuccess}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#444", marginBottom: 6 }}>Title <span style={{ color: BRAND }}>*</span></label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleFormChange}
                required
                placeholder="Banner title"
                style={{ width: "100%", border: "1px solid #ddd", borderRadius: 8, padding: "9px 12px", fontSize: 14, outline: "none", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#444", marginBottom: 6 }}>Subtitle</label>
              <input
                type="text"
                name="subtitle"
                value={form.subtitle}
                onChange={handleFormChange}
                placeholder="Optional subtitle"
                style={{ width: "100%", border: "1px solid #ddd", borderRadius: 8, padding: "9px 12px", fontSize: 14, outline: "none", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#444", marginBottom: 6 }}>Link URL</label>
              <input
                type="text"
                name="link_url"
                value={form.link_url}
                onChange={handleFormChange}
                placeholder="/products or https://..."
                style={{ width: "100%", border: "1px solid #ddd", borderRadius: 8, padding: "9px 12px", fontSize: 14, outline: "none", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#444", marginBottom: 6 }}>Link Label</label>
              <input
                type="text"
                name="link_label"
                value={form.link_label}
                onChange={handleFormChange}
                placeholder="e.g. Shop Now"
                style={{ width: "100%", border: "1px solid #ddd", borderRadius: 8, padding: "9px 12px", fontSize: 14, outline: "none", boxSizing: "border-box" }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#444", marginBottom: 6 }}>Sort Order</label>
              <input
                type="number"
                name="sort_order"
                value={form.sort_order}
                onChange={handleFormChange}
                min={0}
                style={{ width: "100%", border: "1px solid #ddd", borderRadius: 8, padding: "9px 12px", fontSize: 14, outline: "none", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#444", marginBottom: 6 }}>Image File <span style={{ color: BRAND }}>*</span></label>
              <div
                onClick={() => fileRef.current?.click()}
                style={{
                  border: "2px dashed #ddd",
                  borderRadius: 8,
                  padding: "10px 14px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: "#fafafa",
                  transition: "border-color 0.15s",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = BRAND)}
                onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = "#ddd")}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="preview" style={{ width: 40, height: 40, borderRadius: 6, objectFit: "cover" }} />
                ) : (
                  <span style={{ fontSize: 22 }}>🖼️</span>
                )}
                <span style={{ fontSize: 13, color: imageFile ? "#0f1115" : "#aaa" }}>
                  {imageFile ? imageFile.name : "Click to select image…"}
                </span>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={createMutation.isPending}
            style={{
              background: createMutation.isPending ? "#ddd" : BRAND,
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "11px 28px",
              fontSize: 14,
              fontWeight: 600,
              cursor: createMutation.isPending ? "default" : "pointer",
              transition: "background 0.15s",
            }}
          >
            {createMutation.isPending ? "Uploading…" : "Upload Banner"}
          </button>
        </form>
      </div>

      {/* Banners Grid */}
      {banners.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#aaa", background: "#fff", borderRadius: 12, border: "1px solid #eee" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🖼️</div>
          <div style={{ fontSize: 16, fontWeight: 500 }}>No banners yet</div>
          <div style={{ fontSize: 13, marginTop: 6 }}>Upload your first banner above</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
          {banners.map((banner: any) => (
            <div
              key={banner.id}
              style={{
                background: "#fff",
                borderRadius: 12,
                border: "1px solid #eee",
                boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Preview Image */}
              <div style={{ position: "relative", aspectRatio: "16/7", background: "#f0f0f0", overflow: "hidden" }}>
                {banner.image ? (
                  <img
                    src={banner.image}
                    alt={banner.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 40 }}>🖼️</div>
                )}
                <div style={{ position: "absolute", top: 8, right: 8 }}>
                  <span style={{
                    background: banner.is_active ? "#e8f5e9" : "#f0f0f0",
                    color: banner.is_active ? "#2e7d32" : "#999",
                    borderRadius: 20,
                    padding: "3px 9px",
                    fontSize: 11,
                    fontWeight: 700,
                    backdropFilter: "blur(4px)",
                  }}>
                    {banner.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding: "14px 16px", flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#0f1115", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {banner.title || "Untitled"}
                </div>
                {banner.subtitle && (
                  <div style={{ fontSize: 13, color: "#888", marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {banner.subtitle}
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                  <span style={{ fontSize: 11, color: "#bbb" }}>Sort:</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>{banner.sort_order ?? 0}</span>
                </div>
                {banner.link_url && (
                  <div style={{ marginTop: 4, fontSize: 12, color: BRAND, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    🔗 {banner.link_label || banner.link_url}
                  </div>
                )}
              </div>

              {/* Card Actions */}
              <div style={{ padding: "10px 16px 14px", display: "flex", gap: 8, borderTop: "1px solid #f5f5f5" }}>
                <button
                  onClick={() => handleToggleActive(banner)}
                  style={{
                    flex: 1,
                    background: banner.is_active ? "#fff3e0" : "#e8f5e9",
                    color: banner.is_active ? "#e65100" : "#2e7d32",
                    border: "none",
                    borderRadius: 7,
                    padding: "7px",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {banner.is_active ? "Deactivate" : "Activate"}
                </button>

                {deleteConfirm === banner.id ? (
                  <div style={{ display: "flex", gap: 6, flex: 1 }}>
                    <button
                      onClick={() => deleteMutation.mutate(banner.id)}
                      style={{ flex: 1, background: "#c62828", color: "#fff", border: "none", borderRadius: 7, padding: "7px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      style={{ flex: 1, background: "#f0f0f0", color: "#555", border: "none", borderRadius: 7, padding: "7px", fontSize: 12, cursor: "pointer" }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(banner.id)}
                    style={{
                      flex: 1,
                      background: "#ffebee",
                      color: "#c62828",
                      border: "none",
                      borderRadius: 7,
                      padding: "7px",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
