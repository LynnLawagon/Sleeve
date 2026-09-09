export default function EmptyState({ kind }) {
  const copy =
    kind === "wishlist"
      ? {
          h: "Nothing on the wishlist yet.",
          p: "Add something you're thinking of buying — Sleeve will flag it if you already own it.",
        }
      : {
          h: "The shelf is empty.",
          p: "Add the first record, disc or tape to start keeping track.",
        };

  return (
    <div style={{ textAlign: "center", padding: "64px 0" }}>
      <p className="sleeve-display" style={{ fontSize: 20, marginBottom: 4 }}>{copy.h}</p>
      <p className="muted" style={{ fontSize: 14 }}>{copy.p}</p>
    </div>
  );
}
