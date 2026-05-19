import React, { useState, useEffect } from "react";
import { db, auth } from "./firebase";
import {
  collection, doc, setDoc, getDoc, getDocs, onSnapshot, query, orderBy
} from "firebase/firestore";
import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut
} from "firebase/auth";
import "./App.css";

// ─── CONSTANTES ───────────────────────────────────────────────────────────────
const ADMIN_EMAIL = "admin@mundial2026.com";
const CLOSING_DATE = new Date("2026-06-09T23:59:59");
const REVEAL_DATE = new Date("2026-06-10T00:00:00");

const MATCHES = [
  // GRUPO A
  { id: 1, group: "A", home: "México", away: "Ecuador", date: "11 Jun", time: "15:00" },
  { id: 2, group: "A", home: "Estados Unidos", away: "Suiza", date: "11 Jun", time: "18:00" },
  { id: 3, group: "A", home: "México", away: "Suiza", date: "15 Jun", time: "15:00" },
  { id: 4, group: "A", home: "Ecuador", away: "Estados Unidos", date: "15 Jun", time: "18:00" },
  { id: 5, group: "A", home: "México", away: "Estados Unidos", date: "19 Jun", time: "18:00" },
  { id: 6, group: "A", home: "Suiza", away: "Ecuador", date: "19 Jun", time: "18:00" },
  // GRUPO B
  { id: 7, group: "B", home: "Argentina", away: "Arabia Saudita", date: "12 Jun", time: "12:00" },
  { id: 8, group: "B", home: "Canadá", away: "Marruecos", date: "12 Jun", time: "15:00" },
  { id: 9, group: "B", home: "Argentina", away: "Marruecos", date: "16 Jun", time: "15:00" },
  { id: 10, group: "B", home: "Arabia Saudita", away: "Canadá", date: "16 Jun", time: "18:00" },
  { id: 11, group: "B", home: "Argentina", away: "Canadá", date: "20 Jun", time: "18:00" },
  { id: 12, group: "B", home: "Marruecos", away: "Arabia Saudita", date: "20 Jun", time: "18:00" },
  // GRUPO C
  { id: 13, group: "C", home: "Francia", away: "Japón", date: "12 Jun", time: "09:00" },
  { id: 14, group: "C", home: "Brasil", away: "Croacia", date: "12 Jun", time: "21:00" },
  { id: 15, group: "C", home: "Francia", away: "Croacia", date: "16 Jun", time: "09:00" },
  { id: 16, group: "C", home: "Japón", away: "Brasil", date: "16 Jun", time: "12:00" },
  { id: 17, group: "C", home: "Francia", away: "Brasil", date: "20 Jun", time: "18:00" },
  { id: 18, group: "C", home: "Croacia", away: "Japón", date: "20 Jun", time: "18:00" },
  // GRUPO D
  { id: 19, group: "D", home: "España", away: "Senegal", date: "13 Jun", time: "09:00" },
  { id: 20, group: "D", home: "Portugal", away: "Costa Rica", date: "13 Jun", time: "12:00" },
  { id: 21, group: "D", home: "España", away: "Costa Rica", date: "17 Jun", time: "15:00" },
  { id: 22, group: "D", home: "Senegal", away: "Portugal", date: "17 Jun", time: "18:00" },
  { id: 23, group: "D", home: "España", away: "Portugal", date: "21 Jun", time: "18:00" },
  { id: 24, group: "D", home: "Costa Rica", away: "Senegal", date: "21 Jun", time: "18:00" },
  // GRUPO E
  { id: 25, group: "E", home: "Alemania", away: "Escocia", date: "13 Jun", time: "15:00" },
  { id: 26, group: "E", home: "Colombia", away: "Italia", date: "13 Jun", time: "21:00" },
  { id: 27, group: "E", home: "Alemania", away: "Italia", date: "17 Jun", time: "09:00" },
  { id: 28, group: "E", home: "Escocia", away: "Colombia", date: "17 Jun", time: "12:00" },
  { id: 29, group: "E", home: "Alemania", away: "Colombia", date: "21 Jun", time: "18:00" },
  { id: 30, group: "E", home: "Italia", away: "Escocia", date: "21 Jun", time: "18:00" },
  // GRUPO F
  { id: 31, group: "F", home: "Inglaterra", away: "Serbia", date: "14 Jun", time: "12:00" },
  { id: 32, group: "F", home: "Países Bajos", away: "Irán", date: "14 Jun", time: "15:00" },
  { id: 33, group: "F", home: "Inglaterra", away: "Irán", date: "18 Jun", time: "12:00" },
  { id: 34, group: "F", home: "Serbia", away: "Países Bajos", date: "18 Jun", time: "15:00" },
  { id: 35, group: "F", home: "Inglaterra", away: "Países Bajos", date: "22 Jun", time: "18:00" },
  { id: 36, group: "F", home: "Irán", away: "Serbia", date: "22 Jun", time: "18:00" },
  // GRUPO G
  { id: 37, group: "G", home: "Uruguay", away: "Corea del Sur", date: "14 Jun", time: "09:00" },
  { id: 38, group: "G", home: "Chile", away: "Camerún", date: "14 Jun", time: "21:00" },
  { id: 39, group: "G", home: "Uruguay", away: "Camerún", date: "18 Jun", time: "09:00" },
  { id: 40, group: "G", home: "Corea del Sur", away: "Chile", date: "18 Jun", time: "18:00" },
  { id: 41, group: "G", home: "Uruguay", away: "Chile", date: "22 Jun", time: "18:00" },
  { id: 42, group: "G", home: "Camerún", away: "Corea del Sur", date: "22 Jun", time: "18:00" },
  // GRUPO H
  { id: 43, group: "H", home: "Países Bajos", away: "Senegal", date: "15 Jun", time: "09:00" },
  { id: 44, group: "H", home: "Ecuador", away: "Arabia Saudita", date: "15 Jun", time: "12:00" },
  { id: 45, group: "H", home: "Países Bajos", away: "Arabia Saudita", date: "19 Jun", time: "15:00" },
  { id: 46, group: "H", home: "Senegal", away: "Ecuador", date: "19 Jun", time: "12:00" },
  { id: 47, group: "H", home: "Senegal", away: "Arabia Saudita", date: "23 Jun", time: "18:00" },
  { id: 48, group: "H", home: "Países Bajos", away: "Ecuador", date: "23 Jun", time: "18:00" },
  // GRUPO I
  { id: 49, group: "I", home: "Australia", away: "Argelia", date: "15 Jun", time: "15:00" },
  { id: 50, group: "I", home: "Nigeria", away: "Dinamarca", date: "15 Jun", time: "21:00" },
  { id: 51, group: "I", home: "Australia", away: "Dinamarca", date: "19 Jun", time: "09:00" },
  { id: 52, group: "I", home: "Argelia", away: "Nigeria", date: "19 Jun", time: "21:00" },
  { id: 53, group: "I", home: "Australia", away: "Nigeria", date: "23 Jun", time: "18:00" },
  { id: 54, group: "I", home: "Dinamarca", away: "Argelia", date: "23 Jun", time: "18:00" },
  // GRUPO J
  { id: 55, group: "J", home: "Turquía", away: "Bélgica", date: "16 Jun", time: "09:00" },
  { id: 56, group: "J", home: "México", away: "Camerún", date: "16 Jun", time: "12:00" },
  { id: 57, group: "J", home: "Turquía", away: "Camerún", date: "20 Jun", time: "09:00" },
  { id: 58, group: "J", home: "Bélgica", away: "México", date: "20 Jun", time: "12:00" },
  { id: 59, group: "J", home: "Turquía", away: "México", date: "24 Jun", time: "18:00" },
  { id: 60, group: "J", home: "Camerún", away: "Bélgica", date: "24 Jun", time: "18:00" },
  // GRUPO K
  { id: 61, group: "K", home: "Polonia", away: "Perú", date: "16 Jun", time: "21:00" },
  { id: 62, group: "K", home: "Costa de Marfil", away: "Suecia", date: "17 Jun", time: "09:00" },
  { id: 63, group: "K", home: "Polonia", away: "Suecia", date: "21 Jun", time: "09:00" },
  { id: 64, group: "K", home: "Perú", away: "Costa de Marfil", date: "21 Jun", time: "12:00" },
  { id: 65, group: "K", home: "Polonia", away: "Costa de Marfil", date: "25 Jun", time: "18:00" },
  { id: 66, group: "K", home: "Suecia", away: "Perú", date: "25 Jun", time: "18:00" },
  // GRUPO L
  { id: 67, group: "L", home: "Egipto", away: "Nueva Zelanda", date: "17 Jun", time: "12:00" },
  { id: 68, group: "L", home: "Qatar", away: "Sudáfrica", date: "17 Jun", time: "21:00" },
  { id: 69, group: "L", home: "Egipto", away: "Sudáfrica", date: "21 Jun", time: "15:00" },
  { id: 70, group: "L", home: "Nueva Zelanda", away: "Qatar", date: "21 Jun", time: "21:00" },
  { id: 71, group: "L", home: "Egipto", away: "Qatar", date: "25 Jun", time: "18:00" },
  { id: 72, group: "L", home: "Sudáfrica", away: "Nueva Zelanda", date: "25 Jun", time: "18:00" },
];

const FLAGS = {
  "México": "🇲🇽", "Ecuador": "🇪🇨", "Estados Unidos": "🇺🇸", "Suiza": "🇨🇭",
  "Argentina": "🇦🇷", "Arabia Saudita": "🇸🇦", "Canadá": "🇨🇦", "Marruecos": "🇲🇦",
  "Francia": "🇫🇷", "Japón": "🇯🇵", "Brasil": "🇧🇷", "Croacia": "🇭🇷",
  "España": "🇪🇸", "Senegal": "🇸🇳", "Portugal": "🇵🇹", "Costa Rica": "🇨🇷",
  "Alemania": "🇩🇪", "Escocia": "🏴󠁧󠁢󠁳󠁣󠁴󠁿", "Colombia": "🇨🇴", "Italia": "🇮🇹",
  "Inglaterra": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "Serbia": "🇷🇸", "Países Bajos": "🇳🇱", "Irán": "🇮🇷",
  "Uruguay": "🇺🇾", "Corea del Sur": "🇰🇷", "Chile": "🇨🇱", "Camerún": "🇨🇲",
  "Australia": "🇦🇺", "Argelia": "🇩🇿", "Nigeria": "🇳🇬", "Dinamarca": "🇩🇰",
  "Turquía": "🇹🇷", "Bélgica": "🇧🇪", "Polonia": "🇵🇱", "Perú": "🇵🇪",
  "Costa de Marfil": "🇨🇮", "Suecia": "🇸🇪", "Egipto": "🇪🇬",
  "Nueva Zelanda": "🇳🇿", "Qatar": "🇶🇦", "Sudáfrica": "🇿🇦",
};

const f = (t) => FLAGS[t] || "🏳️";
const GROUPS = ["A","B","C","D","E","F","G","H","I","J","K","L"];

// ─── APP PRINCIPAL ─────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("landing");
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [participants, setParticipants] = useState({});
  const [results, setResults] = useState({});
  const [myPredictions, setMyPredictions] = useState({});
  const [allPredictions, setAllPredictions] = useState({});
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeGroup, setActiveGroup] = useState("A");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");
  const [saving, setSaving] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPass, setNewPass] = useState("");
  const [addMsg, setAddMsg] = useState("");

  const now = new Date();
  const isClosed = now >= CLOSING_DATE;
  const isRevealed = now >= REVEAL_DATE;

  // ── Cargar datos en tiempo real ──
  useEffect(() => {
    const unsubResults = onSnapshot(collection(db, "results"), snap => {
      const data = {};
      snap.forEach(d => { data[d.id] = d.data(); });
      setResults(data);
    });
    const unsubParts = onSnapshot(collection(db, "participants"), snap => {
      const data = {};
      snap.forEach(d => { data[d.id] = d.data(); });
      setParticipants(data);
    });
    return () => { unsubResults(); unsubParts(); };
  }, []);

  // ── Cargar predicciones del usuario ──
  useEffect(() => {
    if (!user) return;
    const unsubPreds = onSnapshot(collection(db, "predictions"), snap => {
      const myPreds = {};
      const allPreds = {};
      snap.forEach(d => {
        const data = d.data();
        if (d.id.startsWith(user.uid + "_")) {
          const matchId = d.id.replace(user.uid + "_", "");
          myPreds[matchId] = data.pick;
        }
        allPreds[d.id] = data.pick;
      });
      setMyPredictions(myPreds);
      setAllPredictions(allPreds);
    });
    return () => unsubPreds();
  }, [user]);

  // ── Calcular tabla ──
  useEffect(() => {
    const board = Object.entries(participants).map(([uid, data]) => {
      let g = 0, p = 0;
      MATCHES.forEach(m => {
        const result = results[m.id]?.result;
        if (!result) return;
        const pred = allPredictions[`${uid}_${m.id}`];
        if (!pred) { p++; return; }
        if (pred === result) g++;
        else p++;
      });
      return { uid, name: data.name, g, p, pts: g * 2 };
    });
    board.sort((a, b) => b.pts - a.pts || b.g - a.g);
    setLeaderboard(board);
  }, [participants, results, allPredictions]);

  // ── Login ──
  const handleLogin = async () => {
    setLoginError("");
    try {
      const cred = await signInWithEmailAndPassword(auth, loginEmail, loginPass);
      setUser(cred.user);
      setIsAdmin(loginEmail === ADMIN_EMAIL);
      setView(loginEmail === ADMIN_EMAIL ? "admin" : "predict");
    } catch (e) {
      setLoginError("Email o contraseña incorrectos");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setIsAdmin(false);
    setView("landing");
  };

  // ── Predecir ──
  const submitPrediction = async (matchId, pick) => {
    if (isClosed || !user) return;
    const result = results[matchId]?.result;
    if (result) return;
    setSaving(true);
    try {
      await setDoc(doc(db, "predictions", `${user.uid}_${matchId}`), { pick, uid: user.uid, matchId });
      setMyPredictions(prev => ({ ...prev, [matchId]: pick }));
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  // ── Admin: agregar participante ──
  const addParticipant = async () => {
    if (!newName.trim() || newPass.length < 6) {
      setAddMsg("Nombre y contraseña de mínimo 6 caracteres"); return;
    }
    try {
      const email = `${newName.trim().toLowerCase().replace(/\s+/g, ".")}@mundial2026.com`;
      const cred = await createUserWithEmailAndPassword(auth, email, newPass);
      await setDoc(doc(db, "participants", cred.user.uid), { name: newName.trim(), email });
      await signInWithEmailAndPassword(auth, ADMIN_EMAIL, loginPass);
      setNewName(""); setNewPass("");
      setAddMsg(`✓ ${newName.trim()} registrado`);
      setTimeout(() => setAddMsg(""), 3000);
    } catch (e) {
      setAddMsg("Error: " + e.message);
    }
  };

  // ── Admin: ingresar resultado ──
  const setResult = async (matchId, result) => {
    const existing = results[matchId]?.result;
    if (existing) return; // No permite corrección
    await setDoc(doc(db, "results", String(matchId)), { result, matchId, timestamp: new Date() });
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="app">
      <div className="bg-stadium" />

      {/* HEADER */}
      <header className="header">
        <div className="header-inner">
          <div className="logo" onClick={() => setView("landing")}>
            <span className="logo-trophy">🏆</span>
            <div>
              <div className="logo-title">MUNDIAL 2026</div>
              <div className="logo-sub">PRODE · GRUPO DE AMIGOS</div>
            </div>
          </div>
          <nav className="nav">
            <button className="nav-btn" onClick={() => setView("tabla")}>🥇 Tabla</button>
            {!user && <button className="nav-btn-primary" onClick={() => setView("login")}>Ingresar</button>}
            {user && !isAdmin && <button className="nav-btn" onClick={() => setView("predict")}>⚽ Mis picks</button>}
            {user && isAdmin && <button className="nav-btn" onClick={() => setView("admin")}>⚙️ Admin</button>}
            {user && <button className="nav-btn-out" onClick={handleLogout}>{isAdmin ? "ADMIN" : participants[user.uid]?.name || "..."} · Salir</button>}
          </nav>
        </div>
      </header>

      <main className="main">

        {/* ── LANDING ── */}
        {view === "landing" && (
          <div className="landing">
            <div className="hero-eyebrow">FIFA WORLD CUP 2026™ · USA · CANADA · MEXICO</div>
            <h1 className="hero-title">PRODE<br /><span className="hero-accent">AMIGOS</span></h1>
            <p className="hero-desc">Predice los 72 partidos de la fase de grupos.<br />2 puntos por acierto. El más sabio gana.</p>
            <div className="hero-btns">
              <button className="btn-primary" onClick={() => setView("login")}>⚽ Hacer predicciones</button>
              <button className="btn-secondary" onClick={() => setView("tabla")}>🥇 Ver tabla</button>
            </div>
            <div className="hero-stats">
              <div className="stat"><span className="stat-num">72</span><span className="stat-label">partidos</span></div>
              <div className="stat-div" />
              <div className="stat"><span className="stat-num">12</span><span className="stat-label">grupos</span></div>
              <div className="stat-div" />
              <div className="stat"><span className="stat-num">2pts</span><span className="stat-label">por acierto</span></div>
              <div className="stat-div" />
              <div className="stat"><span className="stat-num">9 Jun</span><span className="stat-label">cierre</span></div>
            </div>
          </div>
        )}

        {/* ── LOGIN ── */}
        {view === "login" && (
          <div className="card">
            <h2 className="card-title">🔐 Ingresar</h2>
            <p className="card-sub">Usa el email y contraseña que te dio el admin</p>
            <div className="form-group">
              <label className="label">Email</label>
              <input className="input" placeholder="tu.nombre@mundial2026.com"
                value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()} />
            </div>
            <div className="form-group">
              <label className="label">Contraseña</label>
              <input className="input" type="password" placeholder="••••••"
                value={loginPass} onChange={e => setLoginPass(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()} />
            </div>
            {loginError && <div className="error">{loginError}</div>}
            <button className="btn-primary" onClick={handleLogin}>Entrar</button>
          </div>
        )}

        {/* ── TABLA ── */}
        {view === "tabla" && (
          <div className="full">
            <h2 className="section-title">🥇 Tabla General</h2>
            <div className="tabla">
              <div className="tabla-header">
                <span className="th-pos">Pos.</span>
                <span className="th-name">Participante</span>
                <span className="th-stat">G</span>
                <span className="th-stat">P</span>
                <span className="th-pts">Pts</span>
              </div>
              {leaderboard.length === 0 && <div className="empty">Aún no hay participantes.</div>}
              {leaderboard.map((p, i) => (
                <div key={p.uid} className={`tabla-row ${i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : ""}`}>
                  <span className="td-pos">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}</span>
                  <span className="td-name">{p.name}</span>
                  <span className="td-stat">{p.g}</span>
                  <span className="td-stat">{p.p}</span>
                  <span className="td-pts">{p.pts}</span>
                </div>
              ))}
            </div>

            <h3 className="section-title" style={{ marginTop: 40 }}>📋 Resultados</h3>
            <div className="group-tabs">
              {GROUPS.map(g => (
                <button key={g} className={`g-tab ${activeGroup === g ? "active" : ""}`} onClick={() => setActiveGroup(g)}>Grupo {g}</button>
              ))}
            </div>
            <div className="match-list">
              {MATCHES.filter(m => m.group === activeGroup).map(m => {
                const res = results[m.id]?.result;
                return (
                  <div key={m.id} className="match-card">
                    <div className="match-top">
                      <span className="match-date">{m.date} · {m.time}</span>
                      {res && <span className="badge-result">✓ Resultado registrado</span>}
                    </div>
                    <div className="match-teams">
                      <div className="team-l"><span className="mflag">{f(m.home)}</span><span className="mname">{m.home}</span></div>
                      <div className="match-center">
                        {res ? (
                          <span className="result-pill">
                            {res === "home" ? `Gana ${m.home}` : res === "away" ? `Gana ${m.away}` : "Empate"}
                          </span>
                        ) : <span className="vs">VS</span>}
                      </div>
                      <div className="team-r"><span className="mname">{m.away}</span><span className="mflag">{f(m.away)}</span></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── PREDICT ── */}
        {view === "predict" && user && !isAdmin && (
          <div className="full">
            <div className="predict-header">
              <h2 className="section-title">⚽ Tus Predicciones</h2>
              {isClosed
                ? <div className="closed-banner">🔒 Apuestas cerradas — 9 de junio 2026</div>
                : <div className="open-banner">✅ Abierto hasta el 9 de junio 2026</div>
              }
            </div>
            <div className="group-tabs">
              {GROUPS.map(g => (
                <button key={g} className={`g-tab ${activeGroup === g ? "active" : ""}`} onClick={() => setActiveGroup(g)}>Grupo {g}</button>
              ))}
            </div>
            <div className="match-list">
              {MATCHES.filter(m => m.group === activeGroup).map(m => {
                const pred = myPredictions[m.id];
                const res = results[m.id]?.result;
                const locked = isClosed || !!res;
                const correct = res && pred === res;
                const wrong = res && pred && pred !== res;
                return (
                  <div key={m.id} className={`match-card ${correct ? "correct" : wrong ? "wrong" : ""}`}>
                    <div className="match-top">
                      <span className="match-date">{m.date} · {m.time}</span>
                      <div className="badges">
                        {locked && !res && <span className="badge-closed">🔒 Cerrado</span>}
                        {correct && <span className="badge-green">✓ +2 pts</span>}
                        {wrong && <span className="badge-red">✗ Fallo</span>}
                        {res && !pred && <span className="badge-red">Sin pick</span>}
                      </div>
                    </div>
                    <div className="match-teams">
                      <div className="team-l"><span className="mflag">{f(m.home)}</span><span className="mname">{m.home}</span></div>
                      <span className="vs">VS</span>
                      <div className="team-r"><span className="mname">{m.away}</span><span className="mflag">{f(m.away)}</span></div>
                    </div>
                    {!locked ? (
                      <div className="pick-row">
                        {[
                          { val: "home", label: `✓ ${m.home}` },
                          { val: "draw", label: "= Empate" },
                          { val: "away", label: `✓ ${m.away}` },
                        ].map(opt => (
                          <button key={opt.val}
                            className={`pick-btn ${pred === opt.val ? "active" : ""}`}
                            onClick={() => submitPrediction(m.id, opt.val)}
                            disabled={saving}>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="locked-pick">
                        {pred
                          ? <>Tu pick: <strong>{pred === "home" ? `Gana ${m.home}` : pred === "away" ? `Gana ${m.away}` : "Empate"}</strong></>
                          : <span className="no-pick">No registraste pick para este partido</span>
                        }
                        {res && <span className="result-note"> · Resultado: {res === "home" ? `Gana ${m.home}` : res === "away" ? `Gana ${m.away}` : "Empate"}</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Ver picks de otros — solo desde el 10 de junio */}
            {isRevealed && (
              <div style={{ marginTop: 40 }}>
                <h3 className="section-title">👀 Picks de todos (visible desde 10 Jun)</h3>
                {/* Aquí se pueden agregar picks comparativos */}
              </div>
            )}
          </div>
        )}

        {/* ── ADMIN ── */}
        {view === "admin" && isAdmin && (
          <div className="full">
            <h2 className="section-title">⚙️ Panel de Administración</h2>

            {/* Agregar participante */}
            <div className="admin-section">
              <h3 className="admin-section-title">👥 Registrar participante</h3>
              <p className="admin-note">El email se genera automáticamente como <em>nombre@mundial2026.com</em></p>
              <div className="admin-row">
                <input className="input" placeholder="Nombre (ej: Hugo Cuéllar 1)" value={newName} onChange={e => setNewName(e.target.value)} />
                <input className="input" placeholder="Contraseña (mín. 6 caracteres)" type="text" value={newPass} onChange={e => setNewPass(e.target.value)} />
                <button className="btn-primary" onClick={addParticipant}>Agregar</button>
              </div>
              {addMsg && <div className={addMsg.startsWith("✓") ? "success" : "error"}>{addMsg}</div>}
              <div className="part-list">
                {Object.entries(participants).map(([uid, data]) => (
                  <div key={uid} className="part-row">
                    <span className="part-name">{data.name}</span>
                    <span className="part-email">{data.email}</span>
                    <span className="part-pts">{leaderboard.find(l => l.uid === uid)?.pts || 0} pts</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ingresar resultados */}
            <div className="admin-section">
              <h3 className="admin-section-title">⚽ Ingresar resultados</h3>
              <p className="admin-note" style={{ color: "#ef4444" }}>⚠️ Una vez guardado el resultado NO se puede corregir.</p>
              <div className="group-tabs">
                {GROUPS.map(g => (
                  <button key={g} className={`g-tab ${activeGroup === g ? "active" : ""}`} onClick={() => setActiveGroup(g)}>Grupo {g}</button>
                ))}
              </div>
              <div className="match-list">
                {MATCHES.filter(m => m.group === activeGroup).map(m => {
                  const res = results[m.id]?.result;
                  return (
                    <div key={m.id} className="match-card">
                      <div className="match-top">
                        <span className="match-date">{m.date} · {m.time}</span>
                        {res && <span className="badge-result">✓ REGISTRADO — NO EDITABLE</span>}
                      </div>
                      <div className="match-teams">
                        <div className="team-l"><span className="mflag">{f(m.home)}</span><span className="mname">{m.home}</span></div>
                        <span className="vs">VS</span>
                        <div className="team-r"><span className="mname">{m.away}</span><span className="mflag">{f(m.away)}</span></div>
                      </div>
                      {!res ? (
                        <div className="pick-row">
                          <span className="result-label">Resultado:</span>
                          {[
                            { val: "home", label: `Gana ${m.home}` },
                            { val: "draw", label: "Empate" },
                            { val: "away", label: `Gana ${m.away}` },
                          ].map(opt => (
                            <button key={opt.val} className="pick-btn"
                              onClick={() => { if (window.confirm(`¿Confirmas: ${opt.label} en ${m.home} vs ${m.away}? NO se podrá cambiar.`)) setResult(m.id, opt.val); }}>
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="locked-pick">
                          Resultado final: <strong>{res === "home" ? `Gana ${m.home}` : res === "away" ? `Gana ${m.away}` : "Empate"}</strong>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
