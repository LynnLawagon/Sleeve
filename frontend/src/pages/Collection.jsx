import { useState } from "react";
import { Search, Plus, Rows3, Grid3x3 } from "lucide-react";
import { C, FORMATS } from "../constants";
import { norm } from "../utils";
import ShelfView from "../components/ShelfView";
import GridView from "../components/GridView";

export default function Collection({ items, isWishlist, onAdd, onOpen }) {
  const [query, setQuery] = useState("");
  const [formatFilter, setFormatFilter] = useState("All");
  const [sortBy, setSortBy] = useState("artist");
  const [viewMode, setViewMode] = useState("shelf");

  let visible = items;
  if (query.trim()) {
    const q = norm(query);
    visible = visible.filter(
      (i) => norm(i.title).includes(q) || norm(i.artist).includes(q) || (i.tags || []).some((t) => norm(t).includes(q))
    );
  }
  if (formatFilter !== "All") visible = visible.filter((i) => i.format === formatFilter);
  visible = [...visible].sort((a, b) => {
    if (sortBy === "artist") return a.artist.localeCompare(b.artist) || a.title.localeCompare(b.title);
    if (sortBy === "title") return a.title.localeCompare(b.title);
    if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
    if (sortBy === "recent") return new Date(b.addedAt) - new Date(a.addedAt);
    return 0;
  });

  return (
    <>
      <div className="row wrap gap-3" style={{ marginBottom: 20 }}>
        <div className="row gap-2 flex-1" style={{ minWidth: 180, padding: "8px 12px", border: `1px solid ${C.line}` }}>
          <Search size={14} color={C.muted} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="search title, artist, tag..."
            style={{ background: "transparent", border: "none", fontSize: 14, flex: 1, outline: "none" }}
          />
        </div>
        <select className="input" style={{ width: "auto" }} value={formatFilter} onChange={(e) => setFormatFilter(e.target.value)}>
          <option value="All">All formats</option>
          {FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
        {!isWishlist && (
          <select className="input" style={{ width: "auto" }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="artist">Sort: artist</option>
            <option value="title">Sort: title</option>
            <option value="rating">Sort: rating</option>
            <option value="recent">Sort: recently added</option>
          </select>
        )}
        {!isWishlist && (
          <div className="row" style={{ border: `1px solid ${C.line}` }}>
            <button onClick={() => setViewMode("shelf")} style={{ padding: 8, background: viewMode === "shelf" ? C.ink : "transparent", border: "none", cursor: "pointer" }}>
              <Rows3 size={15} color={viewMode === "shelf" ? C.paper : C.muted} />
            </button>
            <button onClick={() => setViewMode("grid")} style={{ padding: 8, background: viewMode === "grid" ? C.ink : "transparent", border: "none", cursor: "pointer" }}>
              <Grid3x3 size={15} color={viewMode === "grid" ? C.paper : C.muted} />
            </button>
          </div>
        )}
        <button onClick={onAdd} className="btn row gap-2">
          <Plus size={14} /> add
        </button>
      </div>

      {isWishlist ? (
        <GridView items={visible} wishlist onOpen={onOpen} />
      ) : viewMode === "shelf" ? (
        <ShelfView items={visible} onOpen={onOpen} />
      ) : (
        <GridView items={visible} onOpen={onOpen} />
      )}
    </>
  );
}
