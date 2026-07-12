import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  useChangePassword,
  useLogout,
  useMe,
  useUpdateMe,
} from "../hooks/useAuth";
import { AddressBook } from "../customizer/AddressBook";
import * as s from "../customizer/authStyles";

export default function Account() {
  const navigate = useNavigate();
  const { data: user, isLoading } = useMe();
  const updateMutation = useUpdateMe();
  const passwordMutation = useChangePassword();
  const logout = useLogout();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name);
      setLastName(user.last_name);
      setPhone(user.phone);
    }
  }, [user]);

  if (isLoading) {
    return (
      <main style={s.page}>
        <p style={{ color: "#6b7280" }}>Loading account…</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main style={s.page}>
        <div style={s.card}>
          <h1 style={s.heading}>You're not logged in</h1>
          <p style={s.sub}>Log in to view your account.</p>
          <Link to="/login" style={s.primaryButton as React.CSSProperties}>
            <span style={{ display: "block", textAlign: "center", color: "#fff" }}>Log in</span>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ ...s.page, alignItems: "flex-start", paddingTop: 56 }}>
      <div style={{ ...s.card, maxWidth: 480 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={s.heading}>Account</h1>
          <Link to="/customize" style={s.secondaryLink}>← Customizer</Link>
        </div>
        <p style={s.sub}>{user.email}</p>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "#0f1115", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: 0.5 }}>
            Profile
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateMutation.mutate({
                first_name: firstName,
                last_name: lastName,
                phone,
              });
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, ...s.fieldGroup }}>
              <div>
                <label style={s.label} htmlFor="first_name">First name</label>
                <input
                  id="first_name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  style={s.input}
                />
              </div>
              <div>
                <label style={s.label} htmlFor="last_name">Last name</label>
                <input
                  id="last_name"
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
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={s.input}
              />
            </div>
            {updateMutation.isSuccess && (
              <p style={s.successMsg}>Profile saved.</p>
            )}
            <button
              type="submit"
              disabled={updateMutation.isPending}
              style={{ ...s.primaryButton, opacity: updateMutation.isPending ? 0.7 : 1 }}
            >
              {updateMutation.isPending ? "Saving…" : "Save profile"}
            </button>
          </form>
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "#0f1115", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: 0.5 }}>
            Addresses
          </h2>
          <AddressBook />
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "#0f1115", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: 0.5 }}>
            Change password
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              passwordMutation.mutate(
                { current: currentPwd, next: newPwd },
                {
                  onSuccess: () => {
                    setCurrentPwd("");
                    setNewPwd("");
                  },
                },
              );
            }}
          >
            <div style={s.fieldGroup}>
              <label style={s.label} htmlFor="current">Current password</label>
              <input
                id="current"
                type="password"
                autoComplete="current-password"
                value={currentPwd}
                onChange={(e) => setCurrentPwd(e.target.value)}
                style={s.input}
              />
            </div>
            <div style={s.fieldGroup}>
              <label style={s.label} htmlFor="new">New password</label>
              <input
                id="new"
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                style={s.input}
              />
            </div>
            {passwordMutation.isSuccess && (
              <p style={s.successMsg}>Password updated.</p>
            )}
            {passwordMutation.isError && (
              <p style={s.errorMsg}>Couldn't change password — check current password.</p>
            )}
            <button
              type="submit"
              disabled={passwordMutation.isPending || !currentPwd || !newPwd}
              style={{
                ...s.primaryButton,
                background: "#f3f4f6",
                color: "#0f1115",
                opacity: passwordMutation.isPending || !currentPwd || !newPwd ? 0.7 : 1,
              }}
            >
              {passwordMutation.isPending ? "Updating…" : "Update password"}
            </button>
          </form>
        </section>

        <button
          onClick={() => {
            logout();
            navigate("/");
          }}
          style={{
            ...s.primaryButton,
            background: "transparent",
            color: "#ef4444",
            border: "1px solid #ef4444",
          }}
        >
          Log out
        </button>
      </div>
    </main>
  );
}
