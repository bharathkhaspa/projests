import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLogin } from "../hooks/useAuth";
import * as s from "../customizer/authStyles";

function errorMessage(err: unknown): string {
  if (typeof err === "object" && err && "response" in err) {
    const r = (err as { response?: { data?: Record<string, unknown> } }).response;
    const data = r?.data ?? {};
    if (typeof data.detail === "string") return data.detail;
    const firstField = Object.values(data)[0];
    if (Array.isArray(firstField) && typeof firstField[0] === "string") return firstField[0];
  }
  return "Couldn't log in. Try again.";
}

export default function Login() {
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(
      { email, password },
      {
        onSuccess: () => navigate("/shop"),
      },
    );
  };

  return (
    <main style={s.page}>
      <div style={s.card}>
        <h1 style={s.heading}>Welcome back</h1>
        <p style={s.sub}>Log in to JunOber.</p>

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
          </div>
          <div style={s.fieldGroup}>
            <label style={s.label} htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={s.input}
            />
          </div>

          {loginMutation.isError && (
            <p style={s.errorMsg}>{errorMessage(loginMutation.error)}</p>
          )}

          <button
            type="submit"
            disabled={loginMutation.isPending}
            style={{ ...s.primaryButton, opacity: loginMutation.isPending ? 0.7 : 1 }}
          >
            {loginMutation.isPending ? "Logging in…" : "Log in"}
          </button>
        </form>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18, fontSize: 13 }}>
          <Link to="/forgot-password" style={s.secondaryLink}>Forgot password?</Link>
          <Link to="/register" style={s.secondaryLink}>Create account</Link>
        </div>
      </div>
    </main>
  );
}
