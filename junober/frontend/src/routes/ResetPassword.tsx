import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useConfirmPasswordReset } from "../hooks/useAuth";
import * as s from "../customizer/authStyles";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const mutation = useConfirmPasswordReset();

  const uid = params.get("uid") ?? "";
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const linkBroken = !uid || !token;

  return (
    <main style={s.page}>
      <div style={s.card}>
        <h1 style={s.heading}>Set a new password</h1>

        {linkBroken && (
          <p style={s.errorMsg}>
            Reset link is missing the uid or token. Request a new one.
          </p>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (password !== confirm) return;
            mutation.mutate(
              { uid, token, newPassword: password },
              {
                onSuccess: () =>
                  setTimeout(() => navigate("/login"), 1200),
              },
            );
          }}
        >
          <div style={s.fieldGroup}>
            <label style={s.label} htmlFor="password">New password</label>
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
          </div>

          {password && confirm && password !== confirm && (
            <p style={s.errorMsg}>Passwords don't match.</p>
          )}

          {mutation.isSuccess && (
            <p style={s.successMsg}>Password updated. Redirecting to login…</p>
          )}
          {mutation.isError && (
            <p style={s.errorMsg}>
              Reset failed. The link may be expired — request a new one.
            </p>
          )}

          <button
            type="submit"
            disabled={mutation.isPending || linkBroken}
            style={{
              ...s.primaryButton,
              opacity: mutation.isPending || linkBroken ? 0.6 : 1,
              cursor: mutation.isPending || linkBroken ? "not-allowed" : "pointer",
            }}
          >
            {mutation.isPending ? "Saving…" : "Set new password"}
          </button>
        </form>

        <p style={{ marginTop: 18, fontSize: 13, color: "#6b7280", textAlign: "center" }}>
          <Link to="/forgot-password" style={s.secondaryLink}>Request a new link</Link>
        </p>
      </div>
    </main>
  );
}
