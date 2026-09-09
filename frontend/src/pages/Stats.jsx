import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";
import { C, FORMATS, formatColor } from "../constants";
import EmptyState from "../components/EmptyState";

function StatCard({ label, value }) {
  return (
    <div style={{ padding: "16px 12px", border: `1px solid ${C.line}` }}>
      <p className="sleeve-display" style={{ fontSize: 30, lineHeight: 1, marginBottom: 4 }}>{value}</p>
      <p className="muted" style={{ fontSize: 11 }}>{label}</p>
    </div>
  );
}

export default function Stats({ library }) {
  if (library.length === 0) return <EmptyState kind="library" />;

  const counts = FORMATS.map((f) => ({ format: f, count: library.filter((i) => i.format === f).length })).filter((d) => d.count > 0);
  const rated = library.filter((i) => i.rating > 0).length;
  const avgRating = rated ? (library.reduce((s, i) => s + (i.rating || 0), 0) / library.length).toFixed(1) : null;
  const artistCounts = {};
  library.forEach((i) => { artistCounts[i.artist] = (artistCounts[i.artist] || 0) + 1; });
  const topArtists = Object.entries(artistCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const onRepeat = library.filter((i) => i.onRepeat);
  const genreCount = new Set(library.flatMap((i) => i.tags || [])).size;

  return (
    <div className="col gap-4 rise-in" style={{ gap: 32 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <StatCard label="in the collection" value={library.length} />
        <StatCard label="average rating" value={avgRating ? `${avgRating}★` : "—"} />
        <StatCard label="genres tracked" value={genreCount || "—"} />
      </div>

      <div>
        <h3 className="muted" style={{ fontSize: 12, marginBottom: 12 }}>by format</h3>
        <div style={{ width: "100%", height: 140 }}>
          <ResponsiveContainer>
            <BarChart data={counts} layout="vertical" margin={{ left: 0, right: 16 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="format" tickLine={false} axisLine={false} width={70} tick={{ fontSize: 12, fontFamily: "IBM Plex Mono", fill: C.ink }} />
              <Bar dataKey="count" radius={[0, 2, 2, 0]} barSize={18}>
                {counts.map((d, i) => <Cell key={i} fill={formatColor(d.format)} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {topArtists.length > 0 && (
        <div>
          <h3 className="muted" style={{ fontSize: 12, marginBottom: 12 }}>most represented artists</h3>
          <ul className="col gap-2" style={{ fontSize: 14, listStyle: "none", padding: 0, margin: 0 }}>
            {topArtists.map(([a, c]) => (
              <li key={a} className="row between" style={{ borderBottom: `1px solid ${C.line}`, paddingBottom: 4 }}>
                <span>{a}</span><span className="muted">{c} {c === 1 ? "copy" : "copies"}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {onRepeat.length > 0 && (
        <div>
          <h3 className="muted" style={{ fontSize: 12, marginBottom: 12 }}>on repeat</h3>
          <div className="row wrap gap-2">
            {onRepeat.map((i) => (
              <span key={i.id} style={{ fontSize: 12, padding: "4px 10px", border: `1px solid ${C.vinyl}`, color: C.vinyl }}>
                {i.artist} — {i.title}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
