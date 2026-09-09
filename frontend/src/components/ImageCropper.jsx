// frontend/src/components/ImageCropper.jsx  (NEW FILE)
import { useState, useRef, useEffect, useCallback } from "react";
import { C } from "../constants";

const BOX = 220; // preview square, in css px
const OUTPUT = 480; // exported image resolution

export default function ImageCropper({ src, onConfirm, onCancel }) {
  const imgRef = useRef(null);
  const [natural, setNatural] = useState(null); // { w, h }
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragRef = useRef(null);

  const baseScale = natural ? Math.max(BOX / natural.w, BOX / natural.h) : 1;
  const scale = baseScale * zoom;
  const dispW = natural ? natural.w * scale : BOX;
  const dispH = natural ? natural.h * scale : BOX;

  const clamp = useCallback(
    (p, w, h) => ({
      x: Math.min(0, Math.max(BOX - w, p.x)),
      y: Math.min(0, Math.max(BOX - h, p.y)),
    }),
    []
  );

  useEffect(() => {
    if (!natural) return;
    setPan((p) => clamp(p, dispW, dispH));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom, natural]);

  const onImgLoad = (e) => {
    const w = e.target.naturalWidth;
    const h = e.target.naturalHeight;
    setNatural({ w, h });
    const bs = Math.max(BOX / w, BOX / h);
    setPan({ x: (BOX - w * bs) / 2, y: (BOX - h * bs) / 2 });
  };

  const onPointerDown = (e) => {
    dragRef.current = { startX: e.clientX, startY: e.clientY, pan };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPan(clamp({ x: dragRef.current.pan.x + dx, y: dragRef.current.pan.y + dy }, dispW, dispH));
  };
  const onPointerUp = () => { dragRef.current = null; };

  const confirm = () => {
    if (!natural) return;
    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT;
    canvas.height = OUTPUT;
    const ctx = canvas.getContext("2d");
    const sx = Math.max(0, Math.min(natural.w - BOX / scale, -pan.x / scale));
    const sy = Math.max(0, Math.min(natural.h - BOX / scale, -pan.y / scale));
    const sSize = BOX / scale;
    ctx.drawImage(imgRef.current, sx, sy, sSize, sSize, 0, 0, OUTPUT, OUTPUT);
    onConfirm(canvas.toDataURL("image/jpeg", 0.82));
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "#20180fcc" }}>
      <div className="rise-in" style={{ background: C.paper, border: `1.4px solid ${C.ink}`, padding: 20, width: "100%", maxWidth: 320 }}>
        <p style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>Drag to reposition, use the slider to zoom.</p>

        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          style={{
            width: BOX, height: BOX, overflow: "hidden", position: "relative",
            border: `1px solid ${C.line}`, cursor: "grab", touchAction: "none", background: C.panel,
          }}
        >
          <img
            ref={imgRef}
            src={src}
            onLoad={onImgLoad}
            draggable={false}
            alt=""
            style={{
              position: "absolute", left: pan.x, top: pan.y,
              width: dispW, height: dispH, maxWidth: "none", userSelect: "none",
            }}
          />
        </div>

        <input
          type="range"
          min="1"
          max="3"
          step="0.01"
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          style={{ width: "100%", marginTop: 14 }}
        />

        <div className="row gap-2" style={{ marginTop: 16 }}>
          <button type="button" onClick={confirm} className="btn flex-1">Use this photo</button>
          <button type="button" onClick={onCancel} className="btn-outline">Cancel</button>
        </div>
      </div>
    </div>
  );
}