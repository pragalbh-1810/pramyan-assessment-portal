import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  X,
  Trophy,
  AlertTriangle,
  XCircle,
  Inbox,
  ArrowLeft,
  LogOut,
  GraduationCap,
} from "lucide-react";
import logo from "../assets/logo.jpeg";
import { getToken, removeToken } from "../utils/auth";
import { apiUrl } from "../utils/api";

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

function getBloomResult(pct) {
  if (pct === "N/A") return { label: "-", bg: "transparent", color: "#444" };
  const p = parseFloat(pct);
  if (p >= 70) return { label: "Strong", bg: "#e6f7f1", color: "#1D9E75" };
  if (p >= 40) return { label: "On track", bg: "#eef4ff", color: "#185fa5" };
  if (p >= 20) return { label: "Needs work", bg: "#fcebc5", color: "#a06a1b" };
  return { label: "Critical gap", bg: "#fbeae9", color: "#c94a4a" };
}

function getChapterStatus(pct) {
  const p = parseFloat(pct);
  if (p >= 70) return { label: "Strength", bg: "#e6f7f1", color: "#1D9E75" };
  if (p >= 40) return { label: "Gap area", bg: "#fcebc5", color: "#a06a1b" };
  return { label: "Priority", bg: "#fbeae9", color: "#c94a4a" };
}

const BLOOM_LEVELS = [
  {
    level: "L1",
    name: "Remember",
    meaning: "Recall facts & formulas",
    example: "What is the area formula for a trapezium?",
    action:
      "Use flashcards. Memorise formulas, definitions, key facts. 10-min daily recall drill.",
    barColor: "#185FA5",
  },
  {
    level: "L2",
    name: "Understand",
    meaning: "Explain or classify",
    example: "Why does a candle go out when covered?",
    action:
      "Ask 'why'. Use real-life examples. Connect concepts to things the student already knows.",
    barColor: "#2563a8",
  },
  {
    level: "L3",
    name: "Apply",
    meaning: "Solve using formulas",
    example: '"Find pressure if F=200N, A=0.4m²."',
    action:
      "Walk through NCERT solved examples step by step. Identify WHICH step fails — formula, substitution, or arithmetic.",
    barColor: "#3a7bd5",
  },
  {
    level: "L4",
    name: "Analyze",
    meaning: "Compare & reason",
    example: "How does increasing area reduce pressure? Give example.",
    action:
      "Cannot think through multi-step problems. Introduce analysis questions: 'What if...?', 'Compare A and B'.",
    barColor: "#1D9E75",
  },
  {
    level: "L5",
    name: "Evaluate",
    meaning: "Judge & justify",
    example: "Which method of food preservation is better and why?",
    action:
      "No higher-order thinking yet. Practice HOTS and competency-based questions from CBSE banks.",
    barColor: "#e07b2a",
  },
  {
    level: "L6",
    name: "Create",
    meaning: "Design & invent (not in test)",
    example: "Design an experiment to show microorganism growth.",
    action: "N/A",
    barColor: "#aaa",
  },
];

const THREAT_HINTS = {
  Fractions: "Class 6 fractions",
  Decimals: "Class 6 decimals",
  Percentages: "Ratio and proportion",
  Geometry: "Class 6 geometry",
  "Geometry & symmetry": "Class 6 geometry",
  "Area & perimeter": "Mensuration",
  Average: "Data handling",
  "Food - sources & nutrition": "Class 6 food and nutrition",
  "Separation of substances": "Class 6 separation methods",
  "Changes around us": "Class 6 changes around us",
  "Getting to know plants": "Class 6 plants",
  "Body movements": "Class 6 skeletal system",
  "Living & non-living things": "Class 6 living world",
  Water: "Class 7 water chapter",
};

<<<<<<< HEAD:frontend/src/pages/Teacherpanel.jsx
const THREAT_HINTS = {
  Fractions: "Class 6 fractions",
  Decimals: "Class 6 decimals",
  Percentages: "Ratio and proportion",
  Geometry: "Class 6 geometry",
  "Geometry & symmetry": "Class 6 geometry",
  "Area & perimeter": "Mensuration",
  Average: "Data handling",
  "Food - sources & nutrition": "Class 6 food and nutrition",
  "Separation of substances": "Class 6 separation methods",
  "Changes around us": "Class 6 changes around us",
  "Getting to know plants": "Class 6 plants",
  "Body movements": "Class 6 skeletal system",
  "Living & non-living things": "Class 6 living world",
  Water: "Class 7 water chapter",
};

=======
>>>>>>> 78d902e76bd300f799ee02d583faf8981e7ef0d1:frontend/src/pages/TeacherPanel.jsx
function buildChapterSectionMap(questions = []) {
  const map = {};
  questions.forEach((q) => {
    if (!q?.chapter || !q?.section) return;
    if (!map[q.chapter]) map[q.chapter] = q.section;
  });
  return map;
}

function buildSwotBuckets(chapterScores = [], chapterSectionMap = {}) {
  const toItem = (ch) => {
    const pct = Math.round(Number(ch?.pct || 0));
    const section = chapterSectionMap[ch.chapter] || "General";
    const category = String(ch?.swot_category || "").toLowerCase();
    return {
      chapter: ch.chapter,
      pct,
      section,
      category,
      label: `${ch.chapter} (${section} - ${pct}%)`,
    };
  };

  const items = chapterScores.map(toItem);
<<<<<<< HEAD:frontend/src/pages/TeacherPanel.jsx
  const strength = items.filter(
    (x) => x.category === "strength" || x.pct >= 70,
  );
  const opportunity = items.filter(
    (x) => x.category === "opportunity" || (x.pct >= 40 && x.pct < 70),
  );
=======
<<<<<<< HEAD:frontend/src/pages/Teacherpanel.jsx
  const strength = items.filter((x) => x.category === "strength");
  const opportunity = items.filter((x) => x.category === "opportunity");
  const weakness = items.filter((x) => x.category === "weakness");
=======
  const strength = items.filter((x) => x.category === "strength" || x.pct >= 70);
  const opportunity = items.filter((x) => x.category === "opportunity" || (x.pct >= 40 && x.pct < 70));
>>>>>>> 758975a0a9f90541b73b5e672ba08ef2293fcb58:frontend/src/pages/Teacherpanel.jsx
  const weakness = items.filter((x) => x.category === "weakness" || x.pct < 40);
>>>>>>> 78d902e76bd300f799ee02d583faf8981e7ef0d1:frontend/src/pages/TeacherPanel.jsx

  const threats = weakness.map((x) => {
    const hint =
      THREAT_HINTS[x.chapter] ||
      `next-grade ${x.section.toLowerCase()} progression`;
    return `${x.chapter} weak -> ${hint} at risk`;
  });

  return { strength, opportunity, weakness, threats };
}

function buildSkillRows(reportObj) {
  return [
    {
      code: "P1",
      title: "Math - conceptual clarity",
      pct: reportObj.p1,
      color: "#21a179",
    },
    {
      code: "P1",
      title: "Science - conceptual clarity",
      pct: reportObj.p1,
      color: "#3b82f6",
    },
    {
      code: "P2",
      title: "Math - procedural accuracy",
      pct: reportObj.p2,
      color: "#e07b2a",
    },
    {
      code: "P2",
      title: "Science - procedural accuracy",
      pct: reportObj.p2,
      color: "#d65d33",
    },
    {
      code: "P3",
      title: "Math - application (HOTS)",
      pct: reportObj.p3,
      color: "#7c83fd",
    },
    {
      code: "P3",
      title: "Science - application (HOTS)",
      pct: reportObj.p3,
      color: "#5c6ac4",
    },
  ];
}

<<<<<<< HEAD:frontend/src/pages/TeacherPanel.jsx
function buildSkillInsight(name, reportObj) {
  const mathP1 = reportObj.p1 || 0;
  const sciP1 = reportObj.sci_p1 || reportObj.p1 || 0;
  const mathP2 = reportObj.p2 || 0;
  const mathP3 = reportObj.p3 || 0;
=======
function buildSkillInsight(name, skillRows = []) {
  const getPct = (titleStart) => {
    const row = skillRows.find((r) => r.title.startsWith(titleStart));
    return Number(row?.pct || 0);
  };

  const mathP1 = getPct("Math - conceptual clarity");
  const sciP1 = getPct("Science - conceptual clarity");
  const mathP2 = getPct("Math - procedural accuracy");
<<<<<<< HEAD:frontend/src/pages/Teacherpanel.jsx
  const sciP2 = getPct("Science - procedural accuracy");
  const mathP3 = getPct("Math - application (HOTS)");
  const sciP3 = getPct("Science - application (HOTS)");
=======
  const mathP3 = getPct("Math - application (HOTS)");
>>>>>>> 78d902e76bd300f799ee02d583faf8981e7ef0d1:frontend/src/pages/TeacherPanel.jsx
>>>>>>> 758975a0a9f90541b73b5e672ba08ef2293fcb58:frontend/src/pages/Teacherpanel.jsx

  const mathExecPeak = Math.max(mathP2, mathP3);
  const mathDrop = Math.max(0, mathP1 - mathExecPeak);
  const person = name || "Student";

  const conceptText =
    mathP1 >= 70
<<<<<<< HEAD:frontend/src/pages/Teacherpanel.jsx
      ? "she understands concepts reasonably well"
      : mathP1 >= 45
        ? "her concept clarity in Math is moderate"
        : "her concept layer in Math needs rebuilding";

  const mathExecText =
    mathDrop >= 20
      ? `But as soon as she executes a calculation (P2) or applies it to a word problem (P3), the score drops sharply.`
      : `Her transition from concept (P1) to execution and application (P2/P3) is comparatively stable.`;
=======
      ? "understands concepts reasonably well"
      : mathP1 >= 45
        ? "concept clarity in Math is moderate"
        : "concept layer in Math needs rebuilding";

  const mathExecText =
    mathDrop >= 20
      ? `But as soon as they execute a calculation (P2) or apply it to a word problem (P3), the score drops sharply.`
      : `Their transition from concept (P1) to execution and application (P2/P3) is comparatively stable.`;
>>>>>>> 78d902e76bd300f799ee02d583faf8981e7ef0d1:frontend/src/pages/TeacherPanel.jsx

  const scienceText =
    sciP1 < 35
      ? `In Science, even the concept layer is weak at ${sciP1}%.`
      : `In Science, the concept layer is ${sciP1}%, with further gains needed in P2 and P3.`;

  const closeText =
    sciP1 < 35 && mathDrop >= 20
      ? "We have two different problems to fix."
      : "This gives us a clear focus for revision planning.";

  return `Notice: ${person}'s P1 in Math is ${mathP1}% - ${conceptText}. ${mathExecText} ${scienceText} ${closeText}`;
}

<<<<<<< HEAD:frontend/src/pages/TeacherPanel.jsx
// Keyframes that aren't in Tailwind by default
const keyframes = `
  @keyframes tp-fade-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes tp-blink   { 0%,100% { opacity: 1; } 50% { opacity: .3; } }
  .anim-fade-up   { animation: tp-fade-up 0.4s ease both; }
  .anim-d-50      { animation-delay: 0.05s; }
  .anim-d-80      { animation-delay: 0.08s; }
  .anim-d-100     { animation-delay: 0.10s; }
  .anim-d-120     { animation-delay: 0.12s; }
  .anim-d-160     { animation-delay: 0.16s; }
  /* Custom scrollbar — keeps the polished feel from the original */
  .tp-scroll::-webkit-scrollbar { width: 6px; }
  .tp-scroll::-webkit-scrollbar-thumb { background: #d4e4f7; border-radius: 3px; }
  .tp-scroll-narrow::-webkit-scrollbar { width: 5px; }
  .tp-scroll-narrow::-webkit-scrollbar-thumb { background: #e2edf8; border-radius: 3px; }
=======
/* ─────────────── STYLES ─────────────── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=DM+Sans:wght@400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
html,body{
  height:100%; 
  background:#EEF4FF;
  font-family:'Sora',sans-serif;
  overflow: hidden; 
}

@keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }

/* ── NAV ── */
.tp-nav {
  background: linear-gradient(135deg,#1D9E75 0%,#185FA5 100%);
  height:64px; margin:10px 16px 0; border-radius:16px;
  padding:0 26px; display:flex; align-items:center; justify-content:space-between;
  box-shadow:0 6px 28px rgba(24,95,165,.22);
  z-index:200;
}
.nav-brand { display:flex; align-items:center; gap:10px; }
.nav-logo { height:34px; border-radius:7px; background:#fff; padding:3px; }
.nav-chip {
  background:rgba(255,255,255,.18); border:1px solid rgba(255,255,255,.28);
  border-radius:20px; padding:3px 10px; font-size:10px; font-weight:700; color:#fff; 
}
.nav-right { display:flex; align-items:center; gap:10px; }
.nav-name { font-size:12px; color:rgba(255,255,255,.8); font-family:'Inter',sans-serif; }
.btn-white {
  background:#fff; color:#185FA5; border:none; border-radius:9px;
  padding:7px 16px; font-size:12px; font-weight:700;
  font-family:'Sora',sans-serif; cursor:pointer; transition:.2s;
}

/* ── LAYOUT ── */
.tp-layout {
  display:grid; 
  grid-template-columns:360px 1fr; 
  gap:0; 
  height:calc(100vh - 84px); 
  margin-top: 10px;
}

/* ── LEFT PANEL ── */
.tp-left {
  background:#fff; 
  border-right:1px solid #d4e4f7;
  display:flex; 
  flex-direction:column; 
  height: 100%;
  overflow: hidden;
}

.left-head { padding:24px 24px 16px; border-bottom:1px solid #f0f4fb; flex-shrink:0; }
.left-title { font-size:16px; font-weight:800; color:#0d1f3c; margin-bottom:4px; }
.left-sub { font-size:12px; color:#888; font-family:'Inter',sans-serif; }

.search-wrap { padding:16px 20px; border-bottom:1px solid #f0f4fb; flex-shrink:0; }
.search-inner { display:flex; gap:10px; background:#f8fbff; border-radius:12px; border:1px solid #e2edf8; padding:10px 14px; align-items:center; }
.search-inner input { flex:1; border:none; background:none; font-size:13px; font-family:'Sora',sans-serif; outline:none; }
.search-icon { color: #888; font-size: 14px; }
.search-clear { background:none; border:none; color:#bbb; cursor:pointer; font-size:14px; }

.filter-chips { display:flex; gap:8px; padding:12px 20px; flex-wrap:wrap; border-bottom:1px solid #f0f4fb; flex-shrink:0; }
.fchip { padding:6px 14px; border-radius:20px; font-size:11px; font-weight:600; border:1px solid #e2edf8; background:#fff; color:#666; cursor:pointer; transition: 0.2s; }
.fchip.on { background:linear-gradient(135deg,#1D9E75,#185FA5); color:#fff; border-color:transparent; box-shadow:0 2px 8px rgba(24,95,165,.2); }

.left-stats { display:grid; grid-template-columns:repeat(3,1fr); border-bottom:1px solid #f0f4fb; flex-shrink:0; }
.lstat { padding:14px 8px; text-align:center; border-right:1px solid #f0f4fb; }
.lstat-val { font-size:20px; font-weight:800; color:#0d1f3c; }
.lstat-lbl { font-size:10px; color:#888; text-transform:uppercase; margin-top:4px; font-weight: 600;}

.student-list { 
  flex:1; 
  overflow-y:auto; 
  padding-bottom: 24px;
}
.student-list::-webkit-scrollbar { width:5px; }
.student-list::-webkit-scrollbar-thumb { background:#e2edf8; border-radius:3px; }

.srow { display:flex; align-items:center; gap:14px; padding:16px 24px; cursor:pointer; border-bottom:1px solid #f8f9ff; transition:.15s; }
.srow:hover { background:#f8fbff; }
.srow.active { background:#EEF4FF; border-left:4px solid #185FA5; padding-left: 20px; }
.s-avi { width:42px; height:42px; border-radius:50%; background:linear-gradient(135deg,#1D9E75,#185FA5); display:flex; align-items:center; justify-content:center; color:#fff; font-weight:700; font-size:14px; flex-shrink:0;}
.s-name { font-size:14px; font-weight:700; color:#0d1f3c; margin-bottom:4px; }
.s-meta { font-size:11px; color:#666; font-family:'Inter',sans-serif; }
.s-pill { margin-left:auto; font-size:11px; font-weight:700; padding:4px 10px; border-radius:20px; }
.pill-g { background:#e6f7f1; color:#1D9E75; }
.pill-a { background:#fff4e0; color:#d97706; }
.pill-w { background:#fff0f0; color:#e24b4a; }
.pill-n { background:#f0f4fb; color:#aaa; }

.empty-list { padding:40px 20px; text-align:center; font-size:13px; color:#888; font-family:'Inter',sans-serif; }

/* ── RIGHT PANEL ── */
.tp-right { 
  height: 100%;
  overflow-y:auto; 
  background:#EEF4FF; 
  padding:32px 40px 60px; 
}
.tp-right::-webkit-scrollbar { width:6px; }
.tp-right::-webkit-scrollbar-thumb { background:#d4e4f7; border-radius:3px; }

.rp-placeholder { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:400px; gap:16px; text-align: center; }

.eyebrow {
  font-size: 16px; 
  font-weight: 800; 
  color: #185FA5; 
  margin: 36px 0 20px 0; 
  font-family: 'Sora', sans-serif;
  display: flex;
  align-items: center;
  gap: 8px;
}

.stu-banner { background:#fff; border-radius:18px; padding:20px 24px; margin-bottom:24px; box-shadow:0 4px 16px rgba(24,95,165,.05); border:1px solid #e2edf8; display:flex; align-items:center; gap:16px; animation:fadeUp .4s ease both; }
.stu-avi-lg { width:54px; height:54px; border-radius:50%; background:linear-gradient(135deg,#1D9E75,#185FA5); display:flex; align-items:center; justify-content:center; color:#fff; font-size:22px; font-weight:800; }
.stu-name-lg { font-size:18px; font-weight:700; color:#0d1f3c; margin-bottom:3px; }
.stu-sub-lg { font-size:13px; color:#666; font-family:'Inter',sans-serif; }
.stag { background:#EEF4FF; border:1px solid #d4e4f7; border-radius:20px; padding:4px 12px; font-size:11px; color:#185FA5; font-weight:600; margin-right:8px;}

/* ── OVERALL HERO & STATS (From Pasted Code) ── */
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
.perf-lbl { font-size:13px; font-weight:700; color:#fff; }
.perf-sub { font-size:10px; color:rgba(255,255,255,.65); font-family:'DM Sans',sans-serif; }
.score-ring {
  width:90px; height:90px; border-radius:50%;
  background:rgba(255,255,255,.14); border:3px solid rgba(255,255,255,.38);
  display:flex; flex-direction:column; align-items:center; justify-content:center;
}
.ring-num { font-size:24px; font-weight:800; color:#fff; line-height:1; }
.ring-den { font-size:12px; color:rgba(255,255,255,.65); font-family:'DM Sans',sans-serif; }

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

.stat-row { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-bottom:16px; animation:fadeUp .4s ease .1s both; }
.stat-box { background:#fff; border-radius:13px; padding:14px; text-align:center; box-shadow:0 2px 10px rgba(24,95,165,.05); border:1.5px solid #f0f4fb; }
.stat-ico { font-size:18px; margin-bottom:5px; }
.stat-val { font-size:18px; font-weight:800; color:#0d1f3c; margin-bottom:2px; }
.stat-lbl { font-size:10px; color:#aaa; text-transform:uppercase; letter-spacing:.3px; font-family:'DM Sans',sans-serif; }

/* ── NEW SWOT & SKILL BLOCKS ── */
.report-block {
  background:#fff; border:1px solid #e2edf8; border-radius:20px;
  padding:32px 40px; margin-bottom:24px; animation:fadeUp .4s ease .12s both;
  box-shadow: 0 4px 24px rgba(24,95,165,0.06);
}
.block-chip {
  display:inline-flex; align-items:center; gap:6px;
  font-size:10px; font-weight:700; color:#fff;
  background:#1D9E75; padding:4px 10px; border-radius:999px;
  letter-spacing:.4px; text-transform:uppercase; margin-bottom:12px;
  font-family:'DM Sans',sans-serif;
}
.block-title {
  font-size:24px; font-weight:800; color:#0d1f3c;
  margin-bottom:8px; line-height:1.2; font-family:'Sora',sans-serif;
}
.block-desc {
  font-size:14px; color:#444; line-height:1.6;
  font-family:'Inter',sans-serif; margin-bottom:20px;
}
.guide-quote {
  background:#f2f1ff; border-left:4px solid #7c83fd;
  color:#4a4f8a; border-radius:0 8px 8px 0;
  padding:16px 20px; font-size:13px;
  font-family:'Inter',sans-serif; font-style:italic; line-height:1.6;
  margin-bottom:24px;
}

.swot-grid {
  display:grid; grid-template-columns:1fr 1fr; gap:16px;
}
.swot-box {
  border:2px solid; border-radius:12px; padding:20px;
  background:#fff;
}
.swot-box h4 {
  font-size:16px; color:#0d1f3c; margin-bottom:8px; font-weight:800; font-family:'Sora',sans-serif;
}
.swot-box p {
  font-size:12px; color:#666; line-height:1.5; font-family:'Inter',sans-serif;
}
.swot-zone-title {
  margin-top:16px; margin-bottom:8px; font-size:12px; color:#333; font-weight:700;
  font-family:'Inter',sans-serif;
}
.swot-list {
  font-size:12px; color:#444; line-height:1.7; font-family:'Inter',sans-serif; font-weight: 500;
}
.swot-list div { margin-bottom:4px; }

.swot-strength { border-color:#7bd7b5; background:#edf8f2; }
.swot-opportunity { border-color:#f0b66a; background:#fff7eb; }
.swot-weakness { border-color:#f2b3a7; background:#fff2ef; }
.swot-threat { border-color:#9ec0ea; background:#eef5ff; }

.skill-level-wrap { margin-top:16px; display:grid; gap:12px; }
.skill-level-card {
  border:1px solid; border-radius:12px; padding:16px 20px;
}
.skill-level-top {
  display:flex; align-items:center; gap:12px; margin-bottom:6px;
}
.skill-code {
  font-weight:800; font-size:24px; line-height:1; width:34px; font-family:'Sora',sans-serif;
}
.skill-head {
  font-size:15px; font-weight:700; color:#0d1f3c; font-family:'Sora',sans-serif;
}
.skill-copy {
  font-size:13px; color:#444; font-family:'Inter',sans-serif; line-height:1.55;
}

.skill-c1 { background:#eef6ff; border-color:#9ec0ea; }
.skill-c1 .skill-code { color:#2d68b1; }
.skill-c2 { background:#fff6e8; border-color:#e8c28d; }
.skill-c2 .skill-code { color:#b8742e; }
.skill-c3 { background:#f2efff; border-color:#b6b0f0; }
.skill-c3 .skill-code { color:#645cc8; }

.skill-bars {
  margin-top:24px; background:#fff; border:1px solid #e2edf8;
  border-radius:12px; padding:24px;
}
.skill-bars h5 {
  font-size:15px; color:#0d1f3c; margin-bottom:16px; font-weight:800; font-family:'Sora',sans-serif;
}
.skill-row {
  display:grid; grid-template-columns:48px 1fr 48px; gap:12px;
  align-items:center; margin-bottom:12px;
}
.skill-tag {
  background:#eef2f7; color:#566074; border-radius:999px;
  font-size:11px; font-weight:800; text-align:center; padding:4px 0;
  font-family:'DM Sans',sans-serif;
}
.skill-bar-main { min-width:0; }
.skill-label {
  font-size:12px; font-weight:600; color:#333; font-family:'Inter',sans-serif;
  margin-bottom:6px;
}
.skill-track {
  height:12px; border-radius:999px; background:#eef2f7; overflow:hidden;
}
.skill-fill { height:100%; border-radius:999px; transition: width 1s; }
.skill-pct {
  text-align:right; font-size:13px; color:#333; font-weight:700;
  font-family:'Inter',sans-serif;
}

/* ── PREVIOUS DETAILED TABLES & CONTAINERS ── */
.bloom-container, .chapter-container, .q-card, .action-card {
  background: white; border-radius: 20px; padding: 40px;
  box-shadow: 0 4px 24px rgba(24,95,165,0.06); border: 1px solid #e2edf8;
  margin-bottom: 32px; animation: fadeUp 0.4s ease 0.16s both;
}
.report-header-text {
  font-size: 20px; font-weight: 800; color: #0d1f3c; margin-bottom: 12px; font-family: 'Sora', sans-serif; text-transform: uppercase;
}
.report-desc-text {
  font-size: 14px; color: #444; margin-bottom: 24px; font-family: 'Inter', sans-serif; line-height: 1.6;
}
.purple-quote {
  background-color: #F6F3FA; border-left: 4px solid #8E62B6; padding: 18px 24px; margin: 24px 0 32px 0;
  font-style: italic; color: #49335E; font-size: 14px; font-family: 'Inter', sans-serif; line-height: 1.6; border-radius: 0 8px 8px 0;
}
.green-note {
  background-color: #e6f7f1; border: 2px solid #a3e6cd; padding: 18px 24px; border-radius: 12px;
  font-size: 14px; color: #1a4f3e; font-family: 'Inter', sans-serif; line-height: 1.6; margin-top: 32px;
}
.report-table {
  width: 100%; border-collapse: collapse; font-family: 'Inter', sans-serif; font-size: 13.5px; margin-bottom: 32px;
}
.report-table th { background: #234674; color: white; font-weight: 600; padding: 14px 16px; text-align: center; border: 1px solid #234674; }
.report-table td { padding: 14px 16px; border: 1px solid #e2edf8; text-align: center; color: #333; }
.report-table td.left-align { text-align: left; font-weight: 600; color: #185FA5; }
.report-table td.desc-text { text-align: left; color: #555; }
.status-badge { font-weight: 700; padding: 4px 12px; border-radius: 20px; }

/* 📊 Custom Bloom's Graph Styling */
.chart-title { font-weight: 800; font-size: 16px; margin-bottom: 20px; color: #0d1f3c; }
.bloom-graph-wrapper {
  position: relative; margin: 40px 0 40px 140px; padding-bottom: 30px; 
  border-left: 2px solid #cbd5e1; border-bottom: 2px solid #cbd5e1;
}
.bloom-grid-lines {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; justify-content: space-between; z-index: 0;
}
.bloom-grid-line { width: 1px; height: 100%; background: #e2edf8; position: relative; }
.bloom-grid-line span { position: absolute; bottom: -25px; transform: translateX(-50%); font-size: 12px; color: #64748b; font-family: 'Inter', sans-serif; }
.bloom-bar-row { position: relative; z-index: 1; display: flex; align-items: center; height: 40px; margin-bottom: 16px; }
.bloom-bar-label { position: absolute; left: -150px; width: 140px; font-size: 13px; font-weight: 600; text-align: right; color: #334155; font-family: 'Inter', sans-serif; }
.bloom-bar-fill {
  height: 24px; border-radius: 0 4px 4px 0; display: flex; align-items: center; padding-left: 10px;
  color: white; font-weight: 700; font-size: 12px; font-family: 'Inter', sans-serif; transition: width 1s ease-out; min-width: 30px; 
}

/* Action plan styling */
.action-card { background: linear-gradient(135deg,#f8fbff,#EEF4FF); border: 1px solid #c9dff7; }

/* Q table */
.qtable { width:100%; border-collapse:collapse; }
.qtable th { font-size:12px; font-weight:700; color:#888; text-transform:uppercase; padding:12px 14px; border-bottom:2px solid #e2edf8; text-align:left; }
.qtable td { padding:14px; border-bottom:1px solid #f0f4fb; font-size:13px; font-family:'Inter',sans-serif; color:#444; }
.opt-c { color:#1D9E75; font-weight:700; }
.opt-w { color:#e24b4a; font-weight:700; }
<<<<<<< HEAD:frontend/src/pages/Teacherpanel.jsx
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

/* SWOT + Skill teacher report blocks */
.report-block {
background:#fff; border:1.5px solid #e4edf8; border-radius:16px;
padding:18px 20px; margin-bottom:16px; animation:fadeUp .4s ease .12s both;
}
.block-chip {
display:inline-flex; align-items:center; gap:6px;
font-size:10px; font-weight:700; color:#fff;
background:#0f9c8c; padding:4px 10px; border-radius:999px;
letter-spacing:.4px; text-transform:uppercase; margin-bottom:10px;
font-family:'DM Sans',sans-serif;
}
.block-title {
font-size:30px; font-weight:800; color:#1e4979;
margin-bottom:6px; line-height:1.2;
}
.block-desc {
font-size:12px; color:#6b7280; line-height:1.6;
font-family:'DM Sans',sans-serif; margin-bottom:10px;
}
.guide-quote {
background:#f2f1ff; border-left:4px solid #7c83fd;
color:#4a4f8a; border-radius:6px;
padding:10px 12px; font-size:12px;
font-family:'DM Sans',sans-serif; font-style:italic; line-height:1.6;
margin-bottom:12px;
}

.swot-grid {
display:grid; grid-template-columns:1fr 1fr; gap:12px;
}
.swot-box {
border:2px solid; border-radius:6px; padding:12px;
background:#fff;
}
.swot-box h4 {
font-size:14px; color:#24364a; margin-bottom:8px; font-weight:800;
}
.swot-box p {
font-size:11px; color:#6b7280; line-height:1.5; font-family:'DM Sans',sans-serif;
}
.swot-zone-title {
margin-top:10px; margin-bottom:6px; font-size:11px; color:#4b5563; font-weight:700;
font-family:'DM Sans',sans-serif;
}
.swot-list {
font-size:11px; color:#374151; line-height:1.7; font-family:'DM Sans',sans-serif;
}
.swot-list div { margin-bottom:2px; }

.swot-strength { border-color:#7bd7b5; background:#edf8f2; }
.swot-opportunity { border-color:#f0b66a; background:#fff7eb; }
.swot-weakness { border-color:#f2b3a7; background:#fff2ef; }
.swot-threat { border-color:#9ec0ea; background:#eef5ff; }

.skill-level-wrap { margin-top:10px; display:grid; gap:8px; }
.skill-level-card {
border:1.5px solid; border-radius:6px; padding:10px 12px;
}
.skill-level-top {
display:flex; align-items:center; gap:8px; margin-bottom:4px;
}
.skill-code {
font-weight:800; font-size:22px; line-height:1; width:34px;
}
.skill-head {
font-size:14px; font-weight:700; color:#24364a;
}
.skill-copy {
font-size:11px; color:#4b5563; font-family:'DM Sans',sans-serif; line-height:1.55;
}

.skill-c1 { background:#eef6ff; border-color:#9ec0ea; }
.skill-c1 .skill-code { color:#2d68b1; }
.skill-c2 { background:#fff6e8; border-color:#e8c28d; }
.skill-c2 .skill-code { color:#b8742e; }
.skill-c3 { background:#f2efff; border-color:#b6b0f0; }
.skill-c3 .skill-code { color:#645cc8; }

.skill-bars {
margin-top:12px; background:#fff; border:1.5px solid #e4edf8;
border-radius:8px; padding:12px;
}
.skill-bars h5 {
font-size:14px; color:#24364a; margin-bottom:10px; font-weight:800;
}
.skill-row {
display:grid; grid-template-columns:40px 1fr 48px; gap:10px;
align-items:center; margin-bottom:8px;
}
.skill-tag {
background:#eef2f7; color:#566074; border-radius:999px;
font-size:10px; font-weight:800; text-align:center; padding:3px 0;
font-family:'DM Sans',sans-serif;
}
.skill-bar-main { min-width:0; }
.skill-label {
font-size:11px; color:#3f4a5b; font-family:'DM Sans',sans-serif;
margin-bottom:4px;
}
.skill-track {
height:10px; border-radius:999px; background:#eef2f7; overflow:hidden;
}
.skill-fill {
height:100%; border-radius:999px;
}
.skill-pct {
text-align:right; font-size:11px; color:#374151; font-weight:700;
font-family:'DM Sans',sans-serif;
}

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
.swot-grid { grid-template-columns:1fr; }
.block-title { font-size:24px; }

.hero-card {
    background: linear-gradient(135deg, #1D9E75 0%, #185FA5 100%);
    border-radius: 22px;
    padding: 26px 28px;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    box-shadow: 0 8px 28px rgba(24, 95, 165, .22);
    animation: fadeUp .4s ease .05s both;
    flex-direction: column !important;
}
         .nav-name{
         display:none;}
=======

@media(max-width:780px){
  html, body { overflow: auto; }
  .tp-layout { grid-template-columns:1fr; height: auto; overflow: visible;}
  .tp-left { height:auto; position:static; max-height:400px; border-right: none; border-bottom: 2px solid #d4e4f7;}
  .tp-right { padding: 20px 16px; height: auto; overflow: visible;}
  .sub-grid, .stat-row { grid-template-columns:1fr; }
  
  .hero-card { flex-direction: column; align-items: flex-start; padding: 24px; gap: 20px; }
  .hero-r { align-items: flex-start; }
  
  .bloom-container, .chapter-container, .q-card, .action-card { padding: 20px; }
  .swot-grid { grid-template-columns: 1fr; }
  .report-table { display: block; overflow-x: auto; white-space: nowrap; }
  .bloom-graph-wrapper { margin-left: 90px; }
  .bloom-bar-label { left: -100px; width: 90px; font-size: 11px; }
>>>>>>> 78d902e76bd300f799ee02d583faf8981e7ef0d1:frontend/src/pages/TeacherPanel.jsx
}
>>>>>>> 758975a0a9f90541b73b5e672ba08ef2293fcb58:frontend/src/pages/Teacherpanel.jsx
`;

// pill class helper
const pillCls = (pct, hasTest) => {
  if (!hasTest) return "bg-[#f0f4fb] text-[#aaa]";
  if (pct >= 75) return "bg-[#e6f7f1] text-[#1D9E75]";
  if (pct >= 50) return "bg-[#fff4e0] text-[#d97706]";
  return "bg-[#fff0f0] text-[#e24b4a]";
};

const FILTER_CHIPS = [
  { k: "all", l: "All", Icon: null },
  { k: "strong", l: "Strong", Icon: Trophy },
  { k: "avg", l: "Avg", Icon: AlertTriangle },
  { k: "weak", l: "Weak", Icon: XCircle },
  { k: "none", l: "No test", Icon: Inbox },
];

/* ─────────────── COMPONENT ─────────────── */
export default function TeacherPanel() {
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [allStudents, setAllStudents] = useState([]);
  const [shown, setShown] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [listLoading, setListLoading] = useState(true);

  const [activeStudent, setActiveStudent] = useState(null);
  const [report, setReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState("");

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadStudents = async (token) => {
    setListLoading(true);
    try {
      const res = await fetch(apiUrl("get-all-students.php"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setAllStudents(data.students);
        setShown(data.students);
      }
    } catch {
    } finally {
      setListLoading(false);
    }
  };

  const applyFilter = (list, q, f) => {
    let out = list;
    if (q.trim()) {
      const lq = q.toLowerCase();
      out = out.filter(
        (s) =>
          s.name.toLowerCase().includes(lq) ||
          s.email.toLowerCase().includes(lq),
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

  const selectStudent = async (s) => {
    setActiveStudent(s);
    setReport(null);
    setReportError("");
    if (!s.test_id) return;
    setReportLoading(true);
    try {
      const res = await fetch(
        apiUrl(
          `get-student-report.php?student_id=${s.id}&test_id=${s.test_id}`,
        ),
        { headers: { Authorization: `Bearer ${getToken()}` } },
      );
      const data = await res.json();
      if (data.success) setReport(data);
      else setReportError(data.message || "No report data found");
    } catch (err) {
      console.error(err);
      setReportError("Network error. Check console for details.");
    } finally {
      setReportLoading(false);
    }
  };

  const pillLabel = (s) => {
    if (!s.test_id) return "No test";
    return `${Math.round(s.overall_pct)}%`;
  };

  const counts = {
    total: allStudents.length,
    strong: allStudents.filter((s) => s.test_id && s.overall_pct >= 75).length,
    avg: allStudents.filter(
      (s) => s.test_id && s.overall_pct >= 50 && s.overall_pct < 75,
    ).length,
    weak: allStudents.filter((s) => s.test_id && s.overall_pct < 50).length,
  };

  return (
    <>
      <style>{keyframes}</style>

      <div className="md:h-screen min-h-screen bg-[#EEF4FF] font-['Sora',sans-serif] flex flex-col md:overflow-hidden">
        {/* ── TOP NAV (mobile compact, desktop original) ── */}
        <nav className="sticky top-0 md:top-2.5 z-40 mx-2.5 md:mx-4 mt-2.5 rounded-2xl bg-[linear-gradient(135deg,#1D9E75_0%,#185FA5_100%)] shadow-[0_6px_28px_rgba(24,95,165,0.22)] flex-shrink-0">
          <div className="flex items-center justify-between gap-2 px-3 md:px-6 h-14 md:h-16">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={logo}
                alt="logo"
                className="h-7 md:h-8 rounded-md bg-white p-0.5 shrink-0"
              />
              <span className="hidden md:inline text-sm font-bold text-white">
                Pramyan
              </span>
              <span className="bg-white/20 border border-white/30 rounded-full px-2.5 py-0.5 text-[9px] md:text-[10px] font-bold text-white tracking-wider font-['Inter',sans-serif] flex items-center gap-1">
                <GraduationCap size={10} strokeWidth={2.5} />
                <span className="md:hidden">TEACHER</span>
                <span className="hidden md:inline">TEACHER PORTAL</span>
              </span>
            </div>
            <div className="flex items-center gap-2 md:gap-3 min-w-0">
              <span className="hidden md:inline text-xs text-white/80 font-['Inter',sans-serif] truncate max-w-[180px]">
                {teacher?.name || "Teacher"}
              </span>
              <button
                type="button"
                onClick={() => {
                  removeToken();
                  navigate("/");
                }}
                aria-label="Logout"
                className="bg-white text-[#185FA5] rounded-lg w-9 h-9 md:w-auto md:h-9 md:px-4 flex items-center justify-center md:gap-1.5 text-xs font-bold cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] active:scale-95">
                <LogOut size={14} strokeWidth={2.5} />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </div>
        </nav>

        {/* ── LAYOUT — desktop split / mobile single-screen toggle ── */}
        <div className="md:grid md:grid-cols-[360px_1fr] md:gap-0 md:flex-1 md:min-h-0 mt-2.5 md:mt-0">
          {/* ── LEFT: STUDENT LIST ── */}
          {/* Mobile: hide when a student is selected. Desktop: always visible. */}
          <aside
            className={`${activeStudent ? "hidden md:flex" : "flex"} bg-white md:border-r md:border-[#d4e4f7] flex-col md:h-full md:overflow-hidden mx-2.5 md:mx-0 rounded-2xl md:rounded-none border md:border-0 border-[#d4e4f7]`}>
            {/* head */}
            <div className="px-5 md:px-6 pt-5 pb-4 border-b border-[#f0f4fb] flex-shrink-0">
              <div className="text-base font-extrabold text-[#0d1f3c] mb-0.5">
                Student Reports
              </div>
              <div className="text-xs text-[#888] font-['Inter',sans-serif]">
                Tap a student to view their full report
              </div>
            </div>

            {/* stats — 3 across */}
            <div className="grid grid-cols-3 border-b border-[#f0f4fb] flex-shrink-0">
              <div className="py-3.5 px-2 text-center border-r border-[#f0f4fb]">
                <div className="text-lg md:text-xl font-extrabold text-[#0d1f3c]">
                  {counts.total}
                </div>
                <div className="text-[10px] text-[#888] uppercase mt-0.5 font-semibold">
                  Total
                </div>
              </div>
              <div className="py-3.5 px-2 text-center border-r border-[#f0f4fb]">
                <div className="text-lg md:text-xl font-extrabold text-[#1D9E75]">
                  {counts.strong}
                </div>
                <div className="text-[10px] text-[#888] uppercase mt-0.5 font-semibold">
                  Strong
                </div>
              </div>
              <div className="py-3.5 px-2 text-center">
                <div className="text-lg md:text-xl font-extrabold text-[#e24b4a]">
                  {counts.weak}
                </div>
                <div className="text-[10px] text-[#888] uppercase mt-0.5 font-semibold">
                  Weak
                </div>
              </div>
            </div>

            {/* search */}
            <div className="px-4 md:px-5 py-3.5 border-b border-[#f0f4fb] flex-shrink-0">
              <div className="flex items-center gap-2.5 bg-[#f8fbff] rounded-xl border border-[#e2edf8] px-3.5 py-2.5">
                <Search size={14} className="text-[#888]" strokeWidth={2.25} />
                <input
                  className="flex-1 bg-transparent border-0 outline-none text-[13px] font-['Sora',sans-serif] min-w-0"
                  placeholder="Search students..."
                  value={search}
                  onChange={(e) => doSearch(e.target.value)}
                />
                {search && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    aria-label="Clear search"
                    className="text-[#bbb] hover:text-[#666] p-0.5">
                    <X size={14} strokeWidth={2.5} />
                  </button>
                )}
              </div>
            </div>

            {/* filter chips — horizontal scroll on mobile */}
            <div className="flex gap-2 px-4 md:px-5 py-3 border-b border-[#f0f4fb] flex-shrink-0 overflow-x-auto md:flex-wrap tp-scroll-narrow">
              {FILTER_CHIPS.map((f) => {
                const active = filter === f.k;
                return (
                  <button
                    type="button"
                    key={f.k}
                    onClick={() => doFilter(f.k)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-semibold border transition shrink-0 cursor-pointer ${
                      active
                        ? "bg-[linear-gradient(135deg,#1D9E75,#185FA5)] text-white border-transparent shadow-[0_2px_8px_rgba(24,95,165,0.2)]"
                        : "bg-white text-[#666] border-[#e2edf8] hover:border-[#a8c4e8]"
                    }`}>
                    {f.Icon && <f.Icon size={11} strokeWidth={2.5} />}
                    {f.l}
                  </button>
                );
              })}
            </div>

            {/* list */}
            <div className="flex-1 md:overflow-y-auto pb-6 tp-scroll-narrow">
              {listLoading ? (
                <div className="py-10 text-center text-[#888] text-sm font-['Inter',sans-serif]">
                  Loading...
                </div>
              ) : shown.length === 0 ? (
                <div className="py-10 px-5 text-center text-[13px] text-[#888] font-['Inter',sans-serif]">
                  No students found matching your criteria.
                </div>
              ) : (
                shown.map((s) => {
                  const active = activeStudent?.id === s.id;
                  return (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => selectStudent(s)}
                      className={`w-full flex items-center gap-3.5 py-4 transition-colors border-b border-[#f8f9ff] cursor-pointer text-left ${
                        active
                          ? "bg-[#EEF4FF] border-l-4 border-l-[#185FA5] pl-5 pr-6"
                          : "hover:bg-[#f8fbff] px-6"
                      }`}>
                      <div className="w-[42px] h-[42px] rounded-full bg-[linear-gradient(135deg,#1D9E75,#185FA5)] flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {s.name[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-[#0d1f3c] truncate">
                          {s.name}
                        </div>
                        <div className="text-[11px] text-[#666] font-['Inter',sans-serif] truncate">
                          Class {s.class} · {s.email}
                        </div>
                      </div>
                      <span
                        className={`ml-auto shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full ${pillCls(s.overall_pct, !!s.test_id)}`}>
                        {pillLabel(s)}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* ── RIGHT: REPORT ── */}
          <div
            className={`${activeStudent ? "flex" : "hidden md:flex"} flex-col md:h-full md:overflow-y-auto bg-[#EEF4FF] tp-scroll`}>
            {/* mobile back bar */}
            {activeStudent && (
              <div className="md:hidden sticky top-0 z-10 bg-[#EEF4FF]/95 backdrop-blur-sm px-3 py-2.5 border-b border-[#d4e4f7]">
                <button
                  type="button"
                  onClick={() => {
                    setActiveStudent(null);
                    setReport(null);
                    setReportError("");
                  }}
                  className="flex items-center gap-1.5 text-[#185FA5] text-[13px] font-semibold cursor-pointer active:scale-95 transition">
                  <ArrowLeft size={16} strokeWidth={2.5} />
                  All students
                </button>
              </div>
            )}

            <div className="px-4 md:px-10 py-5 md:py-8 pb-16">
              {!activeStudent ? (
                <div className="hidden md:flex flex-col items-center justify-center min-h-[400px] gap-3 text-center">
                  <div className="text-4xl">👈</div>
                  <h2 className="text-lg font-bold text-[#0d1f3c]">
                    Select a Student
                  </h2>
                  <p className="text-[#888] text-sm font-['Inter',sans-serif]">
                    Click any student from the left panel to view their full
                    diagnostic report.
                  </p>
                </div>
              ) : reportLoading ? (
                <div className="py-16 text-center text-[#888] text-base">
                  Loading Student Data...
                </div>
              ) : (
                <>
                  {reportError && (
                    <div className="bg-[#fff0f0] px-3 py-3 rounded-lg text-[#e24b4a] mb-5 flex items-center gap-2 text-[13px]">
                      <AlertTriangle size={14} />
                      {reportError}
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-2 mb-5 text-[15px] md:text-base font-extrabold text-[#185FA5]">
                    <span>👤</span>
                    <span>Student Profile</span>
                  </div>

                  {/* student banner */}
                  <div className="anim-fade-up bg-white rounded-[18px] px-5 py-5 mb-6 shadow-[0_4px_16px_rgba(24,95,165,0.05)] border border-[#e2edf8] flex items-center gap-4">
                    <div className="w-[54px] h-[54px] rounded-full bg-[linear-gradient(135deg,#1D9E75,#185FA5)] flex items-center justify-center text-white text-xl font-extrabold shrink-0">
                      {activeStudent.name[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[17px] font-bold text-[#0d1f3c] mb-0.5 truncate">
                        {activeStudent.name}
                      </div>
                      <div className="text-[12.5px] text-[#666] font-['Inter',sans-serif] truncate mb-1.5">
                        {activeStudent.email}
                      </div>
<<<<<<< HEAD:frontend/src/pages/TeacherPanel.jsx
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-[#EEF4FF] border border-[#d4e4f7] rounded-full px-3 py-1 text-[11px] text-[#185FA5] font-semibold">
                          Class{" "}
                          {activeStudent.class || report?.test_class || "10"}
                        </span>
                        <span className="bg-[#EEF4FF] border border-[#d4e4f7] rounded-full px-3 py-1 text-[11px] text-[#185FA5] font-semibold">
                          📞 {activeStudent.parent_phone || "N/A"}
                        </span>
=======

                      {/* BLOCK 1: SWOT */}
                      <div className="report-block">
                        <div className="block-chip">BLOCK 1 - SWOT</div>
                        <div className="block-title">What is SWOT Analysis?</div>
                        <div className="block-desc">
                          This section explains chapter-wise placement in four zones so
                          parents clearly understand transition readiness.
                        </div>
                        <div className="guide-quote">
                          {`We don't just give a pass or fail mark. We use a SWOT analysis - a 360 degrees framework to show exactly where ${sName} stands today. SWOT stands for four things - let me explain each one.`}
                        </div>

                        <div className="swot-grid">
                          <div className="swot-box swot-strength">
                            <h4>S - Strength</h4>
                            <p>Chapters scoring 70% or above.</p>
                            <div className="swot-zone-title">Chapters in this zone:</div>
                            <div className="swot-list">
                              {swot.strength.length > 0 ? (
                                swot.strength.map((x) => <div key={`s-${x.chapter}`}>- {x.label}</div>)
                              ) : (
                                <div>- No chapters in this zone yet</div>
                              )}
                            </div>
                          </div>

                          <div className="swot-box swot-opportunity">
                            <h4>O - Opportunity</h4>
                            <p>Chapters scoring 40% to 69%.</p>
                            <div className="swot-zone-title">Chapters in this zone:</div>
                            <div className="swot-list">
                              {swot.opportunity.length > 0 ? (
                                swot.opportunity.map((x) => <div key={`o-${x.chapter}`}>- {x.label}</div>)
                              ) : (
                                <div>- No chapters in this zone yet</div>
                              )}
                            </div>
                          </div>

                          <div className="swot-box swot-weakness">
                            <h4>W - Weakness</h4>
                            <p>Chapters scoring below 40%.</p>
                            <div className="swot-zone-title">Chapters in this zone:</div>
                            <div className="swot-list">
                              {swot.weakness.length > 0 ? (
                                swot.weakness.map((x) => <div key={`w-${x.chapter}`}>- {x.label}</div>)
                              ) : (
                                <div>- No chapters in this zone</div>
                              )}
                            </div>
                          </div>

<<<<<<< HEAD:frontend/src/pages/Teacherpanel.jsx
                          {/* P1 P2 P3 */}
                          {(() => {
                            const chapterSectionMap = buildChapterSectionMap(
                              report.questions || [],
                            );
                            const swot = buildSwotBuckets(
                              report.chapter_scores || [],
                              chapterSectionMap,
                            );
                            const skillRows = buildSkillRows(
                              report.questions || [],
                            );
                            const studentName = activeStudent?.name || "Student";
                            const firstName = studentName.split(" ")[0] || "Student";
                            const skillInsight = buildSkillInsight(firstName, skillRows);
                            const classNum = Number(activeStudent?.class);
                            const hasClassNum = Number.isFinite(classNum) && classNum > 0;
                            const currentClass = hasClassNum
                              ? `Class ${classNum}`
                              : "current class";
                            const nextClass = hasClassNum
                              ? `Class ${classNum + 1}`
                              : "next class";
                            const strengthCount = swot.strength.length;
                            const priorityCount = swot.weakness.length;

                            return (
                              <>
                                <div className="report-block">
                                  <div className="block-chip">BLOCK 1 - SWOT</div>
                                  <div className="block-title">What is SWOT Analysis?</div>
                                  <div className="block-desc">
                                    This section explains chapter-wise placement in four zones so
                                    parents clearly understand transition readiness.
                                  </div>
                                  <div className="guide-quote">
                                    {`We don't just give a pass or fail mark. We use a SWOT analysis - a 360 degrees framework to show exactly where ${firstName} stands today. SWOT stands for four things - let me explain each one.`}
                                  </div>

                                  <div className="swot-grid">
                                    <div className="swot-box swot-strength">
                                      <h4>S - Strength</h4>
                                      <p>Chapters scoring 70% or above.</p>
                                      <div className="swot-zone-title">Chapters in this zone:</div>
                                      <div className="swot-list">
                                        {swot.strength.length > 0 ? (
                                          swot.strength.map((x) => (
                                            <div key={`s-${x.chapter}`}>- {x.label}</div>
                                          ))
                                        ) : (
                                          <div>- No chapters in this zone yet</div>
                                        )}
                                      </div>
                                    </div>

                                    <div className="swot-box swot-opportunity">
                                      <h4>O - Opportunity</h4>
                                      <p>Chapters scoring 40% to 69%.</p>
                                      <div className="swot-zone-title">Chapters in this zone:</div>
                                      <div className="swot-list">
                                        {swot.opportunity.length > 0 ? (
                                          swot.opportunity.map((x) => (
                                            <div key={`o-${x.chapter}`}>- {x.label}</div>
                                          ))
                                        ) : (
                                          <div>- No chapters in this zone yet</div>
                                        )}
                                      </div>
                                    </div>

                                    <div className="swot-box swot-weakness">
                                      <h4>W - Weakness</h4>
                                      <p>Chapters scoring below 40%.</p>
                                      <div className="swot-zone-title">Chapters in this zone:</div>
                                      <div className="swot-list">
                                        {swot.weakness.length > 0 ? (
                                          swot.weakness.map((x) => (
                                            <div key={`w-${x.chapter}`}>- {x.label}</div>
                                          ))
                                        ) : (
                                          <div>- No chapters in this zone</div>
                                        )}
                                      </div>
                                    </div>

                                    <div className="swot-box swot-threat">
                                      <h4>T - Threat</h4>
                                      <p>Higher-grade concepts directly at risk from weak areas.</p>
                                      <div className="swot-zone-title">Likely consequences:</div>
                                      <div className="swot-list">
                                        {swot.threats.length > 0 ? (
                                          swot.threats.map((t, idx) => (
                                            <div key={`t-${idx}`}>- {t}</div>
                                          ))
                                        ) : (
                                          <div>- No immediate threat pattern detected</div>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="guide-quote" style={{ marginTop: "12px", marginBottom: 0 }}>
                                    {`Think of it like a building. If the foundation (${currentClass}) has cracks, we cannot safely build the first floor (${nextClass}) on top of it. Right now ${firstName} has ${strengthCount} Strength chapters and ${priorityCount} Priority chapters. That is why we are having this conversation today.`}
                                  </div>
                                </div>

                                <div className="report-block">
                                  <div className="block-chip">BLOCK 2 - SKILL</div>
                                  <div className="block-title">What is Skill Analysis? (P1 / P2 / P3)</div>
                                  <div className="block-desc">
                                    This section shows why errors happened, not just how many.
                                    The same score can come from very different skill gaps.
                                  </div>
                                  <div className="guide-quote">
                                    {`Every question was tagged with one of three skill levels - P1, P2 or P3. This tells us not just what ${firstName} got wrong, but why. That is far more useful for planning ${firstName}'s revision.`}
                                  </div>

                                  <div className="skill-level-wrap">
                                    <div className="skill-level-card skill-c1">
                                      <div className="skill-level-top">
                                        <div className="skill-code">P1</div>
                                        <div className="skill-head">
                                          Conceptual clarity - understanding why
                                        </div>
                                      </div>
                                      <div className="skill-copy">
                                        Can the child recall concepts, classify, and identify core
                                        ideas before solving?
                                      </div>
                                    </div>

                                    <div className="skill-level-card skill-c2">
                                      <div className="skill-level-top">
                                        <div className="skill-code">P2</div>
                                        <div className="skill-head">
                                          Procedural accuracy - executing steps correctly
                                        </div>
                                      </div>
                                      <div className="skill-copy">
                                        Can the child apply methods in sequence without missing
                                        required steps?
                                      </div>
                                    </div>

                                    <div className="skill-level-card skill-c3">
                                      <div className="skill-level-top">
                                        <div className="skill-code">P3</div>
                                        <div className="skill-head">
                                          Application - solving new, real-world problems
                                        </div>
                                      </div>
                                      <div className="skill-copy">
                                        Can the child transfer concepts to unfamiliar situations and
                                        HOTS-style questions?
                                      </div>
                                    </div>
                                  </div>

                                  <div className="skill-bars">
                                    <h5>
                                      {(activeStudent?.name || "Student") +
                                        "'s skill breakdown - Mathematics and Science"}
                                    </h5>
                                    {skillRows.map((row, idx) => (
                                      <div className="skill-row" key={`sr-${idx}`}>
                                        <div className="skill-tag">{row.code}</div>
                                        <div className="skill-bar-main">
                                          <div className="skill-label">{row.title}</div>
                                          <div className="skill-track">
                                            <div
                                              className="skill-fill"
                                              style={{
                                                width: `${row.pct}%`,
                                                background: row.color,
                                              }}
                                            />
                                          </div>
                                        </div>
                                        <div className="skill-pct">{row.pct}%</div>
                                      </div>
                                    ))}
                                  </div>

                                  <div className="guide-quote" style={{ marginTop: "12px", marginBottom: 0 }}>
                                    {`"${skillInsight}"`}
                                  </div>
                                </div>
                              </>
                            );
                          })()}
=======
                          <div className="swot-box swot-threat">
                            <h4>T - Threat</h4>
                            <p>Higher-grade concepts directly at risk from weak areas.</p>
                            <div className="swot-zone-title">Likely consequences:</div>
                            <div className="swot-list">
                              {swot.threats.length > 0 ? (
                                swot.threats.map((t, idx) => <div key={`t-${idx}`}>- {t}</div>)
                              ) : (
                                <div>- No immediate threat pattern detected</div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="guide-quote" style={{ marginTop: "12px", marginBottom: 0 }}>
                          {`Think of it like a building. If the foundation (${currentClass}) has cracks, we cannot safely build the first floor (${nextClass}) on top of it. Right now ${sName} has ${strengthCount} Strength chapters and ${priorityCount} Priority chapters. That is why we are having this conversation today.`}
                        </div>
>>>>>>> 758975a0a9f90541b73b5e672ba08ef2293fcb58:frontend/src/pages/Teacherpanel.jsx
                      </div>
                    </div>
                  </div>

                  {!activeStudent.test_id ? (
                    <div className="flex flex-col items-center justify-center min-h-[200px] gap-3 text-center">
                      <div className="text-4xl">📭</div>
                      <h2 className="text-lg font-bold text-[#0d1f3c]">
                        No test submitted
                      </h2>
                      <p className="text-[#888] text-sm font-['Inter',sans-serif]">
                        This student hasn't taken a test yet.
                      </p>
                    </div>
                  ) : (
                    report &&
                    (() => {
                      // 👇 ========================================================
                      // DYNAMIC RECALCULATION ENGINE (Overrides bad DB summary tables)
                      // ========================================================
                      let activeReport = { ...report };

                      if (report.questions && report.questions.length > 0) {
                        const qs = report.questions;
                        const totalMax = qs.length;
                        let totalScore = 0;
                        let mathMax = 0,
                          mathScore = 0;
                        let sciMax = 0,
                          sciScore = 0;
                        let skipped = 0;

                        const bMap = {};
                        const cMap = {};
                        let p1m = 0,
                          p1s = 0,
                          p2m = 0,
                          p2s = 0,
                          p3m = 0,
                          p3s = 0;

                        qs.forEach((q) => {
                          const ok = parseInt(q.is_correct) === 1;
                          if (ok) totalScore++;
                          if (!q.selected_option) skipped++;

                          // Subjects
                          const sec = (q.section || "").toLowerCase();
                          if (sec.includes("math")) {
                            mathMax++;
                            if (ok) mathScore++;
                          } else if (sec.includes("sci")) {
                            sciMax++;
                            if (ok) sciScore++;
                          }

                          // Bloom
                          const lvl = (
                            q.bloom_level || "UNKNOWN"
                          ).toUpperCase();
                          if (!bMap[lvl])
                            bMap[lvl] = { max_score: 0, score: 0 };
                          bMap[lvl].max_score++;
                          if (ok) bMap[lvl].score++;

                          // Chapters
                          const ch = q.chapter || "Unknown";
                          if (!cMap[ch])
                            cMap[ch] = {
                              chapter: ch,
                              subject: q.section,
                              swot_category: "",
                              max_score: 0,
                              score: 0,
                              risk_if_weak: q.risk_if_weak || "",
                            };
                          cMap[ch].max_score++;
                          if (ok) cMap[ch].score++;

                          // Skills
                          const sk = (q.skill_type || "").toUpperCase();
                          if (sk.includes("P1") || sk.includes("CONCEPT")) {
                            p1m++;
                            if (ok) p1s++;
                          } else if (
                            sk.includes("P2") ||
                            sk.includes("PROCED")
                          ) {
                            p2m++;
                            if (ok) p2s++;
                          } else if (
                            sk.includes("P3") ||
                            sk.includes("APPLIC")
                          ) {
                            p3m++;
                            if (ok) p3s++;
                          }
                        });

                        // Build fresh Bloom Array
                        const bloom_scores = Object.keys(bMap).map((k) => ({
                          bloom_level: k,
                          score: bMap[k].score,
                          max_score: bMap[k].max_score,
                          pct:
                            bMap[k].max_score > 0
                              ? (
                                  (bMap[k].score / bMap[k].max_score) *
                                  100
                                ).toFixed(2)
                              : 0,
                        }));

                        // Build fresh Chapter Array
                        const chapter_scores = Object.values(cMap)
                          .map((c) => {
                            const calcPct =
                              c.max_score > 0
                                ? ((c.score / c.max_score) * 100).toFixed(2)
                                : 0;
                            let swotCat = "weakness";
                            if (calcPct >= 70) swotCat = "strength";
                            else if (calcPct >= 40) swotCat = "opportunity";

                            return {
                              ...c,
                              pct: calcPct,
                              swot_category: swotCat,
                            };
                          })
                          .sort((a, b) => b.pct - a.pct);

                        // Overwrite bad data
                        activeReport = {
                          ...activeReport,
                          total_score: totalScore,
                          max_score: totalMax,
                          overall_pct:
                            totalMax > 0
                              ? ((totalScore / totalMax) * 100).toFixed(2)
                              : 0,
                          math_score: mathScore,
                          math_max: mathMax,
                          math_pct:
                            mathMax > 0
                              ? Math.round((mathScore / mathMax) * 100)
                              : 0,
                          sci_score: sciScore,
                          sci_max: sciMax,
                          sci_pct:
                            sciMax > 0
                              ? Math.round((sciScore / sciMax) * 100)
                              : 0,
                          bloom_scores: bloom_scores,
                          chapter_scores: chapter_scores,
                          p1: p1m > 0 ? Math.round((p1s / p1m) * 100) : 0,
                          p2: p2m > 0 ? Math.round((p2s / p2m) * 100) : 0,
                          p3: p3m > 0 ? Math.round((p3s / p3m) * 100) : 0,
                          correct: totalScore,
                          unanswered: skipped,
                          wrong: totalMax - totalScore - skipped,
                        };
                      }
                      // ========================================================

                      const perf = getPerf(activeReport.overall_pct);
                      const mathSt = getStatus(activeReport.math_pct);
                      const sciSt = getStatus(activeReport.sci_pct);
                      const sName = activeStudent.name.split(" ")[0];
                      const tClass =
                        activeReport.test_class || activeStudent.class || "10";

                      const chapterSectionMap = buildChapterSectionMap(
                        activeReport.questions || [],
                      );
                      const swot = buildSwotBuckets(
                        activeReport.chapter_scores || [],
                        chapterSectionMap,
                      );
                      const skillRows = buildSkillRows(activeReport);
                      const skillInsight = buildSkillInsight(
                        sName,
                        activeReport,
                      );

                      const classNum = Number(activeStudent.class);
                      const hasClassNum =
                        Number.isFinite(classNum) && classNum > 0;
                      const currentClass = hasClassNum
                        ? `Class ${classNum}`
                        : "current class";
                      const nextClass = hasClassNum
                        ? `Class ${classNum + 1}`
                        : "next class";

                      const strengthCount = swot.strength.length;
                      const priorityCount = swot.weakness.length;

                      const l1Pct =
                        activeReport.bloom_scores?.find((b) =>
                          b.bloom_level.toUpperCase().includes("L1"),
                        )?.pct || 0;
                      const l2Score =
                        activeReport.bloom_scores?.find((b) =>
                          b.bloom_level.toUpperCase().includes("L2"),
                        )?.score || 0;

                      return (
                        <>
                          <div className="flex items-center gap-2 mt-9 mb-5 text-[15px] md:text-base font-extrabold text-[#185FA5]">
                            <span>📊</span>
                            <span>Overall Score</span>
                          </div>

                          {/* Hero */}
                          <div className="anim-fade-up anim-d-50 bg-[linear-gradient(135deg,#1D9E75_0%,#185FA5_100%)] rounded-3xl p-6 md:p-8 mb-6 shadow-[0_8px_32px_rgba(24,95,165,0.2)] flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-white/80 font-['Inter',sans-serif]">
                                Diagnostic Assessment Result
                              </span>
                              <span className="text-[20px] md:text-[22px] font-extrabold text-white">
                                {sName}'s Full Report
                              </span>
                              <span className="text-xs text-white/70 font-['Inter',sans-serif]">
                                Complete Teacher View — All Sections Unlocked
                              </span>
                            </div>
                            <div className="flex items-center justify-between md:justify-end gap-5 md:flex-shrink-0">
                              <div className="text-left md:text-right">
                                <div className="text-sm font-bold text-white">
                                  {perf.label}
                                </div>
                                <div className="text-xs text-white/70">
                                  Performance
                                </div>
                              </div>
                              <div className="w-24 h-24 rounded-full bg-white/15 border-[3px] border-white/40 flex flex-col items-center justify-center shrink-0">
                                <span className="text-[28px] font-extrabold text-white leading-none">
                                  {activeReport.total_score}
                                </span>
                                <span className="text-xs text-white/70 font-['DM_Sans',sans-serif]">
                                  / {activeReport.max_score}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Subjects */}
                          <div className="flex items-center gap-2 mt-9 mb-5 text-[15px] md:text-base font-extrabold text-[#185FA5]">
                            <span>📚</span>
                            <span>Subject-wise Score</span>
                          </div>
                          <div className="anim-fade-up anim-d-80 grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="bg-white rounded-[18px] p-6 shadow-[0_4px_16px_rgba(24,95,165,0.05)] border border-[#e2edf8]">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 text-[15px] font-bold text-[#0d1f3c]">
                                  <div className="w-7 h-7 rounded-[7px] bg-[#EEF4FF] flex items-center justify-center text-sm">
                                    📐
                                  </div>
                                  Mathematics
                                </div>
                                <span className="text-xl font-extrabold text-[#185FA5]">
                                  {activeReport.math_pct}%
                                </span>
                              </div>
                              <div className="h-2 bg-[#f0f4fb] rounded-full my-3 overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-[width] duration-1000 ease-out bg-[linear-gradient(90deg,#185FA5,#1D9E75)]"
                                  style={{ width: `${activeReport.math_pct}%` }}
                                />
                              </div>
                              <div className="flex items-center justify-between text-[11px] text-[#aaa] font-['DM_Sans',sans-serif]">
                                <span>
                                  {activeReport.math_score} /{" "}
                                  {activeReport.math_max} marks
                                </span>
                                <span
                                  className="text-[11px] font-semibold px-2.5 py-[3px] rounded-full"
                                  style={{
                                    background: mathSt.bg,
                                    color: mathSt.color,
                                  }}>
                                  {mathSt.label}
                                </span>
                              </div>
                            </div>
                            <div className="bg-white rounded-[18px] p-6 shadow-[0_4px_16px_rgba(24,95,165,0.05)] border border-[#e2edf8]">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 text-[15px] font-bold text-[#0d1f3c]">
                                  <div className="w-7 h-7 rounded-[7px] bg-[#e6f7f1] flex items-center justify-center text-sm">
                                    🔬
                                  </div>
                                  Science
                                </div>
                                <span className="text-xl font-extrabold text-[#1D9E75]">
                                  {activeReport.sci_pct}%
                                </span>
                              </div>
                              <div className="h-2 bg-[#f0f4fb] rounded-full my-3 overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-[width] duration-1000 ease-out bg-[linear-gradient(90deg,#1D9E75,#185FA5)]"
                                  style={{ width: `${activeReport.sci_pct}%` }}
                                />
                              </div>
                              <div className="flex items-center justify-between text-[11px] text-[#aaa] font-['DM_Sans',sans-serif]">
                                <span>
                                  {activeReport.sci_score} /{" "}
                                  {activeReport.sci_max} marks
                                </span>
                                <span
                                  className="text-[11px] font-semibold px-2.5 py-[3px] rounded-full"
                                  style={{
                                    background: sciSt.bg,
                                    color: sciSt.color,
                                  }}>
                                  {sciSt.label}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Stats — 2x2 on mobile, 4 across desktop */}
                          <div className="anim-fade-up anim-d-100 grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                            {[
                              {
                                i: "✅",
                                v: activeReport.correct,
                                l: "Correct",
                                c: "#1D9E75",
                              },
                              {
                                i: "❌",
                                v: activeReport.wrong,
                                l: "Wrong",
                                c: "#e24b4a",
                              },
                              {
                                i: "⬜",
                                v: activeReport.unanswered,
                                l: "Skipped",
                                c: "#aaa",
                              },
                              {
                                i: "🎯",
                                v: `${activeReport.overall_pct}%`,
                                l: "Overall",
                                c: "#185FA5",
                              },
                            ].map((st, i) => (
                              <div
                                key={i}
                                className="bg-white rounded-2xl p-4 md:p-5 text-center border border-[#e2edf8]">
                                <div className="text-lg mb-1">{st.i}</div>
                                <div
                                  className="text-[20px] md:text-[22px] font-extrabold mt-1.5"
                                  style={{ color: st.c }}>
                                  {st.v}
                                </div>
                                <div className="text-[10px] text-[#aaa] uppercase tracking-wide font-['DM_Sans',sans-serif] mt-0.5">
                                  {st.l}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* BLOCK 1: SWOT */}
                          <div className="anim-fade-up anim-d-120 bg-white border border-[#e2edf8] rounded-[20px] p-5 md:p-10 mb-6 shadow-[0_4px_24px_rgba(24,95,165,0.06)]">
                            <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-white bg-[#1D9E75] px-2.5 py-1 rounded-full uppercase tracking-wider mb-3 font-['DM_Sans',sans-serif]">
                              BLOCK 1 - SWOT
                            </div>
                            <div className="text-[20px] md:text-2xl font-extrabold text-[#0d1f3c] mb-2 leading-tight">
                              What is SWOT Analysis?
                            </div>
                            <div className="text-[13px] md:text-sm text-[#444] leading-relaxed font-['Inter',sans-serif] mb-5">
                              This section explains chapter-wise placement in
                              four zones so parents clearly understand
                              transition readiness.
                            </div>
                            <div className="bg-[#f2f1ff] border-l-4 border-[#7c83fd] text-[#4a4f8a] rounded-r-lg px-5 py-4 italic text-[13px] font-['Inter',sans-serif] leading-relaxed mb-6">
                              {`We don't just give a pass or fail mark. We use a SWOT analysis - a 360 degrees framework to show exactly where ${sName} stands today. SWOT stands for four things - let me explain each one.`}
                            </div>

                            {/* SWOT 2x2 grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <SwotBox
                                tone="strength"
                                title="S - Strength"
                                desc="Chapters scoring 70% or above."
                                items={swot.strength}
                              />
                              <SwotBox
                                tone="opportunity"
                                title="O - Opportunity"
                                desc="Chapters scoring 40% to 69%."
                                items={swot.opportunity}
                              />
                              <SwotBox
                                tone="weakness"
                                title="W - Weakness"
                                desc="Chapters scoring below 40%."
                                items={swot.weakness}
                                emptyMsg="No priority chapters!"
                                emptyTone="green"
                              />
                              <SwotBox
                                tone="threat"
                                title="T - Threat"
                                desc="Higher-grade concepts directly at risk from weak areas."
                                items={swot.threats.map((t) => ({
                                  chapter: t,
                                  label: t,
                                }))}
                                zoneTitle="Likely consequences:"
                                emptyMsg="No immediate threat pattern detected"
                                emptyTone="green"
                              />
                            </div>

                            <div className="bg-[#f2f1ff] border-l-4 border-[#7c83fd] text-[#4a4f8a] rounded-r-lg px-5 py-4 italic text-[13px] font-['Inter',sans-serif] leading-relaxed mt-3">
                              {`Think of it like a building. If the foundation (${currentClass}) has cracks, we cannot safely build the first floor (${nextClass}) on top of it. Right now ${sName} has ${strengthCount} Strength chapters and ${priorityCount} Priority chapters. That is why we are having this conversation today.`}
                            </div>
                          </div>

                          {/* BLOCK 2: SKILL */}
                          <div className="anim-fade-up anim-d-120 bg-white border border-[#e2edf8] rounded-[20px] p-5 md:p-10 mb-6 shadow-[0_4px_24px_rgba(24,95,165,0.06)]">
                            <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-white bg-[#1D9E75] px-2.5 py-1 rounded-full uppercase tracking-wider mb-3 font-['DM_Sans',sans-serif]">
                              BLOCK 2 - SKILL
                            </div>
                            <div className="text-[20px] md:text-2xl font-extrabold text-[#0d1f3c] mb-2 leading-tight">
                              What is Skill Analysis? (P1 / P2 / P3)
                            </div>
                            <div className="text-[13px] md:text-sm text-[#444] leading-relaxed font-['Inter',sans-serif] mb-5">
                              This section shows why errors happened, not just
                              how many. The same score can come from very
                              different skill gaps.
                            </div>
                            <div className="bg-[#f2f1ff] border-l-4 border-[#7c83fd] text-[#4a4f8a] rounded-r-lg px-5 py-4 italic text-[13px] font-['Inter',sans-serif] leading-relaxed mb-6">
                              {`Every question was tagged with one of three skill levels - P1, P2 or P3. This tells us not just what ${sName} got wrong, but why. That is far more useful for planning ${sName}'s revision.`}
                            </div>

                            <div className="grid gap-3">
                              <SkillCard
                                tone="c1"
                                code="P1"
                                title="Conceptual clarity - understanding why"
                                desc="Can the child recall concepts, classify, and identify core ideas before solving?"
                              />
                              <SkillCard
                                tone="c2"
                                code="P2"
                                title="Procedural accuracy - executing steps correctly"
                                desc="Can the child apply methods in sequence without missing required steps?"
                              />
                              <SkillCard
                                tone="c3"
                                code="P3"
                                title="Application - solving new, real-world problems"
                                desc="Can the child transfer concepts to unfamiliar situations and HOTS-style questions?"
                              />
                            </div>

                            <div className="mt-6 bg-white border border-[#e2edf8] rounded-xl p-5 md:p-6">
                              <h5 className="text-[15px] text-[#0d1f3c] mb-4 font-extrabold">{`${sName}'s skill breakdown - Mathematics and Science`}</h5>
                              {skillRows.map((row, idx) => (
                                <div
                                  key={`sr-${idx}`}
                                  className="grid grid-cols-[44px_1fr_44px] md:grid-cols-[48px_1fr_48px] gap-3 items-center mb-3">
                                  <div className="bg-[#eef2f7] text-[#566074] rounded-full text-[10px] md:text-[11px] font-extrabold text-center py-1 font-['DM_Sans',sans-serif]">
                                    {row.code}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-[11.5px] md:text-xs font-semibold text-[#333] mb-1.5 font-['Inter',sans-serif] truncate">
                                      {row.title}
                                    </div>
                                    <div className="h-3 rounded-full bg-[#eef2f7] overflow-hidden">
                                      <div
                                        className="h-full rounded-full transition-[width] duration-1000"
                                        style={{
                                          width: `${row.pct}%`,
                                          background: row.color,
                                        }}
                                      />
                                    </div>
                                  </div>
                                  <div className="text-right text-[12px] md:text-[13px] font-bold text-[#333]">
                                    {row.pct}%
                                  </div>
                                </div>
                              ))}
                            </div>

<<<<<<< HEAD:frontend/src/pages/TeacherPanel.jsx
                            <div className="bg-[#f2f1ff] border-l-4 border-[#7c83fd] text-[#4a4f8a] rounded-r-lg px-5 py-4 italic text-[13px] font-['Inter',sans-serif] leading-relaxed mt-3">
                              {`"${skillInsight}"`}
=======
                            {BLOOM_LEVELS.slice(0, 5).map((levelObj, i) => {
                              const dbScore = report.bloom_scores?.find(b => b.bloom_level.toUpperCase().includes(levelObj.level));
                              const pct = dbScore ? parseFloat(dbScore.pct) : 0;

                              return (
                                <div className="bloom-bar-row" key={i}>
                                  <div className="bloom-bar-label">{levelObj.level} {levelObj.name}</div>
                                  <div className="bloom-bar-fill" style={{ width: `${pct}%`, background: levelObj.barColor }}>
                                    {pct}%
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <div className="chart-title" style={{marginTop: '40px'}}>▌ WHAT TO DO BASED ON BLOOM'S RESULTS</div>
                          <div style={{overflowX: 'auto'}}>
                            <table className="report-table" style={{marginBottom: 0}}>
                              <thead>
                                <tr>
                                  <th style={{width: '20%'}}>Condition</th>
                                  <th style={{width: '25%', textAlign:'left'}}>What it means</th>
                                  <th style={{width: '55%', textAlign:'left'}}>Action for Teacher & Parent</th>
                                </tr>
                              </thead>
                              <tbody>
                                {BLOOM_LEVELS.slice(0, 5).map((levelObj, i) => {
                                  const dbScore = report.bloom_scores?.find(b => b.bloom_level.toUpperCase().includes(levelObj.level));
                                  const pct = dbScore ? dbScore.pct : 0;
                                  const actionMeaningMap = {
                                    'L1': 'Memory gap',
                                    'L2': 'Understanding gap',
                                    'L3': 'Cannot solve',
                                    'L4': 'Cannot analyze',
                                    'L5': 'Cannot evaluate'
                                  };
>>>>>>> 78d902e76bd300f799ee02d583faf8981e7ef0d1:frontend/src/pages/TeacherPanel.jsx

                                  return (
                                    <tr key={i}>
                                      <td style={{fontWeight: '800', color: pct < 60 ? '#e24b4a' : '#1D9E75'}}>
                                        {levelObj.level} &lt; 60%
                                      </td>
                                      <td className="desc-text" style={{fontWeight:'600'}}>
                                        {actionMeaningMap[levelObj.level]}
                                      </td>
                                      <td className="desc-text" style={{fontSize:'13px'}}>
                                        {levelObj.action}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ) : (
                        <div className="bloom-container" style={{textAlign:'center', color:'#888'}}>
                          No Bloom's Taxonomy data available for this test.
                        </div>
                      )}

                      {/* 📈 EXACT MATCH: CHAPTER ANALYSIS */}
                      <div className="eyebrow">📈 Chapter-wise Analysis</div>
                      {report.chapter_scores?.length > 0 ? (
                        <div className="chapter-container">
                          <div className="report-header-text">Chapter-wise Analysis — All {report.chapter_scores.length} Chapters</div>
                          <div className="report-desc-text">
                            Walk through the full chapter breakdown so the parent can see exactly where {sName} stands in every topic.
                          </div>

                          <div className="purple-quote">
                            "We tested {report.chapter_scores.length} chapters from the Class {tClass} syllabus. Each chapter is scored and placed in one of three bands. Let me walk you through all of them so you have the complete picture."
                          </div>

                          <div style={{overflowX: 'auto'}}>
                            <table className="report-table">
                              <thead>
                                <tr>
                                  <th style={{width:'25%'}}>Chapter</th>
                                  <th style={{width:'15%'}}>Subject</th>
                                  <th style={{width:'10%'}}>Marks</th>
                                  <th style={{width:'10%'}}>Score %</th>
                                  <th style={{width:'15%'}}>Status</th>
                                  <th style={{width:'25%', textAlign:'left'}}>Class {tClass} Risk if Weak</th>
                                </tr>
                              </thead>
                              <tbody>
                                {report.chapter_scores.map((ch, i) => {
                                  const status = getChapterStatus(ch.pct);
                                  let subject = ch.subject;
                                  let risk = ch.risk_if_weak;
                                  
                                  if (!subject || !risk) {
                                    const qMatch = report.questions?.find(q => q.chapter === ch.chapter);
                                    if (qMatch) {
                                      if (!subject) subject = qMatch.section;
                                      if (!risk) risk = qMatch.risk_if_weak;
                                    }
                                  }
                                  
                                  return (
                                    <tr key={i}>
                                      <td className="left-align">{ch.chapter}</td>
                                      <td style={{fontWeight: '600'}}>{subject || "N/A"}</td>
                                      <td style={{fontWeight: '600'}}>{ch.score} / {ch.max_score}</td>
                                      <td style={{fontWeight: '800', color: status.color}}>{ch.pct}%</td>
                                      <td>
                                        <span className="status-badge" style={{background: status.bg, color: status.color}}>
                                          {status.label}
                                        </span>
                                      </td>
                                      <td className="desc-text" style={{fontSize:'12px'}}>{risk || `Class ${tClass} foundations`}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ) : (
                        <div className="chapter-container" style={{textAlign:'center', color:'#888'}}>
                          No Chapter Analysis data available for this test.
                        </div>
                      )}

                      {/* 📋 EXACT MATCH: SCORE ENTRY (RAW QUESTION DATA) */}
                      <div className="eyebrow">📋 Score Entry / Question Data</div>
                      <div className="q-card">
                        <div className="report-header-text">Raw Question Analysis</div>
                        <div className="report-desc-text">
                          Detailed question-by-question breakdown mapped to skills and cognitive levels.
                        </div>
                        <div style={{overflowX: 'auto'}}>
                          <table className="report-table" style={{minWidth: '750px'}}>
                            <thead>
                              <tr>
                                <th>Q No.</th>
                                <th>Subject</th>
                                <th>Chapter</th>
                                <th>Parameter / Skill</th>
                                <th>Bloom's</th>
                                <th>Correct Ans</th>
                                <th>Student Ans</th>
                                <th>Marks / Result</th>
                              </tr>
                            </thead>
                            <tbody>
                              {report.questions?.map((q, i) => {
                                const ok = parseInt(q.is_correct) === 1;
                                const sk = !q.selected_option;
                                return (
                                  <tr key={q.question_id}>
                                    <td style={{fontWeight: '800', color: '#185FA5'}}>Q{i + 1}</td>
                                    <td style={{fontWeight: '600', color: '#444'}}>{q.section}</td>
                                    <td className="desc-text" style={{fontWeight: '600'}}>{q.chapter}</td>
                                    <td className="desc-text">{q.skill_type}</td>
                                    <td style={{fontWeight: '600'}}>{q.bloom_level}</td>
                                    <td style={{fontWeight: '700', color: '#1D9E75'}}>{q.correct?.toUpperCase()}</td>
                                    <td style={{fontWeight: '700', color: sk ? '#aaa' : ok ? '#1D9E75' : '#e24b4a'}}>
                                      {sk ? 'Skipped' : q.selected_option?.toUpperCase()}
                                    </td>
                                    <td style={{fontWeight: '800', color: ok ? '#1D9E75' : '#e24b4a'}}>
                                      {ok ? '1' : '0'}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* 📝 EXACT MATCH: 4-WEEK ACTION PLAN */}
                      {report.action_plan && (
                        <>
                          <div className="eyebrow">📝 Next Steps</div>
                          <div className="action-card">
                            <div className="report-header-text">Recommended 4-Week Action Plan</div>
                            <div className="report-desc-text">
                              Based on the data above, here is the exact roadmap to get {sName} ready for Class {tClass}.
>>>>>>> 758975a0a9f90541b73b5e672ba08ef2293fcb58:frontend/src/pages/Teacherpanel.jsx
                            </div>
                          </div>

                          {/* BLOOM */}
                          <div className="flex items-center gap-2 mt-9 mb-5 text-[15px] md:text-base font-extrabold text-[#185FA5]">
                            <span>🌸</span>
                            <span>
                              Bloom's Taxonomy — Cognitive Level Analysis
                            </span>
                          </div>
                          {activeReport.bloom_scores?.length > 0 ? (
                            <div className="anim-fade-up anim-d-160 bg-white rounded-[20px] p-5 md:p-10 shadow-[0_4px_24px_rgba(24,95,165,0.06)] border border-[#e2edf8] mb-8">
                              <div className="text-[16px] md:text-xl font-extrabold text-[#0d1f3c] mb-3 uppercase">
                                BLOOM'S TAXONOMY — COGNITIVE LEVEL ANALYSIS
                              </div>
                              <div className="text-[13px] md:text-sm text-[#444] mb-6 leading-relaxed font-['Inter',sans-serif]">
                                Bloom's Taxonomy measures HOW DEEPLY a student
                                understands — not just WHAT they know. 6 levels
                                from simple recall to creative thinking. This
                                report shows cognitive gaps.
                              </div>

                              <div className="font-extrabold text-[15px] md:text-base mb-5 text-[#0d1f3c]">
                                ▌ THE SIX LEVELS — Explained for Parents
                              </div>
                              <div className="overflow-x-auto -mx-2 px-2">
                                <table className="w-full border-collapse font-['Inter',sans-serif] text-[12px] md:text-[13.5px] mb-8 min-w-[700px]">
                                  <thead>
                                    <tr>
                                      <th className="bg-[#234674] text-white font-semibold px-3 py-3 text-center border border-[#234674] w-[10%]">
                                        Level
                                      </th>
                                      <th className="bg-[#234674] text-white font-semibold px-3 py-3 text-center border border-[#234674] w-[15%]">
                                        Name
                                      </th>
                                      <th className="bg-[#234674] text-white font-semibold px-3 py-3 text-center border border-[#234674] w-[30%]">
                                        Meaning
                                      </th>
                                      <th className="bg-[#234674] text-white font-semibold px-3 py-3 text-center border border-[#234674] w-[25%]">
                                        Example Q
                                      </th>
                                      <th className="bg-[#234674] text-white font-semibold px-3 py-3 text-center border border-[#234674] w-[5%]">
                                        Max Marks
                                      </th>
                                      <th className="bg-[#234674] text-white font-semibold px-3 py-3 text-center border border-[#234674] w-[5%]">
                                        Scored
                                      </th>
                                      <th className="bg-[#234674] text-white font-semibold px-3 py-3 text-center border border-[#234674] w-[10%]">
                                        Score %
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {BLOOM_LEVELS.map((levelObj, i) => {
                                      const dbScore =
                                        activeReport.bloom_scores?.find((b) =>
                                          b.bloom_level
                                            .toUpperCase()
                                            .includes(levelObj.level),
                                        );
                                      const maxMarks = dbScore
                                        ? dbScore.max_score
                                        : levelObj.level === "L6"
                                          ? "-"
                                          : 0;
                                      const scored = dbScore
                                        ? dbScore.score
                                        : levelObj.level === "L6"
                                          ? "N/A"
                                          : 0;
                                      const pct = dbScore
                                        ? dbScore.pct
                                        : levelObj.level === "L6"
                                          ? "N/A"
                                          : 0;
                                      return (
                                        <tr key={i}>
                                          <td className="px-3 py-3 border border-[#e2edf8] text-center font-bold">
                                            {levelObj.level}
                                          </td>
                                          <td className="px-3 py-3 border border-[#e2edf8] text-left font-semibold text-[#185FA5]">
                                            {levelObj.name}
                                          </td>
                                          <td className="px-3 py-3 border border-[#e2edf8] text-left text-[#555]">
                                            {levelObj.meaning}
                                          </td>
                                          <td className="px-3 py-3 border border-[#e2edf8] text-left text-[#555] italic text-[12px]">
                                            {levelObj.example}
                                          </td>
                                          <td className="px-3 py-3 border border-[#e2edf8] text-center font-semibold">
                                            {maxMarks}
                                          </td>
                                          <td className="px-3 py-3 border border-[#e2edf8] text-center font-semibold">
                                            {scored}
                                          </td>
                                          <td
                                            className="px-3 py-3 border border-[#e2edf8] text-center font-extrabold"
                                            style={{
                                              color:
                                                pct !== "N/A" && pct >= 50
                                                  ? "#1D9E75"
                                                  : "#e24b4a",
                                            }}>
                                            {pct !== "N/A" ? `${pct}%` : pct}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>

                              <div className="font-extrabold text-[15px] md:text-base mb-5 mt-10 text-[#0d1f3c]">
                                ▌ VISUAL: Marks Scored vs Maximum at Each
                                Cognitive Level
                              </div>

                              {/* Bloom graph */}
                              <div className="relative mt-10 mb-10 ml-[90px] md:ml-[140px] pb-8 border-l-2 border-b-2 border-[#cbd5e1]">
                                <div className="absolute inset-0 flex justify-between z-0 pointer-events-none">
                                  {[0, 20, 40, 60, 80, 100].map((val) => (
                                    <div
                                      key={val}
                                      className="w-px h-full bg-[#e2edf8] relative">
                                      <span className="absolute -bottom-6 -translate-x-1/2 text-xs text-[#64748b] font-['Inter',sans-serif]">
                                        {val}%
                                      </span>
                                    </div>
                                  ))}
                                </div>
                                {BLOOM_LEVELS.slice(0, 5).map((levelObj, i) => {
                                  const dbScore =
                                    activeReport.bloom_scores?.find((b) =>
                                      b.bloom_level
                                        .toUpperCase()
                                        .includes(levelObj.level),
                                    );
                                  const pct = dbScore
                                    ? parseFloat(dbScore.pct)
                                    : 0;
                                  return (
                                    <div
                                      key={i}
                                      className="relative z-[1] flex items-center h-10 mb-4">
                                      <div className="absolute -left-[100px] md:-left-[150px] w-[90px] md:w-[140px] text-[11px] md:text-[13px] font-semibold text-right text-[#334155] font-['Inter',sans-serif]">
                                        {levelObj.level} {levelObj.name}
                                      </div>
                                      <div
                                        className="h-6 rounded-r flex items-center pl-2.5 text-white font-bold text-[11px] md:text-xs font-['Inter',sans-serif] transition-[width] duration-1000 min-w-[30px]"
                                        style={{
                                          width: `${pct}%`,
                                          background: levelObj.barColor,
                                        }}>
                                        {pct}%
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              <div className="font-extrabold text-[15px] md:text-base mb-5 mt-10 text-[#0d1f3c]">
                                ▌ WHAT TO DO BASED ON BLOOM'S RESULTS
                              </div>
                              <div className="overflow-x-auto -mx-2 px-2">
                                <table className="w-full border-collapse font-['Inter',sans-serif] text-[12px] md:text-[13.5px] min-w-[600px]">
                                  <thead>
                                    <tr>
                                      <th className="bg-[#234674] text-white font-semibold px-3 py-3 text-center border border-[#234674] w-[20%]">
                                        Condition
                                      </th>
                                      <th className="bg-[#234674] text-white font-semibold px-3 py-3 text-left border border-[#234674] w-[25%]">
                                        What it means
                                      </th>
                                      <th className="bg-[#234674] text-white font-semibold px-3 py-3 text-left border border-[#234674] w-[55%]">
                                        Action for Teacher & Parent
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {BLOOM_LEVELS.slice(0, 5).map(
                                      (levelObj, i) => {
                                        const dbScore =
                                          activeReport.bloom_scores?.find((b) =>
                                            b.bloom_level
                                              .toUpperCase()
                                              .includes(levelObj.level),
                                          );
                                        const pct = dbScore
                                          ? parseFloat(dbScore.pct)
                                          : 0;
                                        const meaning = {
                                          L1: "Memory gap",
                                          L2: "Understanding gap",
                                          L3: "Cannot solve",
                                          L4: "Cannot analyze",
                                          L5: "Cannot evaluate",
                                        }[levelObj.level];
                                        return (
                                          <tr key={i}>
                                            <td
                                              className="px-3 py-3 border border-[#e2edf8] text-center font-extrabold"
                                              style={{
                                                color:
                                                  pct < 60
                                                    ? "#e24b4a"
                                                    : "#1D9E75",
                                              }}>
                                              {levelObj.level} &lt; 60%
                                            </td>
                                            <td className="px-3 py-3 border border-[#e2edf8] text-left text-[#555] font-semibold">
                                              {meaning}
                                            </td>
                                            <td className="px-3 py-3 border border-[#e2edf8] text-left text-[#555] text-[12.5px]">
                                              {levelObj.action}
                                            </td>
                                          </tr>
                                        );
                                      },
                                    )}
                                  </tbody>
                                </table>
                              </div>

                              <div className="bg-[#F6F3FA] border-l-4 border-[#8E62B6] px-5 py-4 my-6 italic text-[#49335E] text-[13px] md:text-sm font-['Inter',sans-serif] leading-relaxed rounded-r-lg">
                                "{sName} currently struggles at every level —
                                including basic recall (L1 at {l1Pct}%). The
                                most urgent fix is L2 — they scored {l2Score}{" "}
                                here, which means they are memorising facts
                                without truly understanding them. This explains
                                why they know a concept but cannot solve a
                                problem with it. Fixing L2 will automatically
                                lift L3, L4 and L5 over time."
                              </div>
                            </div>
                          ) : (
                            <div className="bg-white rounded-[20px] p-10 mb-8 text-center text-[#888] border border-[#e2edf8]">
                              No Bloom's Taxonomy data available for this test.
                            </div>
                          )}

                          {/* CHAPTER */}
                          <div className="flex items-center gap-2 mt-9 mb-5 text-[15px] md:text-base font-extrabold text-[#185FA5]">
                            <span>📈</span>
                            <span>Chapter-wise Analysis</span>
                          </div>
                          {activeReport.chapter_scores?.length > 0 ? (
                            <div className="anim-fade-up anim-d-160 bg-white rounded-[20px] p-5 md:p-10 shadow-[0_4px_24px_rgba(24,95,165,0.06)] border border-[#e2edf8] mb-8">
                              <div className="text-[16px] md:text-xl font-extrabold text-[#0d1f3c] mb-3">
                                Chapter-wise Analysis — All{" "}
                                {activeReport.chapter_scores.length} Chapters
                              </div>
                              <div className="text-[13px] md:text-sm text-[#444] mb-5 leading-relaxed font-['Inter',sans-serif]">
                                Walk through the full chapter breakdown so the
                                parent can see exactly where {sName} stands in
                                every topic.
                              </div>

                              <div className="bg-[#F6F3FA] border-l-4 border-[#8E62B6] px-5 py-4 my-6 italic text-[#49335E] text-[13px] md:text-sm font-['Inter',sans-serif] leading-relaxed rounded-r-lg">
                                "We tested {activeReport.chapter_scores.length}{" "}
                                chapters from the Class {tClass} syllabus. Each
                                chapter is scored and placed in one of three
                                bands. Let me walk you through all of them so
                                you have the complete picture."
                              </div>

                              <div className="overflow-x-auto -mx-2 px-2">
                                <table className="w-full border-collapse font-['Inter',sans-serif] text-[12px] md:text-[13.5px] mb-6 min-w-[700px]">
                                  <thead>
                                    <tr>
                                      <th className="bg-[#234674] text-white font-semibold px-3 py-3 text-center border border-[#234674] w-[25%]">
                                        Chapter
                                      </th>
                                      <th className="bg-[#234674] text-white font-semibold px-3 py-3 text-center border border-[#234674] w-[15%]">
                                        Subject
                                      </th>
                                      <th className="bg-[#234674] text-white font-semibold px-3 py-3 text-center border border-[#234674] w-[10%]">
                                        Marks
                                      </th>
                                      <th className="bg-[#234674] text-white font-semibold px-3 py-3 text-center border border-[#234674] w-[10%]">
                                        Score %
                                      </th>
                                      <th className="bg-[#234674] text-white font-semibold px-3 py-3 text-center border border-[#234674] w-[15%]">
                                        Status
                                      </th>
                                      <th className="bg-[#234674] text-white font-semibold px-3 py-3 text-left border border-[#234674] w-[25%]">
                                        Class {tClass} Risk if Weak
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {activeReport.chapter_scores.map(
                                      (ch, i) => {
                                        const status = getChapterStatus(ch.pct);
                                        let subject = ch.subject;
                                        let risk = ch.risk_if_weak;
                                        if (!subject || !risk) {
                                          const qMatch =
                                            activeReport.questions?.find(
                                              (q) => q.chapter === ch.chapter,
                                            );
                                          if (qMatch) {
                                            if (!subject)
                                              subject = qMatch.section;
                                            if (!risk)
                                              risk = qMatch.risk_if_weak;
                                          }
                                        }
                                        return (
                                          <tr key={i}>
                                            <td className="px-3 py-3 border border-[#e2edf8] text-left font-semibold text-[#185FA5]">
                                              {ch.chapter}
                                            </td>
                                            <td className="px-3 py-3 border border-[#e2edf8] text-center font-semibold">
                                              {subject || "N/A"}
                                            </td>
                                            <td className="px-3 py-3 border border-[#e2edf8] text-center font-semibold">
                                              {ch.score} / {ch.max_score}
                                            </td>
                                            <td
                                              className="px-3 py-3 border border-[#e2edf8] text-center font-extrabold"
                                              style={{ color: status.color }}>
                                              {ch.pct}%
                                            </td>
                                            <td className="px-3 py-3 border border-[#e2edf8] text-center">
                                              <span
                                                className="font-bold px-3 py-1 rounded-full inline-block"
                                                style={{
                                                  background: status.bg,
                                                  color: status.color,
                                                }}>
                                                {status.label}
                                              </span>
                                            </td>
                                            <td className="px-3 py-3 border border-[#e2edf8] text-left text-[#555] text-[12px]">
                                              {risk ||
                                                `Class ${tClass} foundations`}
                                            </td>
                                          </tr>
                                        );
                                      },
                                    )}
                                  </tbody>
                                </table>
                              </div>

                              <div className="bg-[#F6F3FA] border-l-4 border-[#8E62B6] px-5 py-4 italic text-[#49335E] text-[13px] md:text-sm font-['Inter',sans-serif] leading-relaxed rounded-r-lg mb-6">
                                "{swot.weakness.length} out of{" "}
                                {activeReport.chapter_scores.length} chapters
                                are in the Priority zone. This tells us {sName}{" "}
                                needs structured support before Class {tClass}{" "}
                                begins, not after. The good news is that{" "}
                                {swot.opportunity.length} chapters are Gap
                                chapters —{" "}
                                {swot.opportunity
                                  .map((o) => o.chapter)
                                  .join(", ") || "none"}
                                . Just 2-3 focused sessions each can convert
                                these into Strengths. These are our biggest
                                quick wins."
                              </div>

                              <div className="bg-[#e6f7f1] border-2 border-[#a3e6cd] px-5 py-4 rounded-xl text-[13px] md:text-sm text-[#1a4f3e] font-['Inter',sans-serif] leading-relaxed">
                                <strong>Important note for parents:</strong>{" "}
                                This report is not a judgment — it is a map. It
                                tells us exactly where to go next. {sName} has
                                shown they understand Math concepts (P1 at{" "}
                                {activeReport.p1 || 0}%) — that is a real
                                strength we can build on. With focused effort
                                and the right plan, they will enter Class{" "}
                                {tClass} on a much stronger footing.
                              </div>
                            </div>
                          ) : (
                            <div className="bg-white rounded-[20px] p-10 mb-8 text-center text-[#888] border border-[#e2edf8]">
                              No Chapter Analysis data available for this test.
                            </div>
                          )}

                          {/* SCORE ENTRY */}
                          <div className="flex items-center gap-2 mt-9 mb-5 text-[15px] md:text-base font-extrabold text-[#185FA5]">
                            <span>📋</span>
                            <span>Score Entry / Question Data</span>
                          </div>
                          <div className="anim-fade-up anim-d-160 bg-white rounded-[20px] p-5 md:p-10 shadow-[0_4px_24px_rgba(24,95,165,0.06)] border border-[#e2edf8] mb-8">
                            <div className="text-[16px] md:text-xl font-extrabold text-[#0d1f3c] mb-3">
                              Raw Question Analysis
                            </div>
                            <div className="text-[13px] md:text-sm text-[#444] mb-5 leading-relaxed font-['Inter',sans-serif]">
                              Detailed question-by-question breakdown mapped to
                              skills and cognitive levels.
                            </div>
                            <div className="overflow-x-auto -mx-2 px-2">
                              <table className="w-full border-collapse font-['Inter',sans-serif] text-[12px] md:text-[13.5px] min-w-[750px]">
                                <thead>
                                  <tr>
                                    <th className="bg-[#234674] text-white font-semibold px-3 py-3 text-center border border-[#234674]">
                                      Q No.
                                    </th>
                                    <th className="bg-[#234674] text-white font-semibold px-3 py-3 text-center border border-[#234674]">
                                      Subject
                                    </th>
                                    <th className="bg-[#234674] text-white font-semibold px-3 py-3 text-center border border-[#234674]">
                                      Chapter
                                    </th>
                                    <th className="bg-[#234674] text-white font-semibold px-3 py-3 text-center border border-[#234674]">
                                      Parameter / Skill
                                    </th>
                                    <th className="bg-[#234674] text-white font-semibold px-3 py-3 text-center border border-[#234674]">
                                      Bloom's
                                    </th>
                                    <th className="bg-[#234674] text-white font-semibold px-3 py-3 text-center border border-[#234674]">
                                      Correct Ans
                                    </th>
                                    <th className="bg-[#234674] text-white font-semibold px-3 py-3 text-center border border-[#234674]">
                                      Student Ans
                                    </th>
                                    <th className="bg-[#234674] text-white font-semibold px-3 py-3 text-center border border-[#234674]">
                                      Marks / Result
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
  {(() => {
    const parseQLabel = (qText = '') => {
      const match = qText.match(/Q(\d+)(?:\(([a-zA-Z])\))?/i);
      if (match) return { num: parseInt(match[1]), sub: match[2]?.toLowerCase() ?? null };
      return { num: null, sub: null };
    };

    return activeReport.questions?.map((q, i) => {
      const ok = parseInt(q.is_correct) === 1;
      const sk = !q.selected_option;
      const { num, sub } = parseQLabel(q.q_text);
      const qLabel = num ? `Q${num}${sub ? `(${sub})` : ''}` : `Q${i + 1}`;

      return (
        <tr key={q.question_id}>
          <td className="px-3 py-3 border border-[#e2edf8] text-center font-extrabold text-[#185FA5]">
            {qLabel}
          </td>
          <td className="px-3 py-3 border border-[#e2edf8] text-center font-semibold text-[#444]">
            {q.section}
          </td>
          <td className="px-3 py-3 border border-[#e2edf8] text-left font-semibold text-[#555]">
            {q.chapter}
          </td>
          <td className="px-3 py-3 border border-[#e2edf8] text-left text-[#555]">
            {q.skill_type}
          </td>
          <td className="px-3 py-3 border border-[#e2edf8] text-center font-semibold">
            {q.bloom_level}
          </td>
          <td className="px-3 py-3 border border-[#e2edf8] text-center font-bold text-[#1D9E75]">
            {q.correct?.toUpperCase()}
          </td>
          <td
            className="px-3 py-3 border border-[#e2edf8] text-center font-bold"
            style={{ color: sk ? "#aaa" : ok ? "#1D9E75" : "#e24b4a" }}>
            {sk ? "Skipped" : q.selected_option?.toUpperCase()}
          </td>
          <td
            className="px-3 py-3 border border-[#e2edf8] text-center font-extrabold"
            style={{ color: ok ? "#1D9E75" : "#e24b4a" }}>
            {ok ? "1" : "0"}
          </td>
        </tr>
      );
    });
  })()}
</tbody>
                              </table>
                            </div>
                          </div>

                          {/* ACTION PLAN */}
                          {activeReport.action_plan && (
                            <>
                              <div className="flex items-center gap-2 mt-9 mb-5 text-[15px] md:text-base font-extrabold text-[#185FA5]">
                                <span>📝</span>
                                <span>Next Steps</span>
                              </div>
                              <div className="anim-fade-up anim-d-160 bg-[linear-gradient(135deg,#f8fbff,#EEF4FF)] border border-[#c9dff7] rounded-[20px] p-5 md:p-10 shadow-[0_4px_24px_rgba(24,95,165,0.06)] mb-8">
                                <div className="text-[16px] md:text-xl font-extrabold text-[#0d1f3c] mb-3">
                                  Recommended 4-Week Action Plan
                                </div>
                                <div className="text-[13px] md:text-sm text-[#444] mb-5 leading-relaxed font-['Inter',sans-serif]">
                                  Based on the data above, here is the exact
                                  roadmap to get {sName} ready for Class{" "}
                                  {tClass}.
                                </div>

                                {(() => {
                                  let plan = null;
                                  try {
                                    plan =
                                      typeof activeReport.action_plan ===
                                      "string"
                                        ? JSON.parse(activeReport.action_plan)
                                        : activeReport.action_plan;
                                  } catch (e) {
                                    return (
                                      <div className="text-[13px] text-[#555] whitespace-pre-line font-['Inter',sans-serif]">
                                        {activeReport.action_plan}
                                      </div>
                                    );
                                  }

                                  if (plan && typeof plan === "object") {
                                    return (
                                      <div className="overflow-x-auto -mx-2 px-2">
                                        <table className="w-full border-collapse font-['Inter',sans-serif] text-[12px] md:text-[13.5px] bg-white">
                                          <tbody>
                                            {Object.entries(plan).map(
                                              ([key, value], idx) => {
                                                const label = key
                                                  .replace(
                                                    /([a-zA-Z]+)(\d+)/,
                                                    "$1 $2",
                                                  )
                                                  .replace(/^./, (c) =>
                                                    c.toUpperCase(),
                                                  );
                                                return (
                                                  <tr key={idx}>
                                                    <td className="w-[20%] px-3 py-3 border border-[#e2edf8] font-extrabold text-[#185FA5] bg-[#f8fbff]">
                                                      {label}
                                                    </td>
                                                    <td className="px-3 py-3 border border-[#e2edf8] text-[#555] leading-relaxed">
                                                      {value}
                                                    </td>
                                                  </tr>
                                                );
                                              },
                                            )}
                                          </tbody>
                                        </table>
                                      </div>
                                    );
                                  }
                                  return (
                                    <div className="text-[13px] text-[#555] font-['Inter',sans-serif]">
                                      {activeReport.action_plan}
                                    </div>
                                  );
                                })()}
                              </div>
                            </>
                          )}
                        </>
                      );
                    })()
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── small subcomponents (presentation-only) ─── */

function SwotBox({
  tone,
  title,
  desc,
  items,
  zoneTitle = "Chapters in this zone:",
  emptyMsg = "No chapters in this zone yet",
  emptyTone = "muted",
}) {
  const TONE = {
    strength: "border-[#7bd7b5] bg-[#edf8f2]",
    opportunity: "border-[#f0b66a] bg-[#fff7eb]",
    weakness: "border-[#f2b3a7] bg-[#fff2ef]",
    threat: "border-[#9ec0ea] bg-[#eef5ff]",
  }[tone];
  const EMPTY = emptyTone === "green" ? "text-[#1D9E75]" : "text-[#888]";
  return (
    <div className={`border-2 rounded-xl p-5 bg-white ${TONE}`}>
      <h4 className="text-[15px] md:text-base text-[#0d1f3c] mb-2 font-extrabold">
        {title}
      </h4>
      <p className="text-[12px] text-[#666] leading-relaxed font-['Inter',sans-serif]">
        {desc}
      </p>
      <div className="mt-4 mb-2 text-[12px] text-[#333] font-bold font-['Inter',sans-serif]">
        {zoneTitle}
      </div>
      <div className="text-[12px] text-[#444] leading-[1.7] font-['Inter',sans-serif] font-medium">
        {items.length > 0 ? (
          items.map((x, i) => (
            <div key={`${tone}-${i}`} className="mb-1">
              - {x.label || x}
            </div>
          ))
        ) : (
          <div className={`italic ${EMPTY}`}>- {emptyMsg}</div>
        )}
      </div>
    </div>
  );
}

function SkillCard({ tone, code, title, desc }) {
  const TONE = {
    c1: { wrap: "bg-[#eef6ff] border-[#9ec0ea]", code: "text-[#2d68b1]" },
    c2: { wrap: "bg-[#fff6e8] border-[#e8c28d]", code: "text-[#b8742e]" },
    c3: { wrap: "bg-[#f2efff] border-[#b6b0f0]", code: "text-[#645cc8]" },
  }[tone];
  return (
    <div className={`border rounded-xl px-5 py-4 ${TONE.wrap}`}>
      <div className="flex items-center gap-3 mb-1.5">
        <div
          className={`font-extrabold text-2xl leading-none w-8 font-['Sora',sans-serif] ${TONE.code}`}>
          {code}
        </div>
        <div className="text-[14px] md:text-[15px] font-bold text-[#0d1f3c] font-['Sora',sans-serif]">
          {title}
        </div>
      </div>
      <div className="text-[12.5px] md:text-[13px] text-[#444] font-['Inter',sans-serif] leading-relaxed">
        {desc}
      </div>
    </div>
  );
}
