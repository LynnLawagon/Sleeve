// frontend/src/components/DetailDrawer.jsx  
import { useState } from "react";
import { X, Heart, Pencil, Trash2, Share2, Copy, Check, Music } from "lucide-react";
import { C, formatColor } from "../constants";
import { initials } from "../utils";
import FormatIcon from "./FormatIcon";
import Stars from "./Stars";

function shareUrl(shareId) {
  // Falls back gracefully if VITE_SHARE_BASE isn't set — uses wherever the
  // app is currently running.
  const base = import.meta.env.VITE_SHARE_BASE || window.location.origin;
  return `${base}/share/${shareId}`;
}

export default function DetailDrawer({ item, onClose, onEdit, onDelete, onToggleRepeat, onToggleShare }) {
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);

  if (!item) return null;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl(item.shareId));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard permissions can silently fail in some browsers — link is still shown below */
    }
  };

  const handleToggleShare = async () => {
    setSharing(true);
    try {
      await onToggleShare(!item.isPublic);
    } finally {
      setSharing(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "#20180fcc" }}>
      <div className="rise-in sleeve-scroll" style={{ width: "100%", maxWidth: 460, maxHeight: "90vh", overflowY: "auto", background: C.paper, border: `1.4px solid ${C.ink}` }}>
        <div className="row between" style={{ padding: "16px 24px", borderBottom: `1px solid ${C.line}` }}>
          <span className="row gap-2" style={{ fontSize: 12, color: formatColor(item.format) }}>
            <FormatIcon format={item.format} color={formatColor(item.format)} /> {item.format}
          </span>
          <button className="btn-text" onClick={onClose}><X size={18} /></button>
        </div>

        <div style={{ padding: 24 }}>
          <div className="row gap-4" style={{ marginBottom: 16, alignItems: "flex-start" }}>
            <div
              style={{
                width: 96, height: 96, flexShrink: 0, background: C.panel,
                backgroundImage: item.cover ? `url(${item.cover})` : "none",
                backgroundSize: "cover", backgroundPosition: "center",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              {!item.cover && <span className="sleeve-display" style={{ fontSize: 24, color: C.muted }}>{initials(item.artist)}</span>}
            </div>
            <div>
              <h3 className="sleeve-display" style={{ fontSize: 24, lineHeight: 1.15 }}>{item.title}</h3>
              <p className="muted" style={{ fontSize: 14, marginBottom: 4 }}>{item.artist}{item.year ? ` · ${item.year}` : ""}</p>
              {item.rating > 0 && <Stars value={item.rating} size={14} />}
            </div>
          </div>

          {(item.location || item.priority) && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", rowGap: 8, fontSize: 12, marginBottom: 12 }}>
              {item.location && <><span className="muted">Source</span><span>{item.location}</span></>}
              {item.priority && <><span className="muted">Priority</span><span>{item.priority}</span></>}
            </div>
          )}

          {item.tags?.length > 0 && (
            <div className="row wrap gap-2" style={{ marginBottom: 12 }}>
              {item.tags.map((t) => (
                <span key={t} style={{ fontSize: 11, padding: "2px 8px", border: `1px solid ${C.line}`, color: C.muted }}>{t}</span>
              ))}
            </div>
          )}

          {item.recommendedTracks?.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <p className="row gap-2 muted" style={{ fontSize: 11, marginBottom: 6 }}>
                <Music size={12} /> start here
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: 13 }}>
                {item.recommendedTracks.map((t) => (
                  <li key={t} style={{ padding: "3px 0", borderBottom: `1px solid ${C.line}` }}>{t}</li>
                ))}
              </ul>
            </div>
          )}

          {item.notes && <p style={{ fontSize: 14, marginBottom: 16 }}>{item.notes}</p>}

          {onToggleShare && (
            <div style={{ marginBottom: 16, padding: 12, border: `1px dashed ${C.line}` }}>
              <button
                onClick={handleToggleShare}
                disabled={sharing}
                className="row gap-2 btn-text"
                style={{ fontSize: 12, color: item.isPublic ? C.sage : C.muted }}
              >
                <Share2 size={13} />
                {item.isPublic ? "Public — anyone with the link can view this" : "Make this album shareable"}
              </button>
              {item.isPublic && item.shareId && (
                <div className="row gap-2" style={{ marginTop: 8 }}>
                  <input
                    readOnly
                    value={shareUrl(item.shareId)}
                    onFocus={(e) => e.target.select()}
                    className="input flex-1"
                    style={{ fontSize: 11 }}
                  />
                  <button onClick={copyLink} className="btn-outline row gap-1" style={{ fontSize: 11, flexShrink: 0 }}>
                    {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? "copied" : "copy"}
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="row gap-2">
            {onToggleRepeat && (
              <button
                onClick={onToggleRepeat}
                className="row gap-2"
                style={{ padding: "8px 12px", fontSize: 12, border: `1px solid ${item.onRepeat ? C.vinyl : C.ink}`, color: item.onRepeat ? C.vinyl : C.ink, background: "transparent", cursor: "pointer" }}
              >
                <Heart size={13} fill={item.onRepeat ? C.vinyl : "none"} /> on repeat
              </button>
            )}
            <button onClick={onEdit} className="row gap-2" style={{ padding: "8px 12px", fontSize: 12, border: `1px solid ${C.ink}`, background: "transparent", cursor: "pointer" }}>
              <Pencil size={13} /> edit
            </button>
            <button onClick={onDelete} className="row gap-2" style={{ marginLeft: "auto", fontSize: 12, color: C.vinyl, background: "none", border: "none", cursor: "pointer" }}>
              <Trash2 size={13} /> remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}