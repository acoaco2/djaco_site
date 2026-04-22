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

// ---------- Shared request store (localStorage, cross-tab via storage event) ----------
const STORAGE_KEY = "dj_aco_requests_v1";

function useRequestStore() {
  const [requests, setRequests] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try { setRequests(JSON.parse(e.newValue)); } catch (e) {}
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const save = (next) => {
    setRequests(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch (e) {}
  };

  const add = (req) => {
    const next = [
      { ...req, id: Date.now() + "-" + Math.random().toString(36).slice(2, 6), votes: 1, status: "queued", ts: Date.now() },
      ...requests
    ];
    save(next);
  };

  const update = (id, patch) => {
    save(requests.map(r => r.id === id ? { ...r, ...patch } : r));
  };

  const remove = (id) => save(requests.filter(r => r.id !== id));

  return { requests, add, update, remove };
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

// ---------- QR code placeholder (stylized SVG) ----------
function QRCode({ size = 160, label = "#request" }) {
  // Deterministic pseudo-QR — visually convincing but obviously not a scannable real code.
  const grid = 21;
  const cell = size / grid;
  const seed = 12345;
  const rand = (i, j) => {
    const v = Math.sin((i * 92837 + j * 173) + seed) * 10000;
    return (v - Math.floor(v)) > 0.5;
  };
  const finder = (cx, cy) => (
    <g key={`${cx}-${cy}`}>
      <rect x={cx*cell} y={cy*cell} width={7*cell} height={7*cell} fill="#22201E"/>
      <rect x={(cx+1)*cell} y={(cy+1)*cell} width={5*cell} height={5*cell} fill="#F1E4CE"/>
      <rect x={(cx+2)*cell} y={(cy+2)*cell} width={3*cell} height={3*cell} fill="#22201E"/>
    </g>
  );
  const cells = [];
  for (let i = 0; i < grid; i++) {
    for (let j = 0; j < grid; j++) {
      // Skip finder regions
      const inFinder =
        (i < 8 && j < 8) ||
        (i < 8 && j > 12) ||
        (i > 12 && j < 8);
      if (inFinder) continue;
      if (rand(i, j)) {
        cells.push(<rect key={`${i}-${j}`} x={i*cell} y={j*cell} width={cell} height={cell} fill="#22201E"/>);
      }
    }
  }
  return (
    <div style={{ display: "inline-block", background: "#F7ECD8", padding: 10, border: "1.5px solid #22201E", borderRadius: 10 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
        <rect width={size} height={size} fill="#F7ECD8"/>
        {cells}
        {finder(0, 0)}
        {finder(14, 0)}
        {finder(0, 14)}
      </svg>
      <div style={{ textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 10, marginTop: 6, letterSpacing: "0.1em", color: "#22201E" }}>
        {label}
      </div>
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
        {route === "dj" ? (
          <span className="chip orange">LIVE BOOTH</span>
        ) : route === "request" ? (
          <a href="#home" onClick={(e) => { e.preventDefault(); navigate("home"); }}
             style={{ fontFamily: "var(--font-mono)", fontSize: 12, textDecoration: "none", color: "var(--ink)" }}>
            ← back
          </a>
        ) : (
          <a href="#dj" onClick={(e) => { e.preventDefault(); navigate("dj"); }}
             style={{ fontFamily: "var(--font-mono)", fontSize: 12, textDecoration: "none", color: "var(--ink)", opacity: 0.5 }}>
            booth
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
