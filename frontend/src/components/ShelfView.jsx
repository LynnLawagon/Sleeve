// frontend/src/components/ShelfView.jsx
import { Heart } from "lucide-react";
import { C, formatColor } from "../constants";
import EmptyState from "./EmptyState";

const SPINE_WIDTH = 46;
const SPINE_GAP = 7;
const LABEL_FONT_SIZE = 11;
// Roughly how tall one character sits in vertical-rl at this font size —
// used to fit the label to the spine instead of clipping it mid-word.
const CHAR_HEIGHT = 12.5;

function fitLabel(text, availableHeight) {
  const budget = Math.max(3, Math.floor(availableHeight / CHAR_HEIGHT));
  if (text.length <= budget) return text;
  return text.slice(0, budget - 1).trimEnd() + "…";
}

export default function ShelfView({ items, onOpen }) {
  if (items.length === 0) return <EmptyState kind="library" />;

  return (
    <div
      className="row sleeve-scroll"
      style={{ alignItems: "flex-end", gap: SPINE_GAP, overflowX: "auto", padding: "24px 4px 16px" }}
    >
      {items.map((it) => {
        const h = it.format === "Vinyl" ? 220 : it.format === "CD" ? 180 : 160;
        const topPad = it.onRepeat ? 26 : 14;
        const label = fitLabel(`${it.artist.toUpperCase()} — ${it.title}`, h - topPad - 14);

        return (
          <div key={it.id} className="spine" style={{ position: "relative", flexShrink: 0, width: SPINE_WIDTH }}>
            <button
              onClick={() => onOpen(it)}
              title={`${it.artist} — ${it.title}`}
              style={{
                width: "100%", display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "flex-start",
                position: "relative", cursor: "pointer",
                height: h, background: formatColor(it.format), border: "none",
                borderTop: `3px solid ${C.ink}40`,
                paddingTop: topPad, paddingBottom: 14,
                boxShadow: "1px 0 0 rgba(0,0,0,0.06) inset",
              }}
            >
              {it.onRepeat && (
                <Heart size={11} fill={C.paper} color={C.paper} style={{ position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)" }} />
              )}
              <span
                style={{
                  fontSize: LABEL_FONT_SIZE, letterSpacing: "0.02em", whiteSpace: "nowrap",
                  writingMode: "vertical-rl", color: "#EDE6D6",
                }}
              >
                {label}
              </span>
            </button>
            <div
              className="spine-preview"
              style={{
                position: "absolute", bottom: "100%", left: "50%", marginBottom: 10,
                opacity: 0, pointerEvents: "none", transition: "all .15s",
                transform: "translate(-50%, 4px) scale(0.97)", width: 128, zIndex: 10,
              }}
            >
              <div style={{ background: C.ink, padding: 7 }}>
                <div
                  style={{
                    width: "100%", height: 114, background: C.panel,
                    backgroundImage: it.cover ? `url(${it.cover})` : "none",
                    backgroundSize: "cover", backgroundPosition: "center",
                  }}
                />
                <p style={{ fontSize: 10, marginTop: 5, color: C.paper, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.title}</p>
                <p style={{ fontSize: 9, color: C.steel, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.artist}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}