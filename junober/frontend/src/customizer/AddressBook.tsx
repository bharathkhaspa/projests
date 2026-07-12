import { useState } from "react";
import {
  useAddresses,
  useCreateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
} from "../hooks/useAddresses";
import type { Address, AddressInput } from "../lib/orderTypes";
import * as s from "./authStyles";

const EMPTY: AddressInput = {
  label: "",
  full_name: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  is_default: false,
};

export function AddressBook() {
  const { data: addresses, isLoading } = useAddresses();
  const createMutation = useCreateAddress();
  const deleteMutation = useDeleteAddress();
  const setDefaultMutation = useSetDefaultAddress();

  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<AddressInput>(EMPTY);

  const set = (k: keyof AddressInput, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const list: Address[] = addresses ?? [];

  return (
    <div>
      {isLoading && <p style={{ fontSize: 13, color: "#9ca3af" }}>Loading addresses…</p>}

      {list.map((a) => (
        <div
          key={a.id}
          style={{
            border: a.is_default ? "1.5px solid #0f1115" : "1px solid #e5e7eb",
            borderRadius: 12,
            padding: 14,
            marginBottom: 10,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#0f1115" }}>
                {a.full_name}
                {a.label && (
                  <span style={{ fontSize: 11, color: "#6b7280", marginLeft: 8, fontWeight: 500 }}>
                    {a.label}
                  </span>
                )}
                {a.is_default && (
                  <span style={{ fontSize: 10, background: "#0f1115", color: "#fff", padding: "2px 6px", borderRadius: 6, marginLeft: 8 }}>
                    DEFAULT
                  </span>
                )}
              </div>
              <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4, lineHeight: 1.5 }}>
                {a.line1}{a.line2 ? `, ${a.line2}` : ""}<br />
                {a.city}, {a.state} {a.pincode}<br />
                {a.phone}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 14, marginTop: 10 }}>
            {!a.is_default && (
              <button
                onClick={() => setDefaultMutation.mutate(a.id)}
                style={{ fontSize: 12, color: "#0f1115", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
              >
                Set default
              </button>
            )}
            <button
              onClick={() => deleteMutation.mutate(a.id)}
              style={{ fontSize: 12, color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}

      {adding ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate(form, {
              onSuccess: () => {
                setForm(EMPTY);
                setAdding(false);
              },
            });
          }}
          style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 14, marginTop: 4 }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="Full name" value={form.full_name} onChange={(v) => set("full_name", v)} required />
            <Field label="Phone" value={form.phone} onChange={(v) => set("phone", v)} required />
          </div>
          <Field label="Address line 1" value={form.line1} onChange={(v) => set("line1", v)} required />
          <Field label="Address line 2" value={form.line2} onChange={(v) => set("line2", v)} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <Field label="City" value={form.city} onChange={(v) => set("city", v)} required />
            <Field label="State" value={form.state} onChange={(v) => set("state", v)} required />
            <Field label="Pincode" value={form.pincode} onChange={(v) => set("pincode", v)} required />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, alignItems: "end" }}>
            <Field label="Label (optional)" value={form.label} onChange={(v) => set("label", v)} />
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#374151", paddingBottom: 12 }}>
              <input
                type="checkbox"
                checked={form.is_default}
                onChange={(e) => set("is_default", e.target.checked)}
              />
              Make default
            </label>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <button
              type="button"
              onClick={() => { setAdding(false); setForm(EMPTY); }}
              style={{ ...s.primaryButton, background: "#f3f4f6", color: "#0f1115", flex: 1 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              style={{ ...s.primaryButton, flex: 2, opacity: createMutation.isPending ? 0.7 : 1 }}
            >
              {createMutation.isPending ? "Saving…" : "Save address"}
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          style={{
            width: "100%",
            padding: 13,
            background: "#f3f4f6",
            border: "1px dashed #d1d5db",
            borderRadius: 12,
            color: "#0f1115",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
            marginTop: 4,
          }}
        >
          + Add address
        </button>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={s.label}>{label}</label>
      <input
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        style={s.input}
      />
    </div>
  );
}
