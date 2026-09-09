// frontend/src/components/ItemModal.jsx  
import { useState, useRef, useEffect } from "react";
import { X, Upload, Pencil } from "lucide-react";
import { C, FORMATS, PRIORITIES } from "../constants";
import Stars from "./Stars";
import TagInput from "./TagInput";
import ImageCropper from "./ImageCropper";

function Field({ label, children }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      {children}
    </div>
  );
}

function blankForm() {
  return {
    id: crypto.randomUUID(),
    title: "",
    artist: "",
    format: "Vinyl",
    cover: null,
    year: "",
    rating: 0,
    tags: [],
    recommendedTracks: "",
    location: "",
    notes: "",
    onRepeat: false,
    priority: "Medium",
    link: "",
    addedAt: new Date().toISOString(),
  };
}

export default function ItemModal({ mode, initial, onClose, onSave, duplicateCheck, knownArtists = [], knownGenres = [] }) {
  const isWishlist = mode === "wishlist";
  const [form, setForm] = useState(() => initial || blankForm());
  const [warning, setWarning] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [cropperSrc, setCropperSrc] = useState(null);
  const fileRef = useRef(null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!form.title || !form.artist) { setWarning(null); return; }
    setWarning(duplicateCheck(form.artist, form.title, form.format, form.id));
  }, [form.title, form.artist, form.format]);

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCropperSrc(reader.result);
    reader.readAsDataURL(file);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.artist.trim()) return;
    const recommendedTracks = typeof form.recommendedTracks === "string"
      ? form.recommendedTracks.split(",").map((t) => t.trim()).filter(Boolean)
      : form.recommendedTracks;
    setSaving(true);
    setError(null);
    try {
      await onSave({ ...form, recommendedTracks });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "#20180fcc" }}>
      <div
        className="rise-in sleeve-scroll"
        style={{ width: "100%", maxWidth: 520, background: C.paper, maxHeight: "90vh", overflowY: "auto", border: `1.4px solid ${C.ink}` }}
      >
        <div className="row between" style={{ padding: "16px 24px", borderBottom: `1px solid ${C.line}` }}>
          <h2 className="sleeve-display" style={{ fontSize: 20 }}>
            {initial ? "Edit entry" : isWishlist ? "Add to wishlist" : "Add to shelf"}
          </h2>
          <button className="btn-text" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={submit} className="col gap-4" style={{ padding: 24 }}>
          {!isWishlist && (
            <div className="row gap-4" style={{ alignItems: "flex-start" }}>
              <div
                onClick={() => fileRef.current?.click()}
                className="row center"
                style={{
                  width: 88, height: 88, background: C.panel, cursor: "pointer", flexShrink: 0, position: "relative",
                  border: `1.2px dashed ${C.muted}`,
                  backgroundImage: form.cover ? `url(${form.cover})` : "none",
                  backgroundSize: "cover", backgroundPosition: "center",
                }}
              >
                {!form.cover && (
                  <div style={{ textAlign: "center" }}>
                    <Upload size={16} color={C.muted} style={{ marginBottom: 4 }} />
                    <span style={{ fontSize: 10, color: C.muted }}>cover</span>
                  </div>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              <div style={{ fontSize: 12, color: C.muted, paddingTop: 8 }}>
                Add a photo of the cover or sleeve — you'll be able to drag and zoom it to frame the shot.
                <div className="row gap-3" style={{ marginTop: 6 }}>
                  {form.cover && (
                    <button type="button" className="btn-text row gap-1" style={{ textDecoration: "underline" }} onClick={() => setCropperSrc(form.cover)}>
                      <Pencil size={11} /> adjust
                    </button>
                  )}
                  {form.cover && (
                    <button type="button" className="btn-text" style={{ textDecoration: "underline" }} onClick={() => set("cover", null)}>
                      remove photo
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="grid-auto" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <Field label="Title">
              <input className="input" value={form.title} onChange={(e) => set("title", e.target.value)} required />
            </Field>
            <Field label="Artist">
              <input
                className="input"
                list="known-artists"
                value={form.artist}
                onChange={(e) => set("artist", e.target.value)}
                required
              />
              <datalist id="known-artists">
                {knownArtists.map((a) => <option key={a} value={a} />)}
              </datalist>
            </Field>
          </div>

          {warning && (
            <div style={{ fontSize: 12, padding: "8px 12px", background: `${C.vinyl}14`, color: C.vinyl, border: `1px solid ${C.vinyl}55` }}>
              {warning}
            </div>
          )}

          <div className="grid-auto" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <Field label="Format">
              <select className="input" value={form.format} onChange={(e) => set("format", e.target.value)}>
                {FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </Field>
            <Field label="Year">
              <input className="input" value={form.year} onChange={(e) => set("year", e.target.value)} placeholder="1979" />
            </Field>
          </div>

          {isWishlist ? (
            <div className="grid-auto" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <Field label="Priority">
                <select className="input" value={form.priority} onChange={(e) => set("priority", e.target.value)}>
                  {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </Field>
              <Field label="Link (optional)">
                <input className="input" value={form.link} onChange={(e) => set("link", e.target.value)} placeholder="store or listing url" />
              </Field>
            </div>
          ) : (
            <>
              <Field label="Your rating">
                <Stars value={form.rating} onChange={(v) => set("rating", v)} size={20} />
              </Field>
              <Field label="Where you got it (optional)">
                <input className="input" value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="record shop, a friend, a flea market..." />
              </Field>
              <Field label="Recommended track(s) — where to start (comma separated)">
                <input
                  className="input"
                  value={typeof form.recommendedTracks === "string" ? form.recommendedTracks : form.recommendedTracks.join(", ")}
                  onChange={(e) => set("recommendedTracks", e.target.value)}
                  placeholder="Idioteque, Everything In Its Right Place"
                />
              </Field>
            </>
          )}

          <Field label="Genres / tags">
            <TagInput
              value={form.tags}
              onChange={(v) => set("tags", v)}
              options={knownGenres}
              placeholder="type a genre and press enter..."
            />
          </Field>

          <Field label="Notes (optional)">
            <textarea className="input" rows={2} style={{ resize: "none" }} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
          </Field>

          {!isWishlist && (
            <label className="row gap-2" style={{ fontSize: 12, color: C.muted }}>
              <input type="checkbox" checked={form.onRepeat} onChange={(e) => set("onRepeat", e.target.checked)} />
              on repeat right now
            </label>
          )}

          {error && <p style={{ fontSize: 12, color: C.vinyl }}>{error}</p>}

          <div className="row gap-2">
            <button type="submit" className="btn flex-1" disabled={saving}>
              {saving ? "Saving..." : initial ? "Save changes" : isWishlist ? "Add to wishlist" : "Add to shelf"}
            </button>
            <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
          </div>
        </form>
      </div>

      {cropperSrc && (
        <ImageCropper
          src={cropperSrc}
          onCancel={() => setCropperSrc(null)}
          onConfirm={(dataUrl) => { set("cover", dataUrl); setCropperSrc(null); }}
        />
      )}
    </div>
  );
}