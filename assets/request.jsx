// Song request page — Spotify-style mock search

function RequestPage({ navigate, store }) {
  const catalog = useCatalog();
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState(null);
  const [name, setName] = React.useState("");
  const [submitted, setSubmitted] = React.useState(null);
  const inputRef = React.useRef(null);

  const results = React.useMemo(() => {
    if (!catalog) return [];
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return catalog
      .filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        (t.album && t.album.toLowerCase().includes(q))
      )
      .slice(0, 8);
  }, [query, catalog]);

  const suggestions = React.useMemo(() => {
    return catalog ? catalog.slice(0, 6) : [];
  }, [catalog]);

  if (catalog === undefined) return null;
  if (catalog === null) return (
    <div className="page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--mute)", letterSpacing: "0.1em" }}>
        Richieste disattivate
      </p>
    </div>
  );

  const handleSubmit = () => {
    if (!selected) return;
    const req = {
      title: selected.title,
      artist: selected.artist,
      album: selected.album,
      color: selected.color,
      requester: name.trim() || "Anon",
    };
    store.add(req);
    setSubmitted({ ...req });
    setSelected(null);
    setQuery("");
    setName("");
  };

  if (submitted) {
    return (
      <div className="page" data-screen-label="02 Request · Submitted" style={{ padding: "40px 20px", textAlign: "center" }}>
        <div style={{ marginBottom: 20 }}>
          <Vinyl size={140} spinning={true} accent="var(--orange)"/>
        </div>
        <div className="chip orange" style={{ marginBottom: 14 }}>✓ REQUEST SENT</div>
        <h2 className="display" style={{ fontSize: 36, margin: "0 0 10px", lineHeight: 0.95 }}>
          Grazie,<br/>
          <span style={{ color: "var(--orange-deep)" }}>{submitted.requester}</span>!
        </h2>
        <p style={{ fontSize: 15, color: "var(--ink-soft)", margin: "0 0 6px", lineHeight: 1.4 }}>
          <strong>{submitted.title}</strong>
        </p>
        <p style={{ fontSize: 13, color: "var(--mute)", margin: "0 0 28px" }}>
          by {submitted.artist}
        </p>
        <p style={{ fontSize: 13, color: "var(--ink-soft)", maxWidth: 280, margin: "0 auto 28px", lineHeight: 1.5 }}>
          Aco l'ha ricevuta in consolle. Se si incastra nel set, parte.
        </p>
        <button className="btn" onClick={() => setSubmitted(null)}>
          Request another
        </button>
        <div style={{ marginTop: 10 }}>
          <button className="btn ghost" onClick={() => navigate("home")}>
            Back home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page" data-screen-label="02 Request">
      <section style={{ padding: "24px 20px 16px" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.2em", color: "var(--mute)", marginBottom: 10 }}>
          § B01 — REQUEST A SONG
        </div>
        <h1 className="display" style={{ fontSize: 38, margin: "0 0 8px", lineHeight: 0.95 }}>
          What do you<br/>want to hear<span style={{ color: "var(--orange-deep)" }}>?</span>
        </h1>
        <p style={{ fontSize: 13, color: "var(--ink-soft)", margin: 0 }}>
          Cerca un brano, Aco valuta se farlo partire.
        </p>
      </section>

      {/* Search */}
      <section style={{ padding: "8px 20px 16px" }}>
        <div style={{ position: "relative" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
            style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--mute)", pointerEvents: "none" }}>
            <circle cx="11" cy="11" r="7"/>
            <path d="M21 21l-4.3-4.3"/>
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelected(null); }}
            placeholder="Song, artist or album…"
            style={{ paddingLeft: 42, paddingRight: query ? 42 : 16 }}
            autoFocus
          />
          {query && (
            <button
              onClick={() => { setQuery(""); setSelected(null); inputRef.current?.focus(); }}
              style={{
                position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                background: "var(--ink)", color: "var(--cream)", border: "none",
                width: 22, height: 22, borderRadius: "50%", fontSize: 12, cursor: "pointer",
                display: "grid", placeItems: "center",
              }}>×</button>
          )}
        </div>

        {/* Selected preview */}
        {selected && (
          <div style={{
            marginTop: 14,
            padding: 12,
            background: "var(--ink)",
            color: "var(--cream)",
            borderRadius: 12,
            display: "flex", alignItems: "center", gap: 12,
            animation: "pageIn 0.2s ease",
          }}>
            <AlbumArt track={selected} size={48}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {selected.title}
              </div>
              <div style={{ fontSize: 11, color: "var(--cream-2)", fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>
                {selected.artist} · {selected.dur}
              </div>
            </div>
            <button
              onClick={() => setSelected(null)}
              style={{ background: "transparent", color: "var(--cream)", border: "1px solid var(--cream)",
                      borderRadius: 999, padding: "6px 10px", fontSize: 10, cursor: "pointer",
                      fontFamily: "var(--font-mono)", letterSpacing: "0.1em" }}>
              CHANGE
            </button>
          </div>
        )}
      </section>

      {/* Results or suggestions */}
      {!selected && (
        <section style={{ padding: "0 20px 16px" }}>
          {query ? (
            results.length === 0 ? (
              <div style={{ padding: 24, textAlign: "center", color: "var(--mute)", fontSize: 13 }}>
                Nothing matches "{query}". Try the artist name.
              </div>
            ) : (
              <>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.15em", color: "var(--mute)", margin: "14px 0 8px" }}>
                  TOP RESULTS
                </div>
                <TrackList tracks={results} onPick={setSelected}/>
              </>
            )
          ) : (
            <>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.15em", color: "var(--mute)", margin: "14px 0 8px" }}>
                ACO'S CRATE · POPULAR
              </div>
              <TrackList tracks={suggestions} onPick={setSelected}/>
            </>
          )}
        </section>
      )}

      {/* Submit section — only when a track is selected */}
      {selected && (
        <section style={{ padding: "0 20px 40px", animation: "pageIn 0.25s ease" }}>
          <div className="groove" style={{ margin: "8px 0 20px" }}/>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.15em", color: "var(--mute)", marginBottom: 8 }}>
            YOUR NAME (OPTIONAL)
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Marco"
            maxLength={24}
          />
          <div style={{ marginTop: 16 }}>
            <button className="btn accent" onClick={handleSubmit}>
              Send to the booth →
            </button>
          </div>
          <p style={{ fontSize: 11, color: "var(--mute)", textAlign: "center", marginTop: 12, fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>
            the dj decides what gets played
          </p>
        </section>
      )}
    </div>
  );
}

function TrackList({ tracks, onPick }) {
  return (
    <div className="stack" style={{ "--s": "2px" }}>
      {tracks.map((t, i) => (
        <button
          key={`${t.title}-${i}`}
          onClick={() => onPick(t)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 8px",
            background: "transparent",
            border: "none",
            borderBottom: "1px solid rgba(34,32,30,0.12)",
            width: "100%",
            textAlign: "left",
            cursor: "pointer",
            color: "var(--ink)",
            transition: "background 0.15s ease",
          }}
          onMouseDown={(e) => e.currentTarget.style.background = "rgba(34,32,30,0.06)"}
          onMouseUp={(e) => e.currentTarget.style.background = "transparent"}
          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
        >
          <AlbumArt track={t} size={44}/>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {t.title}
            </div>
            <div style={{ fontSize: 12, color: "var(--mute)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {t.artist} · {t.album}
            </div>
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--mute)", flexShrink: 0 }}>
            {t.dur}
          </div>
        </button>
      ))}
    </div>
  );
}

window.RequestPage = RequestPage;
