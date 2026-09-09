import { useState } from "react";
import { C } from "../constants";
import { api } from "../api";

export default function SignUp({ goToSignIn }) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    try {
      await api.signup(email.trim(), username.trim(), password);
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="row center" style={{ minHeight: "100vh", background: C.paper, padding: 24 }}>
        <div className="rise-in" style={{ width: "100%", maxWidth: 420, textAlign: "center" }}>
          <h1 className="sleeve-display" style={{ fontSize: 32, marginBottom: 16 }}>Check your inbox.</h1>
          <p className="muted" style={{ fontSize: 14, marginBottom: 24 }}>
            We sent a verification link to <strong style={{ color: C.ink }}>{email}</strong>.
            Open it to activate your shelf, then come back and sign in.
          </p>
          <button className="btn-text" style={{ textDecoration: "underline", color: C.ink, fontSize: 13 }} onClick={goToSignIn}>
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="row center" style={{ minHeight: "100vh", background: C.paper, padding: 24 }}>
      <div className="rise-in" style={{ width: "100%", maxWidth: 420 }}>
        <p style={{ color: C.tape, fontSize: 12, marginBottom: 12 }}>a shelf, remembered</p>
        <h1 className="sleeve-display" style={{ fontSize: 36, lineHeight: 1.1, marginBottom: 24 }}>
          Set up your shelf.
        </h1>
        <form onSubmit={submit} className="col gap-3">
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" autoComplete="email" required />
          <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" autoComplete="username" required />
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password (8+ characters)" autoComplete="new-password" required />
          <input className="input" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="confirm password" autoComplete="new-password" required />
          {error && <p style={{ fontSize: 12, color: C.vinyl }}>{error}</p>}
          <button type="submit" className="btn" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>
        <p className="muted" style={{ fontSize: 12, marginTop: 24 }}>
          Already have a shelf?{" "}
          <button className="btn-text" style={{ textDecoration: "underline", color: C.ink }} onClick={goToSignIn}>
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
