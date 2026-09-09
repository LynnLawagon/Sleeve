// frontend/src/components/TagInput.jsx  (NEW FILE)
import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { C } from "../constants";

export default function TagInput({ value, onChange, options = [], placeholder }) {
  const [draft, setDraft] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const tags = Array.isArray(value) ? value : [];

  const suggestions = options
    .filter((o) => !tags.some((t) => t.toLowerCase() === o.toLowerCase()))
    .filter((o) => o.toLowerCase().includes(draft.trim().toLowerCase()))
    .slice(0, 8);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const addTag = (raw) => {
    const t = raw.trim();
    if (!t) return;
    if (tags.some((x) => x.toLowerCase() === t.toLowerCase())) { setDraft(""); return; }
    onChange([...tags, t]);
    setDraft("");
  };

  const removeTag = (t) => onChange(tags.filter((x) => x !== t));

  const onKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(draft);
    } else if (e.key === "Backspace" && !draft && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <div
        className="row wrap gap-2"
        style={{ border: `1px solid ${C.line}`, padding: "6px 8px", minHeight: 38 }}
        onClick={() => wrapRef.current?.querySelector("input")?.focus()}
      >
        {tags.map((t) => (
          <span key={t} className="row gap-1" style={{ fontSize: 12, padding: "2px 6px 2px 8px", background: C.panel, border: `1px solid ${C.line}` }}>
            {t}
            <button type="button" onClick={(e) => { e.stopPropagation(); removeTag(t); }} className="btn-text" style={{ display: "flex" }}>
              <X size={11} color={C.muted} />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={tags.length === 0 ? placeholder : ""}
          style={{ border: "none", outline: "none", background: "transparent", fontSize: 13, flex: 1, minWidth: 80 }}
        />
      </div>

      {open && suggestions.length > 0 && (
        <div
          className="sleeve-scroll"
          style={{
            position: "absolute", top: "100%", left: 0, right: 0, marginTop: 2,
            background: C.paper, border: `1px solid ${C.ink}`, maxHeight: 160, overflowY: "auto", zIndex: 20,
          }}
        >
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addTag(s)}
              className="btn-text"
              style={{ display: "block", width: "100%", textAlign: "left", padding: "7px 10px", fontSize: 13 }}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}