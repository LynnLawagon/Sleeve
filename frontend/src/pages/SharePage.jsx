import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Music } from "lucide-react";
import { C, formatColor } from "../constants";
import { initials } from "../utils";
import FormatIcon from "../components/FormatIcon";
import Stars from "../components/Stars";

export default function SharePage() {
  const { shareId } = useParams();
  const [item, setItem] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ok | notfound

  useEffect(() => {
    (async () => {
      try {
        const base = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
        const res = await fetch(`${base}/share/${shareId}`);
        if (!res.ok) { setStatus("notfound"); return; }
        const data = await res.json();
        setItem(data.item);
        setStatus("ok");
      } catch {
        setStatus("notfound");
      }
    })();
  }, [shareId]);

  if (status === "loading") {
    return (
      <div className="sleeve-root row center" style={{ minHeight: "100vh", background: C.paper }}>
        <p className="muted" style={{ fontSize: 14 }}>Loading...</p>
      </div>
    );
  }

  if (status === "notfound") {
    return (
      <div className="sleeve-root row center" style={{ minHeight: "100vh", background: C.paper, padding: 24 }}>
        <div style={{ textAlign: "center" }}>
          <p className="sleeve-display" style={{ fontSize: 28, marginBottom: 8 }}>This link isn't active.</p>
          <p className="muted" style={{ fontSize: 14 }}>The owner may have made this album private again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sleeve-root row center" style={{ minHeight: "100vh", background: C.paper, padding: 24 }}>
      <div className="rise-in" style={{ width: "100%", maxWidth: 420 }}>
        <p className="row gap-2" style={{ fontSize: 12, color: formatColor(item.format), marginBottom: 16 }}>
          <FormatIcon format={item.format} color={formatColor(item.format)} /> shared from a Sleeve shelf
        </p>

        <div
          style={{
            width: "100%", aspectRatio: "1/1", background: C.panel,
            backgroundImage: item.cover ? `url(${item.cover})` : "none",
            backgroundSize: "cover", backgroundPosition: "center",
            display: "flex", alignItems: "center", justifyContent: "center",
            border: `1px solid ${C.line}`, marginBottom: 20,
          }}
        >
          {!item.cover && <span className="sleeve-display" style={{ fontSize: 48, color: C.muted }}>{initials(item.artist)}</span>}
        </div>

        <h1 className="sleeve-display" style={{ fontSize: 32, lineHeight: 1.1, marginBottom: 4 }}>{item.title}</h1>
        <p className="muted" style={{ fontSize: 15, marginBottom: 8 }}>{item.artist}{item.year ? ` · ${item.year}` : ""}</p>
        {item.rating > 0 && <div style={{ marginBottom: 16 }}><Stars value={item.rating} size={16} /></div>}

        {item.tags?.length > 0 && (
          <div className="row wrap gap-2" style={{ marginBottom: 20 }}>
            {item.tags.map((t) => (
              <span key={t} style={{ fontSize: 11, padding: "2px 8px", border: `1px solid ${C.line}`, color: C.muted }}>{t}</span>
            ))}
          </div>
        )}

        {item.recommendedTracks?.length > 0 && (
          <div>
            <p className="row gap-2 muted" style={{ fontSize: 12, marginBottom: 8 }}>
              <Music size={13} /> start here
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: 14 }}>
              {item.recommendedTracks.map((t) => (
                <li key={t} style={{ padding: "6px 0", borderBottom: `1px solid ${C.line}` }}>{t}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
