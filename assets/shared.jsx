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
    return DEFAULT_REQUESTS();
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

function DEFAULT_REQUESTS() {
  return [
    { id: "seed-1", title: "One More Time", artist: "Daft Punk", requester: "Giulia", votes: 7, status: "queued", ts: Date.now() - 1000*60*4 },
    { id: "seed-2", title: "Blue Monday", artist: "New Order", requester: "Marco", votes: 5, status: "queued", ts: Date.now() - 1000*60*9 },
    { id: "seed-3", title: "I Feel Love", artist: "Donna Summer", requester: "Anon", votes: 3, status: "playing", ts: Date.now() - 1000*60*2 },
  ];
}

// ---------- Mock Spotify-style track catalogue ----------
const MOCK_CATALOG = [
  { title: "One More Time", artist: "Daft Punk", album: "Discovery", dur: "5:20", color: "#7C4A2B" },
  { title: "Around the World", artist: "Daft Punk", album: "Homework", dur: "7:09", color: "#3A6B7A" },
  { title: "Blue Monday", artist: "New Order", album: "Power, Corruption & Lies", dur: "7:30", color: "#2A5260" },
  { title: "Bizarre Love Triangle", artist: "New Order", album: "Brotherhood", dur: "4:20", color: "#4B3E6E" },
  { title: "I Feel Love", artist: "Donna Summer", album: "I Remember Yesterday", dur: "5:52", color: "#D46B1F" },
  { title: "Italoconnection", artist: "Sabrina", album: "Boys", dur: "4:02", color: "#C1432B" },
  { title: "Self Control", artist: "Raf", album: "Self Control", dur: "4:08", color: "#8A5A2B" },
  { title: "Dolce Vita", artist: "Ryan Paris", album: "Dolce Vita", dur: "3:40", color: "#E8932A" },
  { title: "Tarzan Boy", artist: "Baltimora", album: "Living in the Background", dur: "4:25", color: "#B8732A" },
  { title: "Pump Up The Jam", artist: "Technotronic", album: "Pump Up The Jam", dur: "3:43", color: "#3A6B7A" },
  { title: "Music Sounds Better With You", artist: "Stardust", album: "Single", dur: "7:11", color: "#D46B1F" },
  { title: "You & Me", artist: "Flume ft. Disclosure", album: "You & Me (Remix)", dur: "5:15", color: "#4B3E6E" },
  { title: "Losing It", artist: "Fisher", album: "Losing It", dur: "3:44", color: "#2A5260" },
  { title: "Jamming", artist: "Bob Marley", album: "Exodus", dur: "3:31", color: "#4B6E3E" },
  { title: "Should I Stay or Should I Go", artist: "The Clash", album: "Combat Rock", dur: "3:06", color: "#C1432B" },
  { title: "London Calling", artist: "The Clash", album: "London Calling", dur: "3:19", color: "#22201E" },
  { title: "A Message to You, Rudy", artist: "The Specials", album: "The Specials", dur: "2:53", color: "#3A6B7A" },
  { title: "Ghost Town", artist: "The Specials", album: "Ghost Town", dur: "6:08", color: "#4B3E6E" },
  { title: "Blitzkrieg Bop", artist: "Ramones", album: "Ramones", dur: "2:14", color: "#C1432B" },
  { title: "Basket Case", artist: "Green Day", album: "Dookie", dur: "3:03", color: "#4B6E3E" },
  { title: "Love Will Tear Us Apart", artist: "Joy Division", album: "Substance", dur: "3:26", color: "#22201E" },
  { title: "Enola Gay", artist: "OMD", album: "Organisation", dur: "3:32", color: "#3A6B7A" },
  { title: "Tainted Love", artist: "Soft Cell", album: "Non-Stop Erotic Cabaret", dur: "2:40", color: "#C1432B" },
  { title: "Personal Jesus", artist: "Depeche Mode", album: "Violator", dur: "4:56", color: "#4B3E6E" },
  { title: "In the Air Tonight", artist: "Phil Collins", album: "Face Value", dur: "5:35", color: "#2A5260" },
];

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
  useHashRoute, useRequestStore, MOCK_CATALOG, AlbumArt, Vinyl, QRCode, TopBar,
  DEFAULT_REQUESTS,
});
