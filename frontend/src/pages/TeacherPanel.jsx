import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpeg";
import { getToken, removeToken } from "../utils/auth";

const BASE = "https://pramyan.com/assessment/backend_test/backend/routes";

function decodeJWT(t) {
  try {
    return JSON.parse(atob(t.split(".")[1]));
  } catch {
    return null;
  }
}
function getPerf(pct) {
  if (pct >= 80) return { label: "Excellent", emoji: "🏆", color: "#1D9E75" };
  if (pct >= 60) return { label: "Good", emoji: "👍", color: "#185FA5" };
  if (pct >= 40) return { label: "Average", emoji: "📈", color: "#e07b2a" };
  return { label: "Needs Work", emoji: "💪", color: "#e24b4a" };
}
function getStatus(pct) {
  if (pct >= 80) return { label: "✅ Strong", bg: "#e6f7f1", color: "#1D9E75" };
  if (pct >= 50)
    return { label: "⚠️ Average", bg: "#fff4e0", color: "#d97706" };
  return { label: "❌ Needs Work", bg: "#fff0f0", color: "#e24b4a" };
}
const BLOOM_NAME = {
  L1: "L1 · Remember",
  L2: "L2 · Understand",
  L3: "L3 · Apply",
  L4: "L4 · Analyse",
  L5: "L5 · Evaluate",
};
const BLOOM_COLOR = {
  L1: "#185FA5",
  L2: "#1D9E75",
  L3: "#e07b2a",
  L4: "#9b59b6",
  L5: "#e24b4a",
};

/* ─────────────── STYLES ─────────────── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
html,body{min-height:100%;background:#EEF4FF;font-family:'Sora',sans-serif;}

@keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
@keyframes fadeIn { from{opacity:0} to{opacity:1} }
@keyframes slideFwd { from{opacity:0;transform:translateX(22px)} to{opacity:1;transform:translateX(0)} }
@keyframes pop { 0%{transform:scale(.95)} 60%{transform:scale(1.04)} 100%{transform:scale(1)} }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }

/* ── NAV ── */
.tp-nav {
background: linear-gradient(135deg,#1D9E75 0%,#185FA5 100%);
height:64px; margin:10px 16px 0; border-radius:16px;
padding:0 26px; display:flex; align-items:center; justify-content:space-between;
box-shadow:0 6px 28px rgba(24,95,165,.22);
position:sticky; top:10px; z-index:200;
}
.nav-brand { display:flex; align-items:center; gap:10px; }
.nav-logo { height:34px; border-radius:7px; background:#fff; padding:3px; }
.nav-title { font-size:14px; font-weight:700; color:#fff; }
.nav-chip {
background:rgba(255,255,255,.18); border:1px solid rgba(255,255,255,.28);
border-radius:20px; padding:3px 10px; font-size:10px; font-weight:700;
color:#fff; letter-spacing:.5px; font-family:'DM Sans',sans-serif;
}
.nav-right { display:flex; align-items:center; gap:10px; }
.nav-name { font-size:12px; color:rgba(255,255,255,.8); font-family:'DM Sans',sans-serif; }
.btn-ghost {
background:rgba(255,255,255,.15); border:1px solid rgba(255,255,255,.28);
color:#fff; border-radius:9px; padding:7px 15px; font-size:12px; font-weight:600;
font-family:'Sora',sans-serif; cursor:pointer; transition:.2s;
}
.btn-ghost:hover { background:rgba(255,255,255,.28); }
.btn-white {
background:#fff; color:#185FA5; border:none; border-radius:9px;
padding:7px 16px; font-size:12px; font-weight:700;
font-family:'Sora',sans-serif; cursor:pointer; transition:.2s;
}
.btn-white:hover { transform:translateY(-1px); box-shadow:0 4px 12px rgba(0,0,0,.1); }

/* ── LAYOUT ── */
.tp-layout {
display:grid; grid-template-columns:340px 1fr;
gap:0; min-height:calc(100vh - 84px);
}

/* ── LEFT PANEL ── */
.tp-left {
background:#fff; border-right:1.5px solid #f0f4fb;
display:flex; flex-direction:column; height:calc(100vh - 84px);
position:sticky; top:84px; overflow-y:auto;
}
.tp-left::-webkit-scrollbar { width:4px; }
.tp-left::-webkit-scrollbar-thumb { background:#e2edf8; border-radius:2px; }

.left-head {
padding:20px 20px 16px; border-bottom:1.5px solid #f0f4fb; flex-shrink:0;
}
.left-title { font-size:15px; font-weight:700; color:#0d1f3c; margin-bottom:4px; }
.left-sub { font-size:11px; color:#aaa; font-family:'DM Sans',sans-serif; }

/* Search box */
.search-wrap { padding:14px 16px; border-bottom:1.5px solid #f0f4fb; flex-shrink:0; }
.search-inner {
display:flex; gap:8px; background:#f4f8ff; border-radius:12px;
border:1.5px solid #e2edf8; padding:6px 12px; align-items:center;
}
.search-inner input {
flex:1; border:none; background:none; font-size:12px;
font-family:'Sora',sans-serif; color:#1a1a1a; outline:none;
}
.search-inner input::placeholder { color:#bbb; }
.search-icon { font-size:14px; flex-shrink:0; }
.search-clear {
background:none; border:none; color:#bbb; cursor:pointer;
font-size:14px; padding:0; line-height:1;
}

/* Filter chips */
.filter-chips { display:flex; gap:6px; padding:10px 16px; flex-wrap:wrap; border-bottom:1.5px solid #f0f4fb; flex-shrink:0; }
.fchip {
padding:4px 12px; border-radius:20px; font-size:11px; font-weight:600;
border:1.5px solid #e2edf8; background:#fff; color:#888;
font-family:'DM Sans',sans-serif; cursor:pointer; transition:.2s; white-space:nowrap;
}
.fchip.on {
background:linear-gradient(135deg,#1D9E75,#185FA5);
color:#fff; border-color:transparent; box-shadow:0 2px 8px rgba(24,95,165,.2);
}

/* Stats row inside left */
.left-stats {
display:grid; grid-template-columns:repeat(3,1fr);
gap:0; border-bottom:1.5px solid #f0f4fb; flex-shrink:0;
}
.lstat {
padding:12px 8px; text-align:center; border-right:1px solid #f0f4fb;
}
.lstat:last-child { border-right:none; }
.lstat-val { font-size:18px; font-weight:800; color:#0d1f3c; line-height:1; }
.lstat-lbl { font-size:9px; color:#aaa; text-transform:uppercase; letter-spacing:.4px; font-family:'DM Sans',sans-serif; margin-top:3px; }

/* Student list */
.student-list { flex:1; overflow-y:auto; }
.student-list::-webkit-scrollbar { width:3px; }
.student-list::-webkit-scrollbar-thumb { background:#e2edf8; }
.srow {
display:flex; align-items:center; gap:10px; padding:12px 16px;
cursor:pointer; border-bottom:1px solid #f8f9ff; transition:.15s;
}
.srow:hover { background:#f4f8ff; }
.srow.active { background:#EEF4FF; border-left:3px solid #185FA5; }
.s-avi {
width:38px; height:38px; border-radius:50%; flex-shrink:0;
background:linear-gradient(135deg,#1D9E75,#185FA5);
display:flex; align-items:center; justify-content:center;
color:#fff; font-size:14px; font-weight:700;
}
.s-name { font-size:12px; font-weight:600; color:#0d1f3c; margin-bottom:2px; }
.s-meta { font-size:10px; color:#aaa; font-family:'DM Sans',sans-serif; }
.s-pill {
margin-left:auto; font-size:10px; font-weight:700;
padding:3px 9px; border-radius:20px; white-space:nowrap; font-family:'DM Sans',sans-serif;
}
.pill-g { background:#e6f7f1; color:#1D9E75; }
.pill-a { background:#fff4e0; color:#d97706; }
.pill-w { background:#fff0f0; color:#e24b4a; }
.pill-n { background:#f0f4fb; color:#aaa; }

.empty-list {
padding:40px 16px; text-align:center;
font-size:13px; color:#bbb; font-family:'DM Sans',sans-serif;
}
.empty-list-icon { font-size:32px; margin-bottom:10px; }

/* ── RIGHT PANEL ── */
.tp-right {
overflow-y:auto; background:#EEF4FF; padding:24px 24px 48px;
}
.tp-right::-webkit-scrollbar { width:5px; }
.tp-right::-webkit-scrollbar-thumb { background:#d4e4f7; border-radius:3px; }

/* Placeholder */
.rp-placeholder {
display:flex; flex-direction:column; align-items:center; justify-content:center;
min-height:400px; gap:16px; animation:fadeIn .4s ease;
}
.rp-placeholder-icon { font-size:56px; }
.rp-placeholder h2 { font-size:18px; font-weight:700; color:#0d1f3c; }
.rp-placeholder p { font-size:13px; color:#aaa; font-family:'DM Sans',sans-serif; }

/* Section eyebrow */
.eyebrow {
font-size:10px; font-weight:700; color:#185FA5; text-transform:uppercase;
letter-spacing:.7px; margin-bottom:10px; font-family:'DM Sans',sans-serif;
}

/* Student info banner */
.stu-banner {
background:#fff; border-radius:18px; padding:18px 22px; margin-bottom:16px;
box-shadow:0 2px 14px rgba(24,95,165,.07); border:1.5px solid #f0f4fb;
display:flex; align-items:center; gap:14px; animation:fadeUp .4s ease both;
}
.stu-avi-lg {
width:54px; height:54px; border-radius:50%; flex-shrink:0;
background:linear-gradient(135deg,#1D9E75,#185FA5);
display:flex; align-items:center; justify-content:center;
color:#fff; font-size:22px; font-weight:800;
}
.stu-name-lg { font-size:16px; font-weight:700; color:#0d1f3c; margin-bottom:3px; }
.stu-sub-lg { font-size:12px; color:#aaa; font-family:'DM Sans',sans-serif; }
.stu-tags { display:flex; gap:7px; margin-top:6px; flex-wrap:wrap; }
.stag {
background:#EEF4FF; border:1px solid #d4e4f7; border-radius:20px;
padding:3px 10px; font-size:11px; color:#185FA5; font-family:'DM Sans',sans-serif; font-weight:600;
}

/* Hero score card */
.hero-card {
background:linear-gradient(135deg,#1D9E75 0%,#185FA5 100%);
border-radius:22px; padding:26px 28px; margin-bottom:16px;
display:flex; align-items:center; justify-content:space-between; gap:18px;
box-shadow:0 8px 28px rgba(24,95,165,.22);
animation:fadeUp .4s ease .05s both;
}
.hero-l { display:flex; flex-direction:column; gap:5px; }
.hero-tag { font-size:11px; color:rgba(255,255,255,.75); font-family:'DM Sans',sans-serif; }
.hero-name { font-size:18px; font-weight:800; color:#fff; }
.hero-sub { font-size:11px; color:rgba(255,255,255,.65); font-family:'DM Sans',sans-serif; }
.hero-r { display:flex; align-items:center; gap:20px; flex-shrink:0; }
.perf { display:flex; flex-direction:column; align-items:center; gap:3px; }
.perf-em { font-size:30px; }
.perf-lbl { font-size:13px; font-weight:700; color:#fff; }
.perf-sub { font-size:10px; color:rgba(255,255,255,.65); font-family:'DM Sans',sans-serif; }
.score-ring {
width:90px; height:90px; border-radius:50%;
background:rgba(255,255,255,.14); border:3px solid rgba(255,255,255,.38);
display:flex; flex-direction:column; align-items:center; justify-content:center;
}
.ring-num { font-size:24px; font-weight:800; color:#fff; line-height:1; }
.ring-den { font-size:12px; color:rgba(255,255,255,.65); font-family:'DM Sans',sans-serif; }

/* Subject grid */
.sub-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:16px; animation:fadeUp .4s ease .08s both; }
.sub-card { background:#fff; border-radius:16px; padding:18px; box-shadow:0 2px 12px rgba(24,95,165,.06); border:1.5px solid #f0f4fb; }
.sub-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
.sub-name { display:flex; align-items:center; gap:8px; font-size:13px; font-weight:700; color:#0d1f3c; }
.sub-ico { width:28px; height:28px; border-radius:7px; display:flex; align-items:center; justify-content:center; font-size:14px; }
.sub-pct { font-size:20px; font-weight:800; }
.bar-bg { height:8px; background:#f0f4fb; border-radius:4px; overflow:hidden; margin-bottom:8px; }
.bar-fg { height:100%; border-radius:4px; transition:width 1.2s ease; }
.sub-bot { display:flex; justify-content:space-between; font-size:11px; color:#aaa; font-family:'DM Sans',sans-serif; }
.sub-st { font-size:11px; font-weight:600; padding:3px 9px; border-radius:20px; }

/* Stat row */
.stat-row { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-bottom:16px; animation:fadeUp .4s ease .1s both; }
.stat-box { background:#fff; border-radius:13px; padding:14px; text-align:center; box-shadow:0 2px 10px rgba(24,95,165,.05); border:1.5px solid #f0f4fb; }
.stat-ico { font-size:18px; margin-bottom:5px; }
.stat-val { font-size:18px; font-weight:800; color:#0d1f3c; margin-bottom:2px; }
.stat-lbl { font-size:10px; color:#aaa; text-transform:uppercase; letter-spacing:.3px; font-family:'DM Sans',sans-serif; }

/* Skill card */
.skill-card { background:#fff; border-radius:16px; padding:18px 22px; margin-bottom:16px; box-shadow:0 2px 12px rgba(24,95,165,.06); border:1.5px solid #f0f4fb; animation:fadeUp .4s ease .12s both; }
.card-title { font-size:13px; font-weight:700; color:#0d1f3c; margin-bottom:14px; display:flex; align-items:center; gap:6px; }
.skill-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
.skill-box { border-radius:13px; padding:14px; text-align:center; border:1.5px solid #f0f4fb; transition:transform .2s; }
.skill-box:hover { transform:translateY(-2px); }
.sk-ico { font-size:22px; margin-bottom:6px; }
.sk-lbl { font-size:11px; font-weight:700; color:#0d1f3c; margin-bottom:3px; }
.sk-val { font-size:20px; font-weight:800; margin-bottom:2px; }
.sk-sub { font-size:10px; color:#aaa; font-family:'DM Sans',sans-serif; }

/* Chapter card */
.chapter-card { background:#fff; border-radius:16px; padding:18px 22px; margin-bottom:16px; box-shadow:0 2px 12px rgba(24,95,165,.06); border:1.5px solid #f0f4fb; animation:fadeUp .4s ease .14s both; }
.ch-row { display:flex; align-items:center; gap:10px; margin-bottom:8px; }
.ch-lbl { width:150px; font-size:11px; font-weight:600; color:#444; flex-shrink:0; font-family:'DM Sans',sans-serif; }
.ch-bg { flex:1; height:9px; background:#f0f4fb; border-radius:5px; overflow:hidden; }
.ch-fill { height:100%; border-radius:5px; transition:width 1.2s ease; }
.ch-pct { width:38px; font-size:11px; font-weight:700; color:#555; font-family:'DM Sans',sans-serif; text-align:right; }
.swot-tag { width:76px; font-size:10px; font-weight:700; border-radius:20px; padding:2px 8px; text-align:center; font-family:'DM Sans',sans-serif; flex-shrink:0; }
.sw-S { background:#e6f7f1; color:#1D9E75; }
.sw-O { background:#EEF4FF; color:#185FA5; }
.sw-W { background:#fff0f0; color:#e24b4a; }

/* Bloom card */
.bloom-card { background:#fff; border-radius:16px; padding:18px 22px; margin-bottom:16px; box-shadow:0 2px 12px rgba(24,95,165,.06); border:1.5px solid #f0f4fb; animation:fadeUp .4s ease .16s both; }
.bl-row { display:flex; align-items:center; gap:10px; margin-bottom:8px; }
.bl-lbl { width:130px; font-size:11px; font-weight:600; color:#444; flex-shrink:0; font-family:'DM Sans',sans-serif; }
.bl-bg { flex:1; height:9px; background:#f0f4fb; border-radius:5px; overflow:hidden; }
.bl-fill { height:100%; border-radius:5px; transition:width 1.2s ease; }
.bl-pct { width:38px; font-size:11px; font-weight:700; color:#555; font-family:'DM Sans',sans-serif; text-align:right; }
.bl-scr { width:46px; font-size:10px; color:#aaa; font-family:'DM Sans',sans-serif; text-align:right; }

/* Q table */
.q-card { background:#fff; border-radius:16px; padding:18px 22px; margin-bottom:16px; box-shadow:0 2px 12px rgba(24,95,165,.06); border:1.5px solid #f0f4fb; overflow:hidden; animation:fadeUp .4s ease .18s both; }
.qtable { width:100%; border-collapse:collapse; }
.qtable th { font-size:10px; font-weight:700; color:#aaa; text-transform:uppercase; letter-spacing:.5px; padding:8px 10px; border-bottom:1.5px solid #f0f4fb; font-family:'DM Sans',sans-serif; text-align:left; }
.qtable td { padding:9px 10px; border-bottom:1px solid #f8f9ff; font-size:12px; font-family:'DM Sans',sans-serif; color:#444; }
.qtable tr:last-child td { border-bottom:none; }
.qtable tr:hover td { background:#fafcff; }
.q-num { font-weight:700; color:#185FA5; }
.opt-c { color:#1D9E75; font-weight:700; }
.opt-w { color:#e24b4a; font-weight:700; }
.opt-s { color:#bbb; }
.chip-c { background:#e6f7f1; color:#1D9E75; border-radius:20px; padding:2px 8px; font-size:11px; font-weight:700; }
.chip-w { background:#fff0f0; color:#e24b4a; border-radius:20px; padding:2px 8px; font-size:11px; font-weight:700; }
.chip-s { background:#f0f4fb; color:#aaa; border-radius:20px; padding:2px 8px; font-size:11px; font-weight:700; }

/* Action plan */
.action-card {
background:linear-gradient(135deg,#e6f7f1,#EEF4FF); border-radius:16px;
padding:18px 22px; margin-bottom:16px; border:1.5px solid #b8e8d4;
animation:fadeUp .4s ease .2s both;
}
.action-text { font-size:13px; color:#444; font-family:'DM Sans',sans-serif; line-height:1.7; white-space:pre-line; }

/* Loading */
.loading { display:flex; gap:7px; justify-content:center; padding:60px; }
.loading span { width:9px; height:9px; border-radius:50%; background:#185FA5; animation:blink 1.2s ease infinite; }
.loading span:nth-child(2){animation-delay:.2s;} .loading span:nth-child(3){animation-delay:.4s;}

/* Error */
.err-banner { background:#fff0f0; border:1.5px solid #ffd4d4; border-radius:12px; padding:12px 16px; font-size:12px; color:#e24b4a; font-family:'DM Sans',sans-serif; margin-bottom:14px; }

@media(max-width:780px){
.tp-layout { grid-template-columns:1fr; }
.tp-left { height:auto; position:static; max-height:300px; }
.sub-grid { grid-template-columns:1fr; }
.stat-row { grid-template-columns:repeat(2,1fr); }
.skill-grid { grid-template-columns:1fr; }
}
`;

/* ─────────────── COMPONENT ─────────────── */
export default function TeacherPanel() {
  const navigate = useNavigate();

  // Auth
  const [teacher, setTeacher] = useState(null);

  // Student list
  const [allStudents, setAllStudents] = useState([]);
  const [shown, setShown] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [listLoading, setListLoading] = useState(true);

  // Active report
  const [activeStudent, setActiveStudent] = useState(null); // { id, name, ... }
  const [report, setReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState("");

  /* ── auth check ── */
  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/");
      return;
    }
    const dec = decodeJWT(token);
    if (!dec || !["teacher", "admin"].includes(dec.role)) {
      navigate("/");
      return;
    }
    setTeacher(dec);
    loadStudents(token);
  }, []);

  /* ── load all students ── */
  const loadStudents = async (token) => {
    setListLoading(true);
    try {
      const res = await fetch(`${BASE}/get-all-students.php`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setAllStudents(data.students);
        setShown(data.students);
      }
    } catch {
      /* keep empty */
    } finally {
      setListLoading(false);
    }
  };

  /* ── filter logic ── */
  const applyFilter = (list, q, f) => {
    let out = list;
    if (q.trim()) {
      const lq = q.toLowerCase();
      out = out.filter(
        (s) =>
          s.name.toLowerCase().includes(lq) ||
          s.email.toLowerCase().includes(lq) ||
          String(s.class).includes(lq),
      );
    }
    if (f === "strong")
      out = out.filter((s) => s.test_id && s.overall_pct >= 75);
    if (f === "avg")
      out = out.filter(
        (s) => s.test_id && s.overall_pct >= 50 && s.overall_pct < 75,
      );
    if (f === "weak") out = out.filter((s) => s.test_id && s.overall_pct < 50);
    if (f === "none") out = out.filter((s) => !s.test_id);
    return out;
  };
  const doSearch = (q) => {
    setSearch(q);
    setShown(applyFilter(allStudents, q, filter));
  };
  const doFilter = (f) => {
    setFilter(f);
    setShown(applyFilter(allStudents, search, f));
  };
  const clearSearch = () => {
    setSearch("");
    setFilter("all");
    setShown(allStudents);
  };

  /* ── load student report ── */
  const selectStudent = async (s) => {
    setActiveStudent(s);
    setReport(null);
    setReportError("");
    if (!s.test_id) return; // no test taken
    setReportLoading(true);
    try {
      const res = await fetch(
        `${BASE}/get-student-report.php?student_id=${s.id}&test_id=${s.test_id}`,
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );
      const data = await res.json();
      if (data.success) setReport(data);
      else setReportError(data.message || "No report data found");
    } catch {
      setReportError("Network error. Check XAMPP is running.");
    } finally {
      setReportLoading(false);
    }
  };

  /* ── pill helpers ── */
  const pillClass = (s) => {
    if (!s.test_id) return "pill-n";
    return s.overall_pct >= 75
      ? "pill-g"
      : s.overall_pct >= 50
        ? "pill-a"
        : "pill-w";
  };
  const pillLabel = (s) => {
    if (!s.test_id) return "No test";
    return s.overall_pct >= 75
      ? `${Math.round(s.overall_pct)}%`
      : s.overall_pct >= 50
        ? `${Math.round(s.overall_pct)}%`
        : `${Math.round(s.overall_pct)}%`;
  };

  const counts = {
    total: allStudents.length,
    strong: allStudents.filter((s) => s.test_id && s.overall_pct >= 75).length,
    avg: allStudents.filter(
      (s) => s.test_id && s.overall_pct >= 50 && s.overall_pct < 75,
    ).length,
    weak: allStudents.filter((s) => s.test_id && s.overall_pct < 50).length,
  };

  /* ─── RENDER ─── */
  return (
    <>
      <style>{css}</style>

      {/* NAV */}
      <nav className="tp-nav">
        <div className="nav-brand">
          <img src={logo} className="nav-logo" alt="logo" />
          <span className="nav-title">Pramyan Education</span>
          <span className="nav-chip">TEACHER</span>
        </div>
        <div className="nav-right">
          <span className="nav-name">👤 {teacher?.name || "Teacher"}</span>
          <button
            className="btn-white"
            onClick={() => {
              removeToken();
              navigate("/");
            }}>
            Logout
          </button>
        </div>
      </nav>

      {/* MAIN LAYOUT */}
      <div className="tp-layout">
        {/* ── LEFT: student list ── */}
        <div className="tp-left">
          <div className="left-head">
            <div className="left-title">Student Reports</div>
            <div className="left-sub">
              Click a student to view their full report
            </div>
          </div>

          {/* Stats */}
          <div className="left-stats">
            <div className="lstat">
              <div className="lstat-val">{counts.total}</div>
              <div className="lstat-lbl">Total</div>
            </div>
            <div className="lstat">
              <div className="lstat-val" style={{ color: "#1D9E75" }}>
                {counts.strong}
              </div>
              <div className="lstat-lbl">Strong</div>
            </div>
            <div className="lstat">
              <div className="lstat-val" style={{ color: "#e24b4a" }}>
                {counts.weak}
              </div>
              <div className="lstat-lbl">Weak</div>
            </div>
          </div>

          {/* Search */}
          <div className="search-wrap">
            <div className="search-inner">
              <span className="search-icon">🔍</span>
              <input
                placeholder="Name, email, class..."
                value={search}
                onChange={(e) => doSearch(e.target.value)}
              />
              {search && (
                <button className="search-clear" onClick={clearSearch}>
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Filter chips */}
          <div className="filter-chips">
            {[
              { k: "all", l: "All" },
              { k: "strong", l: "🏆 Strong" },
              { k: "avg", l: "⚠️ Avg" },
              { k: "weak", l: "❌ Weak" },
              { k: "none", l: "📭 No test" },
            ].map((f) => (
              <button
                key={f.k}
                className={`fchip ${filter === f.k ? "on" : ""}`}
                onClick={() => doFilter(f.k)}>
                {f.l}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="student-list">
            {listLoading ? (
              <div className="loading">
                <span />
                <span />
                <span />
              </div>
            ) : shown.length === 0 ? (
              <div className="empty-list">
                <div className="empty-list-icon">🔍</div>
                No students found
              </div>
            ) : (
              shown.map((s) => (
                <div
                  key={s.id}
                  className={`srow ${activeStudent?.id === s.id ? "active" : ""}`}
                  onClick={() => selectStudent(s)}>
                  <div className="s-avi">{s.name[0]?.toUpperCase()}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="s-name">{s.name}</div>
                    <div className="s-meta">
                      Class {s.class} · {s.email}
                    </div>
                  </div>
                  <span className={`s-pill ${pillClass(s)}`}>
                    {pillLabel(s)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── RIGHT: full report ── */}
        <div className="tp-right">
          {!activeStudent ? (
            <div className="rp-placeholder">
              <div className="rp-placeholder-icon">👈</div>
              <h2>Select a Student</h2>
              <p>
                Click any student from the left panel to view their full
                diagnostic report.
              </p>
            </div>
          ) : reportLoading ? (
            <div className="loading">
              <span />
              <span />
              <span />
            </div>
          ) : (
            <>
              {reportError && (
                <div className="err-banner">⚠️ {reportError}</div>
              )}

              {/* Student banner */}
              <div className="eyebrow">👤 Student Profile</div>
              <div className="stu-banner">
                <div className="stu-avi-lg">
                  {activeStudent.name[0]?.toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="stu-name-lg">{activeStudent.name}</div>
                  <div className="stu-sub-lg">{activeStudent.email}</div>
                  <div className="stu-tags">
                    <span className="stag">Class {activeStudent.class}</span>
                    <span className="stag">
                      📞 {activeStudent.parent_phone || "N/A"}
                    </span>
                    {activeStudent.test_id && (
                      <span className="stag">
                        Test #{activeStudent.test_id}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {!activeStudent.test_id ? (
                <div className="rp-placeholder" style={{ minHeight: 200 }}>
                  <div style={{ fontSize: 36 }}>📭</div>
                  <h2>No test submitted</h2>
                  <p>This student hasn't taken a test yet.</p>
                </div>
              ) : (
                report && (
                  <>
                    {/* HERO */}
                    <div className="eyebrow">📊 Overall Score</div>
                    {(() => {
                      const perf = getPerf(report.overall_pct);
                      const mathSt = getStatus(report.math_pct);
                      const sciSt = getStatus(report.sci_pct);
                      return (
                        <>
                          <div className="hero-card">
                            <div className="hero-l">
                              <span className="hero-tag">
                                Diagnostic Assessment Result
                              </span>
                              <span className="hero-name">
                                {activeStudent.name.split(" ")[0]}'s Full Report
                              </span>
                              <span className="hero-sub">
                                Complete Teacher View — All Sections Unlocked
                              </span>
                            </div>
                            <div className="hero-r">
                              <div className="perf">
                                <span className="perf-em">{perf.emoji}</span>
                                <span className="perf-lbl">{perf.label}</span>
                                <span className="perf-sub">Performance</span>
                              </div>
                              <div className="score-ring">
                                <span className="ring-num">
                                  {report.total_score}
                                </span>
                                <span className="ring-den">
                                  / {report.max_score}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* SUBJECTS */}
                          <div className="eyebrow">📚 Subject-wise Score</div>
                          <div className="sub-grid">
                            <div className="sub-card">
                              <div className="sub-top">
                                <div className="sub-name">
                                  <div
                                    className="sub-ico"
                                    style={{ background: "#EEF4FF" }}>
                                    📐
                                  </div>
                                  Mathematics
                                </div>
                                <span
                                  className="sub-pct"
                                  style={{ color: "#185FA5" }}>
                                  {report.math_pct}%
                                </span>
                              </div>
                              <div className="bar-bg">
                                <div
                                  className="bar-fg"
                                  style={{
                                    width: `${report.math_pct}%`,
                                    background:
                                      "linear-gradient(90deg,#185FA5,#1D9E75)",
                                  }}
                                />
                              </div>
                              <div className="sub-bot">
                                <span>
                                  {report.math_score} / {report.math_max} marks
                                </span>
                                <span
                                  className="sub-st"
                                  style={{
                                    background: mathSt.bg,
                                    color: mathSt.color,
                                  }}>
                                  {mathSt.label}
                                </span>
                              </div>
                            </div>
                            <div className="sub-card">
                              <div className="sub-top">
                                <div className="sub-name">
                                  <div
                                    className="sub-ico"
                                    style={{ background: "#e6f7f1" }}>
                                    🔬
                                  </div>
                                  Science
                                </div>
                                <span
                                  className="sub-pct"
                                  style={{ color: "#1D9E75" }}>
                                  {report.sci_pct}%
                                </span>
                              </div>
                              <div className="bar-bg">
                                <div
                                  className="bar-fg"
                                  style={{
                                    width: `${report.sci_pct}%`,
                                    background:
                                      "linear-gradient(90deg,#1D9E75,#185FA5)",
                                  }}
                                />
                              </div>
                              <div className="sub-bot">
                                <span>
                                  {report.sci_score} / {report.sci_max} marks
                                </span>
                                <span
                                  className="sub-st"
                                  style={{
                                    background: sciSt.bg,
                                    color: sciSt.color,
                                  }}>
                                  {sciSt.label}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* STATS */}
                          <div className="stat-row">
                            {[
                              {
                                i: "✅",
                                v: report.correct,
                                l: "Correct",
                                c: "#1D9E75",
                              },
                              {
                                i: "❌",
                                v: report.wrong,
                                l: "Wrong",
                                c: "#e24b4a",
                              },
                              {
                                i: "⬜",
                                v: report.unanswered,
                                l: "Skipped",
                                c: "#aaa",
                              },
                              {
                                i: "🎯",
                                v: `${report.overall_pct}%`,
                                l: "Overall",
                                c: "#185FA5",
                              },
                            ].map((s, i) => (
                              <div className="stat-box" key={i}>
                                <div className="stat-ico">{s.i}</div>
                                <div
                                  className="stat-val"
                                  style={{ color: s.c }}>
                                  {s.v}
                                </div>
                                <div className="stat-lbl">{s.l}</div>
                              </div>
                            ))}
                          </div>

                          {/* P1 P2 P3 */}
                          <div className="eyebrow">🎯 Skill Analysis</div>
                          <div className="skill-card">
                            <div className="card-title">
                              🎯 P1 / P2 / P3 Skill Breakdown
                            </div>
                            <div className="skill-grid">
                              {[
                                {
                                  k: "p1",
                                  ico: "💡",
                                  lbl: "P1 · Conceptual",
                                  sub: "Recall & Concept",
                                  c: "#185FA5",
                                  bg: "#EEF4FF",
                                },
                                {
                                  k: "p2",
                                  ico: "⚙️",
                                  lbl: "P2 · Procedural",
                                  sub: "Method & Procedure",
                                  c: "#1D9E75",
                                  bg: "#e6f7f1",
                                },
                                {
                                  k: "p3",
                                  ico: "🚀",
                                  lbl: "P3 · Application",
                                  sub: "Real-world Apply",
                                  c: "#e07b2a",
                                  bg: "#fff4e0",
                                },
                              ].map((sk) => (
                                <div
                                  className="skill-box"
                                  key={sk.k}
                                  style={{
                                    background: sk.bg,
                                    borderColor: sk.bg,
                                  }}>
                                  <div className="sk-ico">{sk.ico}</div>
                                  <div className="sk-lbl">{sk.lbl}</div>
                                  <div
                                    className="sk-val"
                                    style={{ color: sk.c }}>
                                    {report[sk.k]}%
                                  </div>
                                  <div className="sk-sub">{sk.sub}</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* CHAPTER */}
                          {report.chapter_scores?.length > 0 && (
                            <>
                              <div className="eyebrow">📈 Chapter Analysis</div>
                              <div className="chapter-card">
                                <div className="card-title">
                                  📈 Chapter-wise Performance
                                </div>
                                {report.chapter_scores.map((ch, i) => {
                                  const p = parseFloat(ch.pct) || 0;
                                  const c =
                                    p >= 75
                                      ? "#1D9E75"
                                      : p >= 50
                                        ? "#e07b2a"
                                        : "#e24b4a";
                                  const sc =
                                    ch.swot_category === "Strength"
                                      ? "sw-S"
                                      : ch.swot_category === "Opportunity"
                                        ? "sw-O"
                                        : "sw-W";
                                  return (
                                    <div className="ch-row" key={i}>
                                      <div className="ch-lbl">{ch.chapter}</div>
                                      <div className="ch-bg">
                                        <div
                                          className="ch-fill"
                                          style={{
                                            width: `${p}%`,
                                            background: c,
                                          }}
                                        />
                                      </div>
                                      <div className="ch-pct">{p}%</div>
                                      <div className={`swot-tag ${sc}`}>
                                        {ch.swot_category}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </>
                          )}

                          {/* BLOOM */}
                          {report.bloom_scores?.length > 0 && (
                            <>
                              <div className="eyebrow">🌸 Bloom's Taxonomy</div>
                              <div className="bloom-card">
                                <div className="card-title">
                                  🌸 Bloom's Cognitive Levels
                                </div>
                                {report.bloom_scores.map((b, i) => {
                                  const p = parseFloat(b.pct) || 0;
                                  const c =
                                    BLOOM_COLOR[b.bloom_level] || "#185FA5";
                                  return (
                                    <div className="bl-row" key={i}>
                                      <div className="bl-lbl">
                                        {BLOOM_NAME[b.bloom_level] ||
                                          b.bloom_level}
                                      </div>
                                      <div className="bl-bg">
                                        <div
                                          className="bl-fill"
                                          style={{
                                            width: `${p}%`,
                                            background: c,
                                          }}
                                        />
                                      </div>
                                      <div className="bl-pct">{p}%</div>
                                      <div className="bl-scr">
                                        {b.score}/{b.max_score}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </>
                          )}

                          {/* QUESTION DETAIL */}
                          {report.questions?.length > 0 && (
                            <>
                              <div className="eyebrow">
                                📋 Question-wise Detail
                              </div>
                              <div className="q-card">
                                <div className="card-title">
                                  📋 Score Entry Sheet
                                </div>
                                <table className="qtable">
                                  <thead>
                                    <tr>
                                      <th>Q#</th>
                                      <th>Chapter</th>
                                      <th>Bloom</th>
                                      <th>Skill</th>
                                      <th>Correct</th>
                                      <th>Student</th>
                                      <th>Result</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {report.questions.map((q, i) => {
                                      const ok = parseInt(q.is_correct) === 1;
                                      const sk = !q.selected_option;
                                      return (
                                        <tr key={q.question_id}>
                                          <td>
                                            <span className="q-num">
                                              Q{i + 1}
                                            </span>
                                          </td>
                                          <td>{q.chapter}</td>
                                          <td>{q.bloom_level}</td>
                                          <td>{q.skill_type}</td>
                                          <td>
                                            <span className="opt-c">
                                              {q.correct?.toUpperCase()}
                                            </span>
                                          </td>
                                          <td>
                                            {sk ? (
                                              <span className="opt-s">—</span>
                                            ) : ok ? (
                                              <span className="opt-c">
                                                {q.selected_option?.toUpperCase()}
                                              </span>
                                            ) : (
                                              <span className="opt-w">
                                                {q.selected_option?.toUpperCase()}
                                              </span>
                                            )}
                                          </td>
                                          <td>
                                            {sk ? (
                                              <span className="chip-s">
                                                Skipped
                                              </span>
                                            ) : ok ? (
                                              <span className="chip-c">
                                                ✓ Correct
                                              </span>
                                            ) : (
                                              <span className="chip-w">
                                                ✗ Wrong
                                              </span>
                                            )}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </>
                          )}

                          {/* ACTION PLAN */}
                          {report.action_plan && (
                            <>
                              <div className="eyebrow">📝 Action Plan</div>
                              <div className="action-card">
                                <div className="card-title">
                                  📝 Recommended Action Plan
                                </div>
                                <div className="action-text">
                                  {(() => {
                                    let plan = null;
                                    try {
                                      plan =
                                        typeof report.action_plan === "string"
                                          ? JSON.parse(report.action_plan)
                                          : report.action_plan;
                                    } catch (e) {
                                      // Not JSON — fall back to raw text
                                      return report.action_plan;
                                    }

                                    if (plan && typeof plan === "object") {
                                      const entries = Object.entries(plan);
                                      return (
                                        <ul
                                          style={{
                                            listStyle: "none",
                                            padding: 0,
                                            margin: 0,
                                          }}>
                                          {entries.map(([key, value]) => {
                                            // Prettify key: "week1" -> "Week 1"
                                            const label = key
                                              .replace(
                                                /([a-zA-Z]+)(\d+)/,
                                                "$1 $2",
                                              )
                                              .replace(/^./, (c) =>
                                                c.toUpperCase(),
                                              );
                                            return (
                                              <li
                                                key={key}
                                                style={{
                                                  padding: "10px 14px",
                                                  marginBottom: "8px",
                                                  background: "#f0f7ff",
                                                  borderLeft:
                                                    "3px solid #185FA5",
                                                  borderRadius: "6px",
                                                  fontSize: "13.5px",
                                                  lineHeight: "1.5",
                                                }}>
                                                <strong
                                                  style={{ color: "#185FA5" }}>
                                                  {label}:
                                                </strong>{" "}
                                                <span style={{ color: "#333" }}>
                                                  {value}
                                                </span>
                                              </li>
                                            );
                                          })}
                                        </ul>
                                      );
                                    }
                                    return report.action_plan;
                                  })()}
                                </div>
                              </div>
                            </>
                          )}
                        </>
                      );
                    })()}
                  </>
                )
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
