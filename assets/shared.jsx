// Shared components for DJ Aco site

const { useState, useEffect, useRef, useMemo } = React;

// ---------- Hash router ----------
function useHashRoute() {
  const [route, setRoute] = useState(() => window.location.hash.replace("#", "") || "home");
  useEffect(() => {
    const onHash = () => setRoute(window.location.hash.replace("#", "") || "home");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return [route, (r) => { window.location.hash = r; }];
}

// ---------- Shared request store (Firebase Realtime Database) ----------
function useRequestStore() {
  const [requests, setRequests] = useState([]);
  const listenerRef = useRef(null);

  useEffect(() => {
    const setup = () => {
      const { db, ref: fbRef, onValue } = window.__firebase;
      const unsubscribe = onValue(fbRef(db, "requests"), (snap) => {
        const data = snap.val();
        if (!data) { setRequests([]); return; }
        setRequests(
          Object.entries(data)
            .map(([id, val]) => ({ ...val, id }))
            .sort((a, b) => b.ts - a.ts)
        );
      });
      listenerRef.current = unsubscribe;
    };

    if (window.__firebase) {
      setup();
    } else {
      window.addEventListener("firebase-ready", setup, { once: true });
    }

    return () => { if (listenerRef.current) listenerRef.current(); };
  }, []);

  const add = (req) => {
    const { db, ref: fbRef, push: fbPush, set: fbSet } = window.__firebase;
    const newRef = fbPush(fbRef(db, "requests"));
    const now = Date.now();
    fbSet(newRef, {
      ...req,
      id: newRef.key,
      votes: 1,
      status: "queued",
      ts: now,
      voteLog: [{ ts: now, requester: req.requester }],
    });
  };

  const update = (id, patch) => {
    const { db, ref: fbRef, update: fbUpdate } = window.__firebase;
    fbUpdate(fbRef(db, `requests/${id}`), patch);
  };

  const remove = (id) => {
    const { db, ref: fbRef, remove: fbRemove } = window.__firebase;
    fbRemove(fbRef(db, `requests/${id}`));
  };

  const removeMany = (ids) => ids.forEach(id => remove(id));

  return { requests, add, update, remove, removeMany };
}



// ---------- CSV catalog loader ----------
function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/['"]/g, ""));
  const col = (row, ...names) => {
    for (const name of names) {
      const idx = headers.indexOf(name);
      if (idx !== -1 && row[idx] != null) return row[idx].replace(/^["']|["']$/g, "").trim();
    }
    return "";
  };
  const COLORS = ["#7C4A2B","#3A6B7A","#2A5260","#4B3E6E","#D46B1F","#C1432B","#8A5A2B","#E8932A","#B8732A","#4B6E3E","#22201E"];
  return lines.slice(1).map((line, i) => {
    const row = parseCSVLine(line);
    const title = col(row, "title", "titolo", "traccia", "track", "nome");
    const artist = col(row, "artist", "artista", "artisti");
    if (!title && !artist) return null;
    return {
      title: title || "Unknown",
      artist: artist || "Unknown",
      album: col(row, "album"),
      dur: col(row, "duration", "durata", "dur", "length", "tempo"),
      color: COLORS[i % COLORS.length],
    };
  }).filter(Boolean);
}

// undefined = loading, null = error/unavailable, array = ok
function useCatalog() {
  const [catalog, setCatalog] = React.useState(undefined);
  React.useEffect(() => {
    fetch("uploads/tracce.csv")
      .then(r => { if (!r.ok) throw new Error(); return r.text(); })
      .then(text => { const parsed = parseCSV(text); setCatalog(parsed.length > 0 ? parsed : null); })
      .catch(() => setCatalog(null));
  }, []);
  return catalog;
}

// ---------- Album art placeholder (no external images) ----------
function AlbumArt({ track, size = 52 }) {
  const initial = (track.title || "?").charAt(0).toUpperCase();
  return (
    <div
      style={{
        width: size, height: size, flexShrink: 0,
        background: track.color || "#3A6B7A",
        borderRadius: 6,
        border: "1.5px solid var(--ink)",
        display: "grid",
        placeItems: "center",
        color: "var(--cream)",
        fontFamily: "var(--font-display)",
        fontSize: size * 0.42,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{
        position: "absolute", inset: 0,
        background: "repeating-linear-gradient(135deg, transparent 0 10px, rgba(0,0,0,0.1) 10px 11px)",
        mixBlendMode: "multiply",
      }} />
      <span style={{ position: "relative" }}>{initial}</span>
    </div>
  );
}

// ---------- Vinyl SVG decoration ----------
function Vinyl({ size = 120, spinning = false, accent = "#E8932A" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={{ display: "block" }}
      className={spinning ? "spin" : ""}>
      <defs>
        <radialGradient id="vg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#2a2724" />
          <stop offset="50%" stopColor="#22201E" />
          <stop offset="100%" stopColor="#1a1917" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="58" fill="url(#vg)" stroke="#22201E" strokeWidth="1.5"/>
      {[52, 46, 40, 34, 28].map((r, i) => (
        <circle key={i} cx="60" cy="60" r={r} fill="none" stroke="#1a1917" strokeWidth="0.5" opacity="0.6"/>
      ))}
      <circle cx="60" cy="60" r="16" fill={accent} stroke="#22201E" strokeWidth="1.5"/>
      <circle cx="60" cy="60" r="2.5" fill="#F1E4CE" stroke="#22201E" strokeWidth="1"/>
      <text x="60" y="58" textAnchor="middle" fontFamily="var(--font-display)" fontSize="5" fill="#22201E">Dj Aco</text>
      <text x="60" y="66" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="3" fill="#22201E">SIDE A · 33⅓</text>
    </svg>
  );
}

// ---------- QR code (real, scannable) ----------
function QRCode({ size = 160, label, value }) {
  const url = value || (window.location.origin + window.location.pathname + "#request");
  const src = "https://api.qrserver.com/v1/create-qr-code/?size=" + size + "x" + size +
    "&data=" + encodeURIComponent(url) + "&bgcolor=F7ECD8&color=22201E&qzone=1&format=svg";
  return (
    <div style={{ display: "inline-block", background: "#F7ECD8", padding: 10, border: "1.5px solid #22201E", borderRadius: 10 }}>
      <img src={src} width={size} height={size} style={{ display: "block" }} alt="QR Code"/>
      {label && (
        <div style={{ textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 10, marginTop: 6, letterSpacing: "0.1em", color: "#22201E" }}>
          {label}
        </div>
      )}
    </div>
  );
}

// ---------- Top bar ----------
function TopBar({ route, navigate }) {
  return (
    <div className="topbar">
      <a className="brand" href="#home" onClick={(e) => { e.preventDefault(); navigate("home"); }}>
        <img src="assets/dj-aco-logo.png" alt="Dj Aco"/>
        <span style={{ textTransform: "none" }}>Dj Aco</span>
      </a>
      <div className="row" style={{ gap: 6 }}>
        {route === "request" && (
          <a href="#home" onClick={(e) => { e.preventDefault(); navigate("home"); }}
             style={{ fontFamily: "var(--font-mono)", fontSize: 12, textDecoration: "none", color: "var(--ink)" }}>
            ← back
          </a>
        )}
      </div>
    </div>
  );
}

// Export to window for other files
Object.assign(window, {
  useHashRoute, useRequestStore, useCatalog, AlbumArt, Vinyl, QRCode, TopBar,
});
