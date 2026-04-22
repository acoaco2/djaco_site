function MonitorPage({ store, navigate }) {
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

  const [confirmReset, setConfirmReset] = React.useState(false);
  const medals = ["var(--orange)", "#aaaaaa", "#cd7f32"];

  const exportCsv = () => {
    const dateStr = new Date().toLocaleDateString("it-IT");
    const q = (s) => `"${String(s).replace(/"/g, '""')}"`;
    const rows = [["orario", "nome", "artista", "titolo"].map(q).join(",")];
    [...top, ...played]
      .flatMap(r => (r.voteLog || [{ ts: r.ts, requester: r.requester }]).map(v => ({ ...v, title: r.title, artist: r.artist })))
      .sort((a, b) => a.ts - b.ts)
      .forEach(v => {
        const t = new Date(v.ts).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        rows.push([t, v.requester, v.artist, v.title].map(q).join(","));
      });
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `classifica-${dateStr.replace(/\//g, "-")}.csv` });
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div style={{
      background: "var(--ink)", color: "var(--cream)",
      minHeight: "100vh", padding: "40px 32px", boxSizing: "border-box",
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40 }}>
        <div>
          <button
            onClick={() => navigate("home")}
            style={{
              background: "transparent", border: "none", cursor: "pointer",
              fontFamily: "var(--font-mono)", fontSize: 11, color: "rgba(255,255,255,0.35)",
              letterSpacing: "0.1em", padding: 0, marginBottom: 10,
            }}
            onMouseEnter={e => e.currentTarget.style.color = "var(--cream)"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.35)"}
          >← home</button>
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
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={exportCsv}
              style={{
                background: "transparent", border: "1px solid rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.3)", borderRadius: 6, padding: "3px 8px",
                fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em", cursor: "pointer",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--orange)"; e.currentTarget.style.color = "var(--orange)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = "rgba(255,255,255,0.3)"; }}
            >ESPORTA</button>
            <button
              onClick={() => setConfirmReset(true)}
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

      {/* Dialog conferma reset */}
      {confirmReset && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
        }}>
          <div style={{
            background: "#2a2724", border: "1.5px solid rgba(255,255,255,0.15)",
            borderRadius: 14, padding: "28px 32px", textAlign: "center", minWidth: 260,
          }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--cream)", marginBottom: 20, letterSpacing: "0.05em" }}>
              Vuoi esportare la classifica?
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button
                onClick={() => { exportCsv(); store.removeMany(top.map(r => r.id)); setConfirmReset(false); }}
                style={{
                  background: "var(--orange)", border: "none", borderRadius: 8,
                  padding: "8px 22px", fontFamily: "var(--font-mono)", fontSize: 11,
                  letterSpacing: "0.1em", color: "var(--ink)", cursor: "pointer",
                }}>SÌ</button>
              <button
                onClick={() => { store.removeMany(top.map(r => r.id)); setConfirmReset(false); }}
                style={{
                  background: "transparent", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 8,
                  padding: "8px 22px", fontFamily: "var(--font-mono)", fontSize: 11,
                  letterSpacing: "0.1em", color: "var(--cream-2)", cursor: "pointer",
                }}>NO</button>
            </div>
          </div>
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

window.MonitorPage = MonitorPage;
