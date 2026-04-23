// Home / intro page for Dj Aco

const GIGS = [
  { date: "19 MAG", day: "MAR", venue: "Serata Privata", city: "Garbagnate Monastero", note: "Private event" },
];

const GENRES = ["House", "Tech House", "Italodisco", "New Wave", "Punk / Rock", "Ska"];

function HomePage({ navigate, djName, bio }) {
  const [qrOpen, setQrOpen] = React.useState(false);
  const [pwOpen, setPwOpen] = React.useState(false);
  const [pw, setPw] = React.useState("");
  const [shake, setShake] = React.useState(false);

  const handlePw = (e) => {
    e.preventDefault();
    if (pw === "aco") { navigate("monitor"); setPwOpen(false); setPw(""); }
    else { setShake(true); setPw(""); setTimeout(() => setShake(false), 500); }
  };

  return (
    <div className="page" data-screen-label="01 Home">

      {/* HERO */}
      <section style={{ padding: "28px 20px 24px", position: "relative", overflow: "hidden" }}>
        {/* Big vinyl backdrop */}
        <div style={{
          position: "absolute",
          right: -90, top: -60,
          opacity: 0.45,
          pointerEvents: "none",
        }}>
          <Vinyl size={280} spinning={true} accent="#E8932A"/>
        </div>

        <div style={{ position: "relative" }}>
          <h1 className="display" style={{
            fontSize: "clamp(56px, 18vw, 84px)",
            margin: "16px 0 6px",
            color: "var(--ink)",
            textTransform: "none",
          }}>
            Dj<br/>Aco<span style={{ color: "var(--orange-deep)" }}>.</span>
          </h1>

          <p style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--ink-soft)",
            margin: "0 0 22px",
          }}>
            Selector · Mixer · Pista·first
          </p>

          {/* Logo card */}
          <div style={{
            display: "flex",
            gap: 14,
            alignItems: "flex-start",
            background: "var(--paper)",
            border: "1.5px solid var(--ink)",
            borderRadius: 14,
            padding: 14,
            position: "relative",
          }}>
            <img src="assets/dj-aco-logo.png" alt="" style={{
              width: 110, height: 110, borderRadius: 10,
              border: "1.5px solid var(--ink)", objectFit: "cover",
              flexShrink: 0,
            }}/>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.15em", color: "var(--mute)", marginBottom: 4 }}>
                ON ROTATION
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 14, lineHeight: 1.2, marginBottom: 8 }}>
                Side A · Warm-up
              </div>
              <div className="row" style={{ gap: 4, flexWrap: "wrap" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-soft)" }}>●</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10 }}>REC</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, marginLeft: 8, color: "var(--mute)" }}>00:47:12</span>
              </div>
              <div style={{ height: 24, marginTop: 8, display: "flex", alignItems: "center", gap: 2 }}>
                {[4,7,3,6,9,5,8,4,6,3,7,5,8,4,3,6,9,5,7,4,6,3,5,8].map((h, i) => (
                  <div key={i} style={{
                    width: 3,
                    height: `${h*2.2}px`,
                    background: i < 10 ? "var(--orange-deep)" : "var(--ink)",
                    borderRadius: 1,
                  }}/>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRIMARY CTA — Request a song */}
      <section style={{ padding: "0 20px 28px" }}>
        <button
          className="btn accent"
          onClick={() => navigate("request")}
          style={{ position: "relative" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l12-2v13"/>
            <circle cx="6" cy="18" r="3"/>
            <circle cx="18" cy="16" r="3"/>
          </svg>
          Request a Song
        </button>
        <div style={{ marginTop: 10, textAlign: "center" }}>
          <button
            onClick={() => setQrOpen(v => !v)}
            style={{
              background: "transparent",
              border: "none",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--ink-soft)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: "pointer",
              padding: 6,
            }}
          >
            {qrOpen ? "↑ hide QR" : "↓ or scan at the gig"}
          </button>
        </div>
        {qrOpen && (
          <div style={{ textAlign: "center", marginTop: 8, animation: "pageIn 0.25s ease" }}>
            <QRCode size={160} label="djaco.live/request"/>
          </div>
        )}
      </section>

      <div className="groove" style={{ margin: "0 20px" }}/>

      {/* ABOUT */}
      <section style={{ padding: "28px 20px" }} data-screen-label="Home · About">
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.2em", color: "var(--mute)", marginBottom: 12 }}>
          § A01 — ABOUT
        </div>
        <h2 className="display" style={{ fontSize: 28, margin: "0 0 16px" }}>
          Chi sono
        </h2>
        <p style={{ fontSize: 16, lineHeight: 1.55, color: "var(--ink-soft)", margin: 0, textWrap: "pretty" }}>
          {bio}
        </p>

        <div style={{ marginTop: 20, display: "flex", flexWrap: "wrap", gap: 6 }}>
          {GENRES.map(g => (
            <span key={g} className="chip outline" style={{ fontSize: 10 }}>{g}</span>
          ))}
        </div>
      </section>

      <div className="groove" style={{ margin: "0 20px" }}/>

      {/* UPCOMING GIGS */}
      <section style={{ padding: "28px 20px" }} data-screen-label="Home · Gigs">
        <div className="between" style={{ marginBottom: 12 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.2em", color: "var(--mute)" }}>
            § A02 — LIVE DATES
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--orange-deep)" }}>
            ● {GIGS.length} UPCOMING
          </div>
        </div>
        <h2 className="display" style={{ fontSize: 28, margin: "0 0 18px" }}>
          Prossime date
        </h2>

        <div className="stack" style={{ "--s": "10px" }}>
          {GIGS.map((g, i) => (
            <div key={i} style={{
              display: "flex",
              gap: 14,
              alignItems: "stretch",
              background: "var(--paper)",
              border: "1.5px solid var(--ink)",
              borderRadius: 12,
              padding: 14,
              position: "relative",
              overflow: "hidden",
            }}>
              {/* Date block */}
              <div style={{
                flexShrink: 0,
                width: 64,
                textAlign: "center",
                borderRight: "1.5px dashed var(--ink)",
                paddingRight: 14,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--mute)", letterSpacing: "0.1em" }}>
                  {g.day}
                </div>
                <div className="display" style={{ fontSize: 18, lineHeight: 1.1, marginTop: 2 }}>
                  {g.date}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 16, lineHeight: 1.2, marginBottom: 4 }}>
                  {g.venue}
                </div>
                <div style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 6 }}>
                  {g.city}
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--mute)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  {g.note}
                </div>
              </div>
              <div style={{
                position: "absolute",
                right: -20, top: -20,
                width: 60, height: 60,
                borderRadius: "50%",
                background: i === 0 ? "var(--orange)" : "transparent",
                border: i === 0 ? "none" : "1.5px dashed var(--ink)",
                opacity: i === 0 ? 1 : 0.3,
              }}/>
              {i === 0 && (
                <div style={{
                  position: "absolute",
                  right: 8, top: 8,
                  fontFamily: "var(--font-mono)",
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  color: "var(--ink)",
                }}>
                  NEXT
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        padding: "24px 20px 40px",
        borderTop: "1.5px solid var(--ink)",
        marginTop: 20,
        background: "var(--ink)",
        color: "var(--cream)",
      }}>
        <div className="display" style={{ fontSize: 32, lineHeight: 0.95, marginBottom: 16, textTransform: "none" }}>
          Keep the<br/>floor moving<span style={{ color: "var(--orange)" }}>.</span>
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.15em", color: "var(--cream-2)", marginBottom: 4 }}>
          BOOKING
        </div>
        <a href="mailto:achillecipriani@gmail.com" style={{
          fontFamily: "var(--font-display)", fontSize: 18,
          color: "var(--cream)", textDecoration: "none",
          borderBottom: "1.5px solid var(--orange)", paddingBottom: 2,
          textTransform: "none",
        }}>
          achillecipriani@gmail.com
        </a>
        <div style={{ marginTop: 28, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--mute)", letterSpacing: "0.1em" }}>
            © 2026 · Dj Aco
          </div>
          <button
            onClick={() => { setPwOpen(v => !v); setPw(""); }}
            style={{ background: "transparent", border: "none", cursor: "pointer", opacity: 0.25, padding: 4, lineHeight: 1 }}
            title=""
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--cream)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </button>
        </div>

        {pwOpen && (
          <form onSubmit={handlePw} style={{ marginTop: 12, animation: shake ? "none" : "pageIn 0.2s ease" }}>
            <div style={{
              display: "flex", gap: 8,
              animation: shake ? "shake 0.4s ease" : "none",
            }}>
              <input
                type="password"
                value={pw}
                onChange={e => setPw(e.target.value)}
                placeholder="password"
                autoFocus
                style={{
                  flex: 1, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)",
                  color: "var(--cream)", borderRadius: 8, padding: "8px 12px",
                  fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.1em",
                }}
              />
              <button type="submit" style={{
                background: "var(--orange)", border: "none", borderRadius: 8,
                padding: "8px 14px", cursor: "pointer", fontFamily: "var(--font-mono)",
                fontSize: 11, color: "var(--ink)", letterSpacing: "0.1em",
              }}>→</button>
            </div>
          </form>
        )}
      </footer>
    </div>
  );
}

const socialStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 38, height: 38,
  borderRadius: "50%",
  border: "1.5px solid var(--cream)",
  color: "var(--cream)",
  fontFamily: "var(--font-display)",
  fontSize: 12,
  textDecoration: "none",
};

window.HomePage = HomePage;
