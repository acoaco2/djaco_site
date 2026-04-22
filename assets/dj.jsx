// DJ live queue view — for Aco's laptop at the gig

function DJPage({ navigate, store }) {
  const [now, setNow] = React.useState(Date.now());
  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  const queued = store.requests.filter(r => r.status === "queued").sort((a,b) => b.votes - a.votes || a.ts - b.ts);
  const playing = store.requests.find(r => r.status === "playing");
  const played = store.requests.filter(r => r.status === "played");

  const markPlaying = (id) => {
    // Move current playing -> played, then set new playing
    const prev = store.requests.find(r => r.status === "playing");
    if (prev) store.update(prev.id, { status: "played" });
    setTimeout(() => store.update(id, { status: "playing" }), 50);
  };

  const markPlayed = (id) => store.update(id, { status: "played" });
  const reject = (id) => store.remove(id);

  const timeAgo = (ts) => {
    const mins = Math.max(0, Math.floor((now - ts) / 60000));
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins/60)}h ago`;
  };

  return (
    <div className="page" data-screen-label="03 DJ Booth" style={{ background: "var(--ink)", color: "var(--cream)", minHeight: "100vh", marginTop: -1 }}>

      {/* Header */}
      <section style={{ padding: "20px 20px 10px" }}>
        <div className="between" style={{ marginBottom: 10 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.2em", color: "var(--orange)" }}>
            ● LIVE BOOTH — {queued.length} QUEUED
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--cream-2)" }}>
            {new Date(now).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
        <h1 className="display" style={{ fontSize: 32, margin: "0 0 4px", lineHeight: 0.95 }}>
          Booth<span style={{ color: "var(--orange)" }}>.</span>
        </h1>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--cream-2)", margin: 0, letterSpacing: "0.1em" }}>
          INCOMING REQUESTS — SORTED BY VOTES
        </p>
      </section>

      {/* Now playing */}
      {playing && (
        <section style={{ padding: "12px 20px" }}>
          <div style={{
            background: "var(--orange)",
            color: "var(--ink)",
            border: "1.5px solid var(--cream)",
            borderRadius: 14,
            padding: 16,
            display: "flex", gap: 12, alignItems: "center",
            boxShadow: "4px 4px 0 var(--cream)",
          }}>
            <div style={{ flexShrink: 0 }}>
              <Vinyl size={60} spinning={true} accent="var(--cream)"/>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.2em", marginBottom: 4 }}>
                ● NOW PLAYING
              </div>
              <div className="display" style={{ fontSize: 18, lineHeight: 1.1, marginBottom: 2 }}>
                {playing.title}
              </div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>
                {playing.artist} · req. by {playing.requester}
              </div>
            </div>
            <button
              onClick={() => markPlayed(playing.id)}
              style={{
                background: "var(--ink)", color: "var(--cream)", border: "none",
                padding: "8px 12px", borderRadius: 999, fontFamily: "var(--font-mono)",
                fontSize: 10, letterSpacing: "0.1em", cursor: "pointer", flexShrink: 0,
              }}>DONE</button>
          </div>
        </section>
      )}

      {/* Queue */}
      <section style={{ padding: "16px 20px 20px" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.2em", color: "var(--cream-2)", marginBottom: 10 }}>
          QUEUE — {queued.length}
        </div>

        {queued.length === 0 && (
          <div style={{
            padding: 24, textAlign: "center",
            border: "1.5px dashed var(--cream-2)", borderRadius: 12,
            color: "var(--cream-2)", fontSize: 13,
          }}>
            La coda è vuota. Mostra il QR al pubblico.
          </div>
        )}

        <div className="stack" style={{ "--s": "8px" }}>
          {queued.map((r, i) => (
            <div key={r.id} style={{
              background: "#2a2724",
              border: "1px solid #3a3531",
              borderRadius: 12,
              padding: 12,
              display: "flex", gap: 12, alignItems: "center",
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: i === 0 ? "var(--orange)" : "transparent",
                border: i === 0 ? "none" : "1.5px solid var(--cream-2)",
                color: i === 0 ? "var(--ink)" : "var(--cream-2)",
                display: "grid", placeItems: "center",
                fontFamily: "var(--font-display)", fontSize: 12,
                flexShrink: 0,
              }}>
                {i + 1}
              </div>
              <AlbumArt track={{ title: r.title, color: r.color || "#3A6B7A" }} size={40}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {r.title}
                </div>
                <div style={{ fontSize: 11, color: "var(--cream-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {r.artist} · {r.requester} · {timeAgo(r.ts)}
                </div>
              </div>
              <div style={{
                fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--orange)",
                flexShrink: 0, minWidth: 28, textAlign: "right",
              }}>
                ▲{r.votes}
              </div>
              <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                <button
                  onClick={() => markPlaying(r.id)}
                  title="Play next"
                  style={iconBtn("var(--orange)", "var(--ink)")}
                >▶</button>
                <button
                  onClick={() => reject(r.id)}
                  title="Skip"
                  style={iconBtn("transparent", "var(--cream-2)", "1px solid var(--cream-2)")}
                >×</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Played history */}
      {played.length > 0 && (
        <section style={{ padding: "0 20px 40px" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.2em", color: "var(--cream-2)", marginBottom: 10, opacity: 0.6 }}>
            PLAYED — {played.length}
          </div>
          <div className="stack" style={{ "--s": "4px" }}>
            {played.slice(0, 5).map(r => (
              <div key={r.id} style={{
                display: "flex", gap: 10, alignItems: "center",
                padding: "6px 0", opacity: 0.5,
                borderBottom: "1px solid #2a2724",
              }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--cream-2)" }}>✓</span>
                <div style={{ flex: 1, minWidth: 0, fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  <strong>{r.title}</strong> — {r.artist}
                </div>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--cream-2)" }}>
                  {timeAgo(r.ts)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Footer with QR */}
      <section style={{ padding: "24px 20px 40px", borderTop: "1px solid #2a2724", display: "flex", gap: 16, alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 16, marginBottom: 4 }}>
            Show the floor<br/>where to request.
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--cream-2)", letterSpacing: "0.1em" }}>
            djaco.live/request
          </div>
        </div>
        <QRCode size={100} label="scan me"/>
      </section>
    </div>
  );
}

function MonitorPage({ store }) {
  const [now, setNow] = React.useState(Date.now());
  const [countdown, setCountdown] = React.useState(10);

  React.useEffect(() => {
    const refresh = setInterval(() => { setNow(Date.now()); setCountdown(10); }, 10000);
    const tick   = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000);
    return () => { clearInterval(refresh); clearInterval(tick); };
  }, []);

  const todayStr = new Date(now).toDateString();
  const todayAll = store.requests.filter(r => new Date(r.ts).toDateString() === todayStr);
  const top    = todayAll.filter(r => r.status !== "played").sort((a, b) => b.votes - a.votes).slice(0, 5);
  const played = todayAll.filter(r => r.status === "played").sort((a, b) => b.votes - a.votes);

  const medals = ["var(--orange)", "#aaaaaa", "#cd7f32"];

  return (
    <div style={{
      background: "var(--ink)", color: "var(--cream)",
      minHeight: "100vh", padding: "40px 32px", boxSizing: "border-box",
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40 }}>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.2em", color: "var(--orange)", marginBottom: 6 }}>
            ● CLASSIFICA DEL GIORNO
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 52, lineHeight: 0.9 }}>
            Top 5<span style={{ color: "var(--orange)" }}>.</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
          <div style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--cream-2)", lineHeight: 1.8 }}>
            <div>{new Date(now).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}</div>
            <div style={{ opacity: 0.4, fontSize: 10 }}>refresh in {countdown}s</div>
          </div>
          <button
            onClick={() => store.removeMany(top.map(r => r.id))}
            style={{
              background: "transparent", border: "1px solid rgba(255,255,255,0.15)",
              color: "rgba(255,255,255,0.3)", borderRadius: 6, padding: "3px 8px",
              fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em", cursor: "pointer",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--orange)"; e.currentTarget.style.color = "var(--orange)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = "rgba(255,255,255,0.3)"; }}
          >RESET</button>
        </div>
      </div>

      {/* Top 5 */}
      {top.length === 0 ? (
        <div style={{ marginTop: 80, textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--cream-2)", letterSpacing: "0.1em" }}>
          Nessuna richiesta ancora oggi.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {top.map((r, i) => (
            <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <div style={{
                width: 72, flexShrink: 0, textAlign: "right",
                fontFamily: "var(--font-display)", fontSize: 60, lineHeight: 1,
                color: i < 3 ? medals[i] : "rgba(255,255,255,0.25)",
              }}>
                {i + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: "var(--font-display)", fontSize: 34, lineHeight: 1.1,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {r.title}
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 15, color: "var(--cream-2)", marginTop: 4, letterSpacing: "0.05em" }}>
                  {r.artist}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 40, color: "var(--orange)" }}>
                  {r.votes}
                </div>
                <button
                  onClick={() => store.update(r.id, { status: "played" })}
                  title="Segna come suonata"
                  style={{
                    width: 40, height: 40, borderRadius: "50%",
                    background: "transparent", border: "1.5px solid rgba(255,255,255,0.25)",
                    color: "rgba(255,255,255,0.4)", fontSize: 18, cursor: "pointer",
                    display: "grid", placeItems: "center", transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--orange)"; e.currentTarget.style.color = "var(--orange)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
                >✓</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Storico */}
      {played.length > 0 && (
        <div style={{ marginTop: 48, borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)" }}>
              SUONATE
            </div>
            <button
              onClick={() => store.removeMany(played.map(r => r.id))}
              style={{
                background: "transparent", border: "1px solid rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.3)", borderRadius: 6, padding: "3px 8px",
                fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em", cursor: "pointer",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = "rgba(255,255,255,0.3)"; }}
            >CANCELLA</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {played.map(r => (
              <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 16, opacity: 0.4 }}>
                <div style={{ flex: 1, minWidth: 0, textDecoration: "line-through", fontSize: 16, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {r.title}
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--cream-2)", flexShrink: 0 }}>
                  {r.artist}
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, flexShrink: 0 }}>
                  {r.votes}v
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function iconBtn(bg, color, border = "none") {
  return {
    width: 32, height: 32, borderRadius: "50%",
    background: bg, color, border,
    cursor: "pointer",
    display: "grid", placeItems: "center",
    fontSize: 12,
    fontFamily: "var(--font-display)",
  };
}

window.DJPage = DJPage;
window.MonitorPage = MonitorPage;
