import { useState } from "react";
import { C, formatColor } from "../constants";
import { api, setToken } from "../api";

const spineData = [
  { f: "Vinyl", h: 92 }, { f: "CD", h: 68 }, { f: "Cassette", h: 60 },
  { f: "Vinyl", h: 92 }, { f: "Vinyl", h: 92 }, { f: "CD", h: 68 },
  { f: "Cassette", h: 60 }, { f: "Vinyl", h: 92 }, { f: "CD", h: 68 },
  { f: "Vinyl", h: 92 }, { f: "Cassette", h: 60 }, { f: "CD", h: 68 },
  { f: "Vinyl", h: 92 }, { f: "Vinyl", h: 92 }, { f: "Cassette", h: 60 },
  { f: "CD", h: 68 }, { f: "Vinyl", h: 92 }, { f: "Vinyl", h: 92 },
];

export default function SignIn({ onSignedIn, goToSignUp }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resent, setResent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setNeedsVerification(false);
    setResent(false);
    setLoading(true);
    try {
      const { token, user } = await api.login(identifier.trim(), password);
      setToken(token);
      onSignedIn(user);
    } catch (err) {
      setError(err.message);
      if (err.message.toLowerCase().includes("verify")) setNeedsVerification(true);
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    try {
      await api.resendVerification(identifier.trim());
      setResent(true);
    } catch {
      /* resend intentionally never reveals whether the account exists */
      setResent(true);
    }
  };

  return (
    <div className="col" style={{ minHeight: "100vh", justifyContent: "space-between", background: C.paper }}>
      <div className="row center flex-1" style={{ padding: "0 24px" }}>
        <div className="rise-in" style={{ width: "100%", maxWidth: 420 }}>
          <p style={{ color: C.tape, fontSize: 12, marginBottom: 12 }}>a shelf, remembered</p>
          <h1 className="sleeve-display" style={{ fontSize: 44, lineHeight: 1.05, marginBottom: 16 }}>
            Know what's already on the shelf.
          </h1>
          <p className="muted" style={{ fontSize: 14, marginBottom: 32, maxWidth: "38ch" }}>
            Sleeve keeps a record of every record, disc and tape you own, so the next
            crate-dig doesn't end in a second copy of something you already have.
          </p>
          <form onSubmit={submit} className="col gap-3">
            <input
              className="input"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="email or username"
              autoComplete="username"
            />
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
              autoComplete="current-password"
            />
            {error && <p style={{ fontSize: 12, color: C.vinyl }}>{error}</p>}
            {needsVerification && !resent && (
              <button type="button" className="btn-text" style={{ textDecoration: "underline", fontSize: 12, color: C.ink, textAlign: "left" }} onClick={resend}>
                Resend verification email
              </button>
            )}
            {resent && <p style={{ fontSize: 12, color: C.sage }}>If that account needs verifying, a new link is on its way.</p>}
            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
          <p className="muted" style={{ fontSize: 12, marginTop: 24 }}>
            New here?{" "}
            <button className="btn-text" style={{ textDecoration: "underline", color: C.ink }} onClick={goToSignUp}>
              Create an account
            </button>
          </p>
        </div>
      </div>
      <div className="row" style={{ alignItems: "flex-end", gap: 3, padding: "0 24px", overflow: "hidden", height: 110 }}>
        {spineData.map((s, i) => (
          <div key={i} style={{ width: 22, height: s.h, background: formatColor(s.f), opacity: 0.85, borderTop: `2px solid ${C.ink}22` }} />
        ))}
      </div>
    </div>
  );
}
