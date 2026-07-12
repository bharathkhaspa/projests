import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRegister } from "../hooks/useAuth";
import * as s from "../customizer/authStyles";

interface FieldErrors {
  [key: string]: string | undefined;
}

function parseFieldErrors(err: unknown): FieldErrors {
  if (typeof err === "object" && err && "response" in err) {
    const r = (err as { response?: { data?: Record<string, unknown> } }).response;
    const data = r?.data ?? {};
    const out: FieldErrors = {};
    for (const [k, v] of Object.entries(data)) {
      if (typeof v === "string") out[k] = v;
      else if (Array.isArray(v) && typeof v[0] === "string") out[k] = v[0];
    }
    return out;
  }
  return {};
}

export default function Register() {
  const navigate = useNavigate();
  const registerMutation = useRegister();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(
      {
        email,
        password,
        password_confirm: confirm,
        first_name: firstName,
        last_name: lastName,
        phone,
      },
      {
        onSuccess: () => navigate("/shop"),
      },
    );
  };

  const fieldErrors = registerMutation.isError ? parseFieldErrors(registerMutation.error) : {};

  return (
    <main style={s.page}>
      <div style={s.card}>
        <h1 style={s.heading}>Create your account</h1>
        <p style={s.sub}>Save designs, track orders, get cashback.</p>

        <form onSubmit={onSubmit}>
          <div style={s.fieldGroup}>
            <label style={s.label} htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={s.input}
            />
            {fieldErrors.email && <p style={s.errorMsg}>{fieldErrors.email}</p>}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, ...s.fieldGroup }}>
            <div>
              <label style={s.label} htmlFor="first_name">First name</label>
              <input
                id="first_name"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                style={s.input}
              />
            </div>
            <div>
              <label style={s.label} htmlFor="last_name">Last name</label>
              <input
                id="last_name"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                style={s.input}
              />
            </div>
          </div>

          <div style={s.fieldGroup}>
            <label style={s.label} htmlFor="phone">Phone</label>
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+91 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={s.input}
            />
            {fieldErrors.phone && <p style={s.errorMsg}>{fieldErrors.phone}</p>}
          </div>

          <div style={s.fieldGroup}>
            <label style={s.label} htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={s.input}
            />
            {fieldErrors.password && <p style={s.errorMsg}>{fieldErrors.password}</p>}
          </div>

          <div style={s.fieldGroup}>
            <label style={s.label} htmlFor="confirm">Confirm password</label>
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              style={s.input}
            />
            {fieldErrors.password_confirm && (
              <p style={s.errorMsg}>{fieldErrors.password_confirm}</p>
            )}
          </div>

          {fieldErrors.non_field_errors && (
            <p style={s.errorMsg}>{fieldErrors.non_field_errors}</p>
          )}

          <button
            type="submit"
            disabled={registerMutation.isPending}
            style={{ ...s.primaryButton, opacity: registerMutation.isPending ? 0.7 : 1 }}
          >
            {registerMutation.isPending ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p style={{ marginTop: 18, fontSize: 13, color: "#6b7280", textAlign: "center" }}>
          Already have an account? <Link to="/login" style={s.secondaryLink}>Log in</Link>
        </p>
      </div>
    </main>
  );
}
