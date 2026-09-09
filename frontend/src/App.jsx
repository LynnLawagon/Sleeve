// frontend/src/App.jsx  
import { useState, useEffect } from "react";
import { LogOut } from "lucide-react";
import { C } from "./constants";
import { norm } from "./utils";
import { api, getToken, setToken } from "./api";
import FormatIcon from "./components/FormatIcon";
import ItemModal from "./components/ItemModal";
import DetailDrawer from "./components/DetailDrawer";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Collection from "./pages/Collection";
import Stats from "./pages/Stats";
import Spin from "./pages/Spin";

export default function App() {
  const [authView, setAuthView] = useState("signin"); // "signin" | "signup"
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  const [library, setLibrary] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [tab, setTab] = useState("library");
  const [modal, setModal] = useState(null); // { mode, initial }
  const [detail, setDetail] = useState(null);
  const [detailWishlist, setDetailWishlist] = useState(false);

  // Restore a session on load if a token is already stored.
  useEffect(() => {
    (async () => {
      if (!getToken()) { setCheckingSession(false); return; }
      try {
        const { user } = await api.me();
        setUser(user);
        const [{ items: lib }, { items: wish }] = await Promise.all([api.listItems(), api.listWishlist()]);
        setLibrary(lib);
        setWishlist(wish);
      } catch {
        setToken(null);
      } finally {
        setCheckingSession(false);
      }
    })();
  }, []);

  const handleSignedIn = async (signedInUser) => {
    setUser(signedInUser);
    const [{ items: lib }, { items: wish }] = await Promise.all([api.listItems(), api.listWishlist()]);
    setLibrary(lib);
    setWishlist(wish);
  };

  const signOut = () => {
    setToken(null);
    setUser(null);
    setLibrary([]);
    setWishlist([]);
    setTab("library");
    setAuthView("signin");
  };

  const duplicateCheck = (artist, title, format, ignoreId) => {
    const exact = library.find((i) => i.id !== ignoreId && norm(i.artist) === norm(artist) && norm(i.title) === norm(title) && i.format === format);
    if (exact) return `You already have this exact copy on ${format}, added ${new Date(exact.addedAt).toLocaleDateString()}.`;
    const other = library.find((i) => i.id !== ignoreId && norm(i.artist) === norm(artist) && norm(i.title) === norm(title));
    if (other) return `You already own this on ${other.format} — this would be a second format, not a duplicate.`;
    const onWish = wishlist.find((i) => norm(i.artist) === norm(artist) && norm(i.title) === norm(title));
    if (onWish) return `This is on your wishlist already — adding it here will leave it listed there too.`;
    return null;
  };

  const wishlistDuplicateCheck = (artist, title) => {
    const owned = library.find((i) => norm(i.artist) === norm(artist) && norm(i.title) === norm(title));
    if (owned) return `You already own this on ${owned.format}.`;
    return null;
  };

  const saveItem = async (item) => {
    if (modal.mode === "wishlist") {
      const exists = wishlist.some((i) => i.id === item.id);
      const saved = exists ? await api.updateWishlistItem(item.id, item) : await api.createWishlistItem(item);
      const record = saved.item;
      setWishlist((cur) => (exists ? cur.map((i) => (i.id === record.id ? record : i)) : [record, ...cur]));
    } else {
      const exists = library.some((i) => i.id === item.id);
      const saved = exists ? await api.updateItem(item.id, item) : await api.createItem(item);
      const record = saved.item;
      setLibrary((cur) => (exists ? cur.map((i) => (i.id === record.id ? record : i)) : [record, ...cur]));
    }
    setModal(null);
  };

  const deleteItem = async (id, wish) => {
    if (wish) {
      await api.deleteWishlistItem(id);
      setWishlist((cur) => cur.filter((i) => i.id !== id));
    } else {
      await api.deleteItem(id);
      setLibrary((cur) => cur.filter((i) => i.id !== id));
    }
    setDetail(null);
  };

  const toggleRepeat = async (item) => {
    const updated = { ...item, onRepeat: !item.onRepeat };
    const saved = await api.updateItem(item.id, updated);
    setLibrary((cur) => cur.map((i) => (i.id === item.id ? saved.item : i)));
    setDetail(saved.item);
  };

  const toggleShare = async (item, isPublic) => {
    const saved = await api.setItemShare(item.id, isPublic);
    setLibrary((cur) => cur.map((i) => (i.id === item.id ? saved.item : i)));
    setDetail(saved.item);
  };

  if (checkingSession) return null;

  const knownArtists = [...new Set([...library, ...wishlist].map((i) => i.artist).filter(Boolean))].sort();
  const knownGenres = [...new Set(library.flatMap((i) => i.tags || []))].sort();

  if (!user) {
    return (
      <div className="sleeve-root">
        {authView === "signin" ? (
          <SignIn onSignedIn={handleSignedIn} goToSignUp={() => setAuthView("signup")} />
        ) : (
          <SignUp goToSignIn={() => setAuthView("signin")} />
        )}
      </div>
    );
  }

  return (
    <div className="sleeve-root" style={{ background: C.paper }}>
      <header className="row between" style={{ padding: "16px 24px", borderBottom: `1.4px solid ${C.ink}` }}>
        <div className="row gap-2">
          <FormatIcon format="Vinyl" size={20} color={C.ink} />
          <span className="sleeve-display" style={{ fontSize: 20 }}>Sleeve</span>
        </div>
        <div className="row gap-4">
          <span className="muted" style={{ fontSize: 12 }}>{user.username}</span>
          <button onClick={signOut} className="row gap-1 btn-text muted" style={{ fontSize: 12 }}>
            <LogOut size={13} /> sign out
          </button>
        </div>
      </header>

      <nav className="row gap-1" style={{ padding: "16px 24px 0" }}>
        {[
          ["library", `Shelf (${library.length})`],
          ["wishlist", `Wishlist (${wishlist.length})`],
          ["stats", "Stats"],
          ["spin", "Spin"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              padding: "8px 16px", fontSize: 14, background: "none", cursor: "pointer",
              border: "none", borderBottom: tab === key ? `2px solid ${C.ink}` : "2px solid transparent",
              color: tab === key ? C.ink : C.muted, fontWeight: tab === key ? 600 : 400,
            }}
          >
            {label}
          </button>
        ))}
      </nav>

      <main style={{ padding: 24, maxWidth: 960, margin: "0 auto" }}>
        {tab === "library" && (
          <Collection
            items={library}
            isWishlist={false}
            onAdd={() => setModal({ mode: "library" })}
            onOpen={(it) => { setDetail(it); setDetailWishlist(false); }}
          />
        )}
        {tab === "wishlist" && (
          <Collection
            items={wishlist}
            isWishlist
            onAdd={() => setModal({ mode: "wishlist" })}
            onOpen={(it) => { setDetail(it); setDetailWishlist(true); }}
          />
        )}
        {tab === "stats" && <Stats library={library} />}
        {tab === "spin" && <Spin library={library} />}
      </main>

      {modal && (
        <ItemModal
          mode={modal.mode}
          initial={modal.initial}
          onClose={() => setModal(null)}
          onSave={saveItem}
          duplicateCheck={modal.mode === "wishlist" ? wishlistDuplicateCheck : duplicateCheck}
          knownArtists={knownArtists}
          knownGenres={knownGenres}
        />
      )}

      {detail && !modal && (
        <DetailDrawer
          item={detail}
          onClose={() => setDetail(null)}
          onEdit={() => {
            setModal({
              mode: detailWishlist ? "wishlist" : "library",
              initial: {
                ...detail,
                tags: detail.tags || [],
                recommendedTracks: (detail.recommendedTracks || []).join(", "),
              },
            });
            setDetail(null);
          }}
          onDelete={() => deleteItem(detail.id, detailWishlist)}
          onToggleRepeat={detailWishlist ? null : () => toggleRepeat(detail)}
          onToggleShare={detailWishlist ? null : (isPublic) => toggleShare(detail, isPublic)}
        />
      )}
    </div>
  );
}