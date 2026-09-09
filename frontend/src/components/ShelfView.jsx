import { Heart } from "lucide-react";
import { C, formatColor } from "../constants";
import EmptyState from "./EmptyState";

export default function ShelfView({ items, onOpen }) {
  if (items.length === 0) return <EmptyState kind="library" />;

  return (
    <div className="row sleeve-scroll" style={{ alignItems: "flex-end", gap: 3, overflowX: "auto", paddingBottom: 16, minHeight: 260 }}>
      {items.map((it) => {
        const h = it.format === "Vinyl" ? 210 : it.format === "CD" ? 170 : 150;
        return (
          <div key={it.id} className="spine" style={{ position: "relative", flexShrink: 0, width: 30 }}>
            <button
              onClick={() => onOpen(it)}
              className="row center"
              style={{
                width: "100%", alignItems: "flex-end", position: "relative", cursor: "pointer",
                height: h, background: formatColor(it.format), border: "none",
                borderTop: `2px solid ${C.ink}33`,
              }}
            >
              <span
                style={{
                  fontSize: 10, paddingBottom: 8, whiteSpace: "nowrap",
                  writingMode: "vertical-rl", color: "#EDE6D6",
                  maxHeight: h - 16, overflow: "hidden",
                }}
              >
                {it.artist.toUpperCase()} — {it.title}
              </span>
              {it.onRepeat && (
                <Heart size={10} fill={C.paper} color={C.paper} style={{ position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)" }} />
              )}
            </button>
            <div
              className="spine-preview"
              style={{
                position: "absolute", bottom: "100%", left: "50%", marginBottom: 8,
                opacity: 0, pointerEvents: "none", transition: "all .15s",
                transform: "translate(-50%, 4px) scale(0.97)", width: 120, zIndex: 10,
              }}
            >
              <div style={{ background: C.ink, padding: 6 }}>
                <div
                  style={{
                    width: "100%", height: 108, background: C.panel,
                    backgroundImage: it.cover ? `url(${it.cover})` : "none",
                    backgroundSize: "cover", backgroundPosition: "center",
                  }}
                />
                <p style={{ fontSize: 10, marginTop: 4, color: C.paper, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.title}</p>
                <p style={{ fontSize: 9, color: C.steel, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.artist}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
