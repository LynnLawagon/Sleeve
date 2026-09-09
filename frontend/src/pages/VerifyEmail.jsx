import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { C } from "../constants";
import { api, setToken } from "../api";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("checking"); // checking | ok | error
  const [error, setError] = useState("");

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      setStatus("error");
      setError("No verification token in this link.");
      return;
    }
    (async () => {
      try {
        const { token: jwt } = await api.verifyEmail(token);
        setToken(jwt);
        setStatus("ok");
      } catch (err) {
        setStatus("error");
        setError(err.message);
      }
    })();
  }, [params]);

  return (
    <div className="sleeve-root row center" style={{ minHeight: "100vh", background: C.paper, padding: 24 }}>
      <div className="rise-in" style={{ width: "100%", maxWidth: 420, textAlign: "center" }}>
        {status === "checking" && <p className="muted" style={{ fontSize: 14 }}>Verifying your email...</p>}

        {status === "ok" && (
          <>
            <h1 className="sleeve-display" style={{ fontSize: 32, marginBottom: 16 }}>Email verified.</h1>
            <p className="muted" style={{ fontSize: 14, marginBottom: 24 }}>Your shelf is ready.</p>
            <button className="btn" onClick={() => navigate("/")}>Open my shelf</button>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="sleeve-display" style={{ fontSize: 32, marginBottom: 16 }}>That link didn't work.</h1>
            <p style={{ fontSize: 14, color: C.vinyl, marginBottom: 24 }}>{error}</p>
            <button className="btn-outline" onClick={() => navigate("/")}>Back to sign in</button>
          </>
        )}
      </div>
    </div>
  );
}
