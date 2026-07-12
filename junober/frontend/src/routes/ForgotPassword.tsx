import { useState } from "react";
import { Link } from "react-router-dom";
import { useRequestPasswordReset } from "../hooks/useAuth";
import * as s from "../customizer/authStyles";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const mutation = useRequestPasswordReset();

  return (
    <main style={s.page}>
      <div style={s.card}>
        <h1 style={s.heading}>Reset your password</h1>
        <p style={s.sub}>
          Enter your account email. We'll send a link if it exists.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate(email);
          }}
        >
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
          </div>

          {mutation.isSuccess && (
            <p style={s.successMsg}>
              If that email exists, a reset link is on its way (check the Django console output in dev).
            </p>
          )}
          {mutation.isError && (
            <p style={s.errorMsg}>Couldn't send reset link. Try again.</p>
          )}

          <button
            type="submit"
            disabled={mutation.isPending}
            style={{ ...s.primaryButton, opacity: mutation.isPending ? 0.7 : 1 }}
          >
            {mutation.isPending ? "Sending…" : "Send reset link"}
          </button>
        </form>

        <p style={{ marginTop: 18, fontSize: 13, color: "#6b7280", textAlign: "center" }}>
          <Link to="/login" style={s.secondaryLink}>Back to login</Link>
        </p>
      </div>
    </main>
  );
}
