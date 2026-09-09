import { Heart } from "lucide-react";
import { C, formatColor } from "../constants";
import { initials } from "../utils";
import FormatIcon from "./FormatIcon";
import Stars from "./Stars";
import EmptyState from "./EmptyState";

export default function GridView({ items, onOpen, wishlist }) {
  if (items.length === 0) return <EmptyState kind={wishlist ? "wishlist" : "library"} />;

  return (
    <div className="grid-auto">
      {items.map((it) => (
        <button key={it.id} onClick={() => onOpen(it)} className="col rise-in" style={{ textAlign: "left", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          <div
            style={{
              position: "relative", aspectRatio: "1/1", background: C.panel,
              backgroundImage: it.cover ? `url(${it.cover})` : "none",
              backgroundSize: "cover", backgroundPosition: "center",
              border: `1px solid ${C.line}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            {!it.cover && <span className="sleeve-display" style={{ fontSize: 30, color: C.muted }}>{initials(it.artist)}</span>}
            <span style={{ position: "absolute", top: 6, left: 6, padding: 4, background: `${C.paper}dd` }}>
              <FormatIcon format={it.format} size={12} color={formatColor(it.format)} />
            </span>
            {it.onRepeat && (
              <span style={{ position: "absolute", top: 6, right: 6, padding: 4, background: `${C.paper}dd` }}>
                <Heart size={12} fill={C.vinyl} color={C.vinyl} />
              </span>
            )}
          </div>
          <p style={{ fontSize: 12, marginTop: 6, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.title}</p>
          <p className="muted" style={{ fontSize: 11, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.artist}</p>
          {!wishlist && it.rating > 0 && <div style={{ marginTop: 2 }}><Stars value={it.rating} size={10} /></div>}
          {wishlist && it.priority && (
            <span style={{ fontSize: 10, color: it.priority === "High" ? C.vinyl : C.muted }}>{it.priority} priority</span>
          )}
        </button>
      ))}
    </div>
  );
}
