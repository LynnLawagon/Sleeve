import { useState, useRef, useEffect } from "react";
import { Shuffle } from "lucide-react";
import { C, FORMATS, formatColor } from "../constants";
import { initials } from "../utils";
import FormatIcon from "../components/FormatIcon";

export default function Spin({ library }) {
  const [formatFilter, setFormatFilter] = useState([]);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [flash, setFlash] = useState(null);
  const timerRef = useRef(null);

  const pool = formatFilter.length === 0 ? library : library.filter((i) => formatFilter.includes(i.format));
  const toggleFormat = (f) => setFormatFilter((cur) => (cur.includes(f) ? cur.filter((x) => x !== f) : [...cur, f]));

  const spin = () => {
    if (pool.length === 0) return;
    setSpinning(true);
    setResult(null);
    let ticks = 0;
    const maxTicks = 14;
    timerRef.current = setInterval(() => {
      setFlash(pool[Math.floor(Math.random() * pool.length)]);
      ticks += 1;
      if (ticks >= maxTicks) {
        clearInterval(timerRef.current);
        const chosen = pool[Math.floor(Math.random() * pool.length)];
        setFlash(chosen);
        setResult(chosen);
        setSpinning(false);
      }
    }, 90);
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  const shown = flash || result;

  return (
    <div className="rise-in">
      <p className="muted" style={{ fontSize: 14, marginBottom: 16 }}>
        Can't decide what to put on? Let the shelf pick for you.
      </p>
      <div className="row wrap gap-2" style={{ marginBottom: 24 }}>
        {FORMATS.filter((f) => library.some((i) => i.format === f)).map((f) => (
          <button
            key={f}
            onClick={() => toggleFormat(f)}
            className="row gap-2"
            style={{
              fontSize: 12, padding: "6px 12px", background: "none", cursor: "pointer",
              border: `1px solid ${formatFilter.includes(f) ? formatColor(f) : C.line}`,
              color: formatFilter.includes(f) ? formatColor(f) : C.muted,
            }}
          >
            <FormatIcon format={f} size={12} color={formatFilter.includes(f) ? formatColor(f) : C.muted} /> {f}
          </button>
        ))}
      </div>

      <div className="col center" style={{ padding: "40px 0", border: `1px dashed ${C.line}` }}>
        {shown ? (
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 140, height: 140, margin: "0 auto 16px", background: C.panel,
                backgroundImage: shown.cover ? `url(${shown.cover})` : "none",
                backgroundSize: "cover", backgroundPosition: "center",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: `1px solid ${C.line}`,
              }}
            >
              {!shown.cover && <span className="sleeve-display" style={{ fontSize: 36, color: C.muted }}>{initials(shown.artist)}</span>}
            </div>
            <p className="sleeve-display" style={{ fontSize: 24 }}>{shown.title}</p>
            <p className="muted" style={{ fontSize: 14 }}>{shown.artist}</p>
          </div>
        ) : (
          <p className="muted" style={{ fontSize: 14 }}>
            {pool.length === 0 ? "Nothing matches that filter yet." : "Ready when you are."}
          </p>
        )}
        <button onClick={spin} disabled={pool.length === 0 || spinning} className="btn row gap-2" style={{ marginTop: 24 }}>
          <Shuffle size={14} /> {result ? "Spin again" : "Spin"}
        </button>
      </div>
    </div>
  );
}
