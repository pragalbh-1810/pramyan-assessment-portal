import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  if (pct >= 50) return { label: "⚠️ Average", bg: "#fff4e0", color: "#d97706" };
  return { label: "❌ Needs Work", bg: "#fff0f0", color: "#e24b4a" };
}

function getBloomResult(pct) {
  if (pct === 'N/A') return { label: '-', bg: 'transparent', color: '#444' };
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
  { level: 'L1', name: 'Remember', meaning: 'Recall facts & formulas', example: 'What is the area formula for a trapezium?', action: 'Use flashcards. Memorise formulas, definitions, key facts. 10-min daily recall drill.', barColor: '#185FA5' },
  { level: 'L2', name: 'Understand', meaning: 'Explain or classify', example: 'Why does a candle go out when covered?', action: 'Ask \'why\'. Use real-life examples. Connect concepts to things the student already knows.', barColor: '#2563a8' },
  { level: 'L3', name: 'Apply', meaning: 'Solve using formulas', example: '"Find pressure if F=200N, A=0.4m²."', action: 'Walk through NCERT solved examples step by step. Identify WHICH step fails — formula, substitution, or arithmetic.', barColor: '#3a7bd5' },
  { level: 'L4', name: 'Analyze', meaning: 'Compare & reason', example: 'How does increasing area reduce pressure? Give example.', action: 'Cannot think through multi-step problems. Introduce analysis questions: \'What if...?\', \'Compare A and B\'.', barColor: '#1D9E75' },
  { level: 'L5', name: 'Evaluate', meaning: 'Judge & justify', example: 'Which method of food preservation is better and why?', action: 'No higher-order thinking yet. Practice HOTS and competency-based questions from CBSE banks.', barColor: '#e07b2a' },
  { level: 'L6', name: 'Create', meaning: 'Design & invent (not in test)', example: 'Design an experiment to show microorganism growth.', action: 'N/A', barColor: '#aaa' },
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
  const strength = items.filter((x) => x.category === "strength" || x.pct >= 70);
  const opportunity = items.filter((x) => x.category === "opportunity" || (x.pct >= 40 && x.pct < 70));
  const weakness = items.filter((x) => x.category === "weakness" || x.pct < 40);

  const threats = weakness.map((x) => {
    const hint = THREAT_HINTS[x.chapter] || `next-grade ${x.section.toLowerCase()} progression`;
    return `${x.chapter} weak -> ${hint} at risk`;
  });

  return { strength, opportunity, weakness, threats };
}

function buildSkillRows(reportObj) {
  return [
    { code: "P1", title: "Math - conceptual clarity", pct: reportObj.p1, color: "#21a179" },
    { code: "P1", title: "Science - conceptual clarity", pct: reportObj.p1, color: "#3b82f6" },
    { code: "P2", title: "Math - procedural accuracy", pct: reportObj.p2, color: "#e07b2a" },
    { code: "P2", title: "Science - procedural accuracy", pct: reportObj.p2, color: "#d65d33" },
    { code: "P3", title: "Math - application (HOTS)", pct: reportObj.p3, color: "#7c83fd" },
    { code: "P3", title: "Science - application (HOTS)", pct: reportObj.p3, color: "#5c6ac4" },
  ];
}

function buildSkillInsight(name, reportObj) {
  const mathP1 = reportObj.p1 || 0;
  const sciP1 = reportObj.sci_p1 || reportObj.p1 || 0;
  const mathP2 = reportObj.p2 || 0;
  const mathP3 = reportObj.p3 || 0;

  const mathExecPeak = Math.max(mathP2, mathP3);
  const mathDrop = Math.max(0, mathP1 - mathExecPeak);
  const person = name || "Student";

  const conceptText =
    mathP1 >= 70
      ? "understands concepts reasonably well"
      : mathP1 >= 45
        ? "concept clarity in Math is moderate"
        : "concept layer in Math needs rebuilding";

  const mathExecText =
    mathDrop >= 20
      ? `But as soon as they execute a calculation (P2) or apply it to a word problem (P3), the score drops sharply.`
      : `Their transition from concept (P1) to execution and application (P2/P3) is comparatively stable.`;

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

/* ─────────────── STYLES ─────────────── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=DM+Sans:wght@400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
html,body{ height:100%; background:#EEF4FF; font-family:'Sora',sans-serif; overflow: hidden; }

@keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }

/* ── NAV ── */
.tp-nav { background: linear-gradient(135deg,#1D9E75 0%,#185FA5 100%); height:64px; margin:10px 16px 0; border-radius:16px; padding:0 26px; display:flex; align-items:center; justify-content:space-between; box-shadow:0 6px 28px rgba(24,95,165,.22); z-index:200; }
.nav-brand { display:flex; align-items:center; gap:10px; }
.nav-logo { height:34px; border-radius:7px; background:#fff; padding:3px; }
.nav-chip { background:rgba(255,255,255,.18); border:1px solid rgba(255,255,255,.28); border-radius:20px; padding:3px 10px; font-size:10px; font-weight:700; color:#fff; }
.nav-right { display:flex; align-items:center; gap:10px; }
.nav-name { font-size:12px; color:rgba(255,255,255,.8); font-family:'Inter',sans-serif; }
.btn-white { background:#fff; color:#185FA5; border:none; border-radius:9px; padding:7px 16px; font-size:12px; font-weight:700; font-family:'Sora',sans-serif; cursor:pointer; transition:.2s; }

/* ── LAYOUT ── */
.tp-layout { display:grid; grid-template-columns:360px 1fr; gap:0; height:calc(100vh - 84px); margin-top: 10px; }

/* ── LEFT PANEL ── */
.tp-left { background:#fff; border-right:1px solid #d4e4f7; display:flex; flex-direction:column; height: 100%; overflow: hidden; }
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

.student-list { flex:1; overflow-y:auto; padding-bottom: 24px; }
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
.tp-right { height: 100%; overflow-y:auto; background:#EEF4FF; padding:32px 40px 60px; }
.tp-right::-webkit-scrollbar { width:6px; }
.tp-right::-webkit-scrollbar-thumb { background:#d4e4f7; border-radius:3px; }
.rp-placeholder { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:400px; gap:16px; text-align: center; }
.eyebrow { font-size: 16px; font-weight: 800; color: #185FA5; margin: 36px 0 20px 0; font-family: 'Sora', sans-serif; display: flex; align-items: center; gap: 8px; }

/* Student info banner */
.stu-banner { background:#fff; border-radius:18px; padding:20px 24px; margin-bottom:24px; box-shadow:0 4px 16px rgba(24,95,165,.05); border:1px solid #e2edf8; display:flex; align-items:center; gap:16px; animation:fadeUp .4s ease both; }
.stu-avi-lg { width:54px; height:54px; border-radius:50%; background:linear-gradient(135deg,#1D9E75,#185FA5); display:flex; align-items:center; justify-content:center; color:#fff; font-size:22px; font-weight:800; }
.stu-name-lg { font-size:18px; font-weight:700; color:#0d1f3c; margin-bottom:3px; }
.stu-sub-lg { font-size:13px; color:#666; font-family:'Inter',sans-serif; }
.stag { background:#EEF4FF; border:1px solid #d4e4f7; border-radius:20px; padding:4px 12px; font-size:11px; color:#185FA5; font-weight:600; margin-right:8px;}

/* ── OVERALL HERO & STATS (Gradient Version) ── */
.hero-card {
  background:linear-gradient(135deg,#1D9E75 0%,#185FA5 100%);
  border-radius:24px; padding:32px; margin-bottom:24px;
  display:flex; align-items:center; justify-content:space-between; gap:18px;
  box-shadow:0 8px 32px rgba(24,95,165,.2);
  animation:fadeUp .4s ease .05s both;
}
.hero-l { display:flex; flex-direction:column; gap:5px; }
.hero-tag { font-size:12px; color:rgba(255,255,255,.8); font-family:'Inter',sans-serif; }
.hero-name { font-size:22px; font-weight:800; color:#fff; margin: 4px 0; }
.hero-sub { font-size:12px; color:rgba(255,255,255,.7); font-family:'Inter',sans-serif; }
.hero-r { display:flex; align-items:center; gap:20px; flex-shrink:0; }
.perf-lbl { font-size:14px; font-weight:700; color:#fff; }
.score-ring {
  width:96px; height:96px; border-radius:50%;
  background:rgba(255,255,255,.14); border:3px solid rgba(255,255,255,.38);
  display:flex; flex-direction:column; align-items:center; justify-content:center;
}
.ring-num { font-size:28px; font-weight:800; color:#fff; line-height:1; }
.ring-den { font-size:12px; color:rgba(255,255,255,.7); font-family:'DM Sans',sans-serif; }

.sub-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:24px; animation:fadeUp .4s ease .08s both; }
.sub-card { background:#fff; border-radius:18px; padding:24px; box-shadow:0 4px 16px rgba(24,95,165,.05); border:1px solid #e2edf8; }
.sub-name { font-size:15px; font-weight:700; color:#0d1f3c; display:flex; align-items:center; gap:8px;}
.bar-bg { height:8px; background:#f0f4fb; border-radius:4px; margin: 12px 0; }
.bar-fg { height:100%; border-radius:4px; transition:width 1.2s ease; }
.sub-bot { display:flex; justify-content:space-between; font-size:11px; color:#aaa; font-family:'DM Sans',sans-serif; }
.sub-st { font-size:11px; font-weight:600; padding:3px 9px; border-radius:20px; }

.stat-row { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:24px; animation:fadeUp .4s ease .1s both; }
.stat-box { background:#fff; border-radius:16px; padding:20px; text-align:center; border:1px solid #e2edf8; }
.stat-ico { font-size:18px; margin-bottom:5px; }
.stat-val { font-size:22px; font-weight:800; margin:6px 0 2px; }
.stat-lbl { font-size:10px; color:#aaa; text-transform:uppercase; letter-spacing:.3px; font-family:'DM Sans',sans-serif; }

/* ── SWOT & SKILL BLOCKS ── */
.report-block { background:#fff; border:1px solid #e2edf8; border-radius:20px; padding:32px 40px; margin-bottom:24px; animation:fadeUp .4s ease .12s both; box-shadow: 0 4px 24px rgba(24,95,165,0.06); }
.block-chip { display:inline-flex; align-items:center; gap:6px; font-size:10px; font-weight:700; color:#fff; background:#1D9E75; padding:4px 10px; border-radius:999px; letter-spacing:.4px; text-transform:uppercase; margin-bottom:12px; font-family:'DM Sans',sans-serif; }
.block-title { font-size:24px; font-weight:800; color:#0d1f3c; margin-bottom:8px; line-height:1.2; font-family:'Sora',sans-serif; }
.block-desc { font-size:14px; color:#444; line-height:1.6; font-family:'Inter',sans-serif; margin-bottom:20px; }
.guide-quote { background:#f2f1ff; border-left:4px solid #7c83fd; color:#4a4f8a; border-radius:0 8px 8px 0; padding:16px 20px; font-size:13px; font-family:'Inter',sans-serif; font-style:italic; line-height:1.6; margin-bottom:24px; }

.swot-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
.swot-box { border:2px solid; border-radius:12px; padding:20px; background:#fff; }
.swot-box h4 { font-size:16px; color:#0d1f3c; margin-bottom:8px; font-weight:800; font-family:'Sora',sans-serif; }
.swot-box p { font-size:12px; color:#666; line-height:1.5; font-family:'Inter',sans-serif; }
.swot-zone-title { margin-top:16px; margin-bottom:8px; font-size:12px; color:#333; font-weight:700; font-family:'Inter',sans-serif; }
.swot-list { font-size:12px; color:#444; line-height:1.7; font-family:'Inter',sans-serif; font-weight: 500; }
.swot-list div { margin-bottom:4px; }

.swot-strength { border-color:#7bd7b5; background:#edf8f2; }
.swot-opportunity { border-color:#f0b66a; background:#fff7eb; }
.swot-weakness { border-color:#f2b3a7; background:#fff2ef; }
.swot-threat { border-color:#9ec0ea; background:#eef5ff; }

.skill-level-wrap { margin-top:16px; display:grid; gap:12px; }
.skill-level-card { border:1px solid; border-radius:12px; padding:16px 20px; }
.skill-level-top { display:flex; align-items:center; gap:12px; margin-bottom:6px; }
.skill-code { font-weight:800; font-size:24px; line-height:1; width:34px; font-family:'Sora',sans-serif; }
.skill-head { font-size:15px; font-weight:700; color:#0d1f3c; font-family:'Sora',sans-serif; }
.skill-copy { font-size:13px; color:#444; font-family:'Inter',sans-serif; line-height:1.55; }

.skill-c1 { background:#eef6ff; border-color:#9ec0ea; }
.skill-c1 .skill-code { color:#2d68b1; }
.skill-c2 { background:#fff6e8; border-color:#e8c28d; }
.skill-c2 .skill-code { color:#b8742e; }
.skill-c3 { background:#f2efff; border-color:#b6b0f0; }
.skill-c3 .skill-code { color:#645cc8; }

.skill-bars { margin-top:24px; background:#fff; border:1px solid #e2edf8; border-radius:12px; padding:24px; }
.skill-bars h5 { font-size:15px; color:#0d1f3c; margin-bottom:16px; font-weight:800; font-family:'Sora',sans-serif; }
.skill-row { display:grid; grid-template-columns:48px 1fr 48px; gap:12px; align-items:center; margin-bottom:12px; }
.skill-tag { background:#eef2f7; color:#566074; border-radius:999px; font-size:11px; font-weight:800; text-align:center; padding:4px 0; font-family:'DM Sans',sans-serif; }
.skill-bar-main { min-width:0; }
.skill-label { font-size:12px; font-weight:600; color:#333; font-family:'Inter',sans-serif; margin-bottom:6px; }
.skill-track { height:12px; border-radius:999px; background:#eef2f7; overflow:hidden; }
.skill-fill { height:100%; border-radius:999px; transition: width 1s; }
.skill-pct { text-align:right; font-size:13px; color:#333; font-weight:700; font-family:'Inter',sans-serif; }

/* ── BLOOM, CHAPTER & Q CARDS ── */
.bloom-container, .chapter-container, .q-card, .action-card {
  background: white; border-radius: 20px; padding: 40px;
  box-shadow: 0 4px 24px rgba(24,95,165,0.06); border: 1px solid #e2edf8;
  margin-bottom: 32px; animation: fadeUp 0.4s ease 0.16s both;
}
.report-header-text { font-size: 20px; font-weight: 800; color: #0d1f3c; margin-bottom: 12px; font-family: 'Sora', sans-serif; text-transform: uppercase; }
.report-desc-text { font-size: 14px; color: #444; margin-bottom: 24px; font-family: 'Inter', sans-serif; line-height: 1.6; }
.purple-quote { background-color: #F6F3FA; border-left: 4px solid #8E62B6; padding: 18px 24px; margin: 24px 0 32px 0; font-style: italic; color: #49335E; font-size: 14px; font-family: 'Inter', sans-serif; line-height: 1.6; border-radius: 0 8px 8px 0; }
.green-note { background-color: #e6f7f1; border: 2px solid #a3e6cd; padding: 18px 24px; border-radius: 12px; font-size: 14px; color: #1a4f3e; font-family: 'Inter', sans-serif; line-height: 1.6; margin-top: 32px; }

.report-table { width: 100%; border-collapse: collapse; font-family: 'Inter', sans-serif; font-size: 13.5px; margin-bottom: 32px; }
.report-table th { background: #234674; color: white; font-weight: 600; padding: 14px 16px; text-align: center; border: 1px solid #234674; }
.report-table td { padding: 14px 16px; border: 1px solid #e2edf8; text-align: center; color: #333; }
.report-table td.left-align { text-align: left; font-weight: 600; color: #185FA5; }
.report-table td.desc-text { text-align: left; color: #555; }
.status-badge { font-weight: 700; padding: 4px 12px; border-radius: 20px; }

/* 📊 Custom Bloom's Graph Styling */
.chart-title { font-weight: 800; font-size: 16px; margin-bottom: 20px; color: #0d1f3c; }
.bloom-graph-wrapper { position: relative; margin: 40px 0 40px 140px; padding-bottom: 30px; border-left: 2px solid #cbd5e1; border-bottom: 2px solid #cbd5e1; }
.bloom-grid-lines { position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; justify-content: space-between; z-index: 0; }
.bloom-grid-line { width: 1px; height: 100%; background: #e2edf8; position: relative; }
.bloom-grid-line span { position: absolute; bottom: -25px; transform: translateX(-50%); font-size: 12px; color: #64748b; font-family: 'Inter', sans-serif; }
.bloom-bar-row { position: relative; z-index: 1; display: flex; align-items: center; height: 40px; margin-bottom: 16px; }
.bloom-bar-label { position: absolute; left: -150px; width: 140px; font-size: 13px; font-weight: 600; text-align: right; color: #334155; font-family: 'Inter', sans-serif; }
.bloom-bar-fill { height: 24px; border-radius: 0 4px 4px 0; display: flex; align-items: center; padding-left: 10px; color: white; font-weight: 700; font-size: 12px; font-family: 'Inter', sans-serif; transition: width 1s ease-out; min-width: 30px; }

.action-card { background: linear-gradient(135deg,#f8fbff,#EEF4FF); border: 1px solid #c9dff7; }

/* Q table */
.qtable { width:100%; border-collapse:collapse; }
.qtable th { font-size:12px; font-weight:700; color:#888; text-transform:uppercase; padding:12px 14px; border-bottom:2px solid #e2edf8; text-align:left; }
.qtable td { padding:14px; border-bottom:1px solid #f0f4fb; font-size:13px; font-family:'Inter',sans-serif; color:#444; }
.opt-c { color:#1D9E75; font-weight:700; }
.opt-w { color:#e24b4a; font-weight:700; }

@media(max-width:780px){
  html, body { overflow: auto; }
  .tp-layout { grid-template-columns:1fr; height: auto; overflow: visible;}
  .tp-left { height:auto; position:static; max-height:400px; border-right: none; border-bottom: 2px solid #d4e4f7;}
  .tp-right { padding: 20px 16px; height: auto; overflow: visible;}
  .sub-grid, .stat-row { grid-template-columns:1fr; }
  
  .hero-card { flex-direction: column; align-items: flex-start; padding: 24px; gap: 20px; }
  .hero-r { align-items: flex-start; }
  
  .report-block, .bloom-container, .chapter-container, .q-card, .action-card { padding: 20px; }
  .swot-grid { grid-template-columns: 1fr; }
  .report-table { display: block; overflow-x: auto; white-space: nowrap; }
  .bloom-graph-wrapper { margin-left: 90px; }
  .bloom-bar-label { left: -100px; width: 90px; font-size: 11px; }
}
`;

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
    } catch { } finally {
      setListLoading(false);
    }
  };

  const applyFilter = (list, q, f) => {
    let out = list;
    if (q.trim()) {
      const lq = q.toLowerCase();
      out = out.filter((s) => s.name.toLowerCase().includes(lq) || s.email.toLowerCase().includes(lq));
    }
    if (f === "strong") out = out.filter((s) => s.test_id && s.overall_pct >= 75);
    if (f === "avg") out = out.filter((s) => s.test_id && s.overall_pct >= 50 && s.overall_pct < 75);
    if (f === "weak") out = out.filter((s) => s.test_id && s.overall_pct < 50);
    if (f === "none") out = out.filter((s) => !s.test_id);
    return out;
  };

  const doSearch = (q) => { setSearch(q); setShown(applyFilter(allStudents, q, filter)); };
  const doFilter = (f) => { setFilter(f); setShown(applyFilter(allStudents, search, f)); };
  const clearSearch = () => { setSearch(""); setFilter("all"); setShown(allStudents); };

  const selectStudent = async (s) => {
    setActiveStudent(s);
    setReport(null);
    setReportError("");
    if (!s.test_id) return;
    setReportLoading(true);
    try {
      const res = await fetch(
        apiUrl(`get-student-report.php?student_id=${s.id}&test_id=${s.test_id}`),
        { headers: { Authorization: `Bearer ${getToken()}` } }
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

  const pillClass = (s) => {
    if (!s.test_id) return "pill-n";
    return s.overall_pct >= 75 ? "pill-g" : s.overall_pct >= 50 ? "pill-a" : "pill-w";
  };
  const pillLabel = (s) => {
    if (!s.test_id) return "No test";
    return `${Math.round(s.overall_pct)}%`;
  };

  const counts = {
    total: allStudents.length,
    strong: allStudents.filter((s) => s.test_id && s.overall_pct >= 75).length,
    avg: allStudents.filter((s) => s.test_id && s.overall_pct >= 50 && s.overall_pct < 75).length,
    weak: allStudents.filter((s) => s.test_id && s.overall_pct < 50).length,
  };

  return (
    <>
      <style>{css}</style>
      <nav className="tp-nav">
        <div className="nav-brand">
          <img src={logo} className="nav-logo" alt="logo" />
          <span className="nav-chip">TEACHER PORTAL</span>
        </div>
        <div className="nav-right">
          <span className="nav-name">👤 {teacher?.name || "Teacher"}</span>
          <button className="btn-white" onClick={() => { removeToken(); navigate("/"); }}>Logout</button>
        </div>
      </nav>

      <div className="tp-layout">
        {/* LEFT LIST */}
        <div className="tp-left">
          <div className="left-head">
            <div className="left-title">Student Reports</div>
            <div className="left-sub">Click a student to view their full report</div>
          </div>
          <div className="left-stats">
            <div className="lstat"><div className="lstat-val">{counts.total}</div><div className="lstat-lbl">Total</div></div>
            <div className="lstat"><div className="lstat-val" style={{ color: "#1D9E75" }}>{counts.strong}</div><div className="lstat-lbl">Strong</div></div>
            <div className="lstat"><div className="lstat-val" style={{ color: "#e24b4a" }}>{counts.weak}</div><div className="lstat-lbl">Weak</div></div>
          </div>
          <div className="search-wrap">
            <div className="search-inner">
              <span className="search-icon">🔍</span>
              <input placeholder="Search students..." value={search} onChange={(e) => doSearch(e.target.value)} />
              {search && <button className="search-clear" onClick={clearSearch}>✕</button>}
            </div>
          </div>
          <div className="filter-chips">
            {[ { k: "all", l: "All" }, { k: "strong", l: "🏆 Strong" }, { k: "avg", l: "⚠️ Avg" }, { k: "weak", l: "❌ Weak" }, { k: "none", l: "📭 No test" } ].map((f) => (
              <button key={f.k} className={`fchip ${filter === f.k ? "on" : ""}`} onClick={() => doFilter(f.k)}>{f.l}</button>
            ))}
          </div>
          <div className="student-list">
            {listLoading ? (
              <div style={{padding:'40px', textAlign:'center', color: '#888'}}>Loading...</div>
            ) : shown.length === 0 ? (
              <div className="empty-list">No students found matching your criteria.</div>
            ) : (
              shown.map((s) => (
                <div key={s.id} className={`srow ${activeStudent?.id === s.id ? "active" : ""}`} onClick={() => selectStudent(s)}>
                  <div className="s-avi">{s.name[0]?.toUpperCase()}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="s-name">{s.name}</div>
                    <div className="s-meta">Class {s.class} · {s.email}</div>
                  </div>
                  <span className={`s-pill ${pillClass(s)}`}>{pillLabel(s)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT REPORT */}
        <div className="tp-right">
          {!activeStudent ? (
            <div className="rp-placeholder">
              <div className="rp-placeholder-icon">👈</div>
              <h2>Select a Student</h2>
              <p style={{color: '#888'}}>Click any student from the left panel to view their full diagnostic report.</p>
            </div>
          ) : reportLoading ? (
            <div style={{padding:'60px', textAlign:'center', fontSize:'18px', color: '#888'}}>Loading Student Data...</div>
          ) : (
            <>
              {reportError && <div className="err-banner" style={{background: '#fff0f0', padding: '12px', borderRadius: '8px', color: '#e24b4a', marginBottom: '20px'}}>⚠️ {reportError}</div>}

              <div className="eyebrow">👤 Student Profile</div>
              <div className="stu-banner">
                <div className="stu-avi-lg">{activeStudent.name[0]?.toUpperCase()}</div>
                <div style={{ flex: 1 }}>
                  <div className="stu-name-lg">{activeStudent.name}</div>
                  <div className="stu-sub-lg">{activeStudent.email}</div>
                  <div className="stu-tags">
                    <span className="stag">Class {activeStudent.class || report?.test_class || '10'}</span>
                    <span className="stag">📞 {activeStudent.parent_phone || "N/A"}</span>
                  </div>
                </div>
              </div>

              {!activeStudent.test_id ? (
                <div className="rp-placeholder" style={{ minHeight: 200 }}>
                  <div style={{ fontSize: 36 }}>📭</div>
                  <h2>No test submitted</h2>
                  <p style={{color: '#888'}}>This student hasn't taken a test yet.</p>
                </div>
              ) : (
                report && (() => {
                  
                  // 👇 ========================================================
                  // DYNAMIC RECALCULATION ENGINE (Overrides bad DB summary tables)
                  // ========================================================
                  let activeReport = { ...report };
                  
                  if (report.questions && report.questions.length > 0) {
                    const qs = report.questions;
                    const totalMax = qs.length;
                    let totalScore = 0;
                    let mathMax = 0, mathScore = 0;
                    let sciMax = 0, sciScore = 0;
                    let skipped = 0;

                    const bMap = {};
                    const cMap = {};
                    let p1m=0, p1s=0, p2m=0, p2s=0, p3m=0, p3s=0;

                    qs.forEach(q => {
                      const ok = parseInt(q.is_correct) === 1;
                      if (ok) totalScore++;
                      if (!q.selected_option) skipped++;

                      // Subjects
                      const sec = (q.section || '').toLowerCase();
                      if (sec.includes('math')) { mathMax++; if(ok) mathScore++; }
                      else if (sec.includes('sci')) { sciMax++; if(ok) sciScore++; }

                      // Bloom
                      const lvl = (q.bloom_level || 'UNKNOWN').toUpperCase();
                      if(!bMap[lvl]) bMap[lvl] = { max_score: 0, score: 0 };
                      bMap[lvl].max_score++;
                      if(ok) bMap[lvl].score++;

                      // Chapters
                      const ch = q.chapter || 'Unknown';
                      if(!cMap[ch]) cMap[ch] = { chapter: ch, subject: q.section, swot_category: '', max_score: 0, score: 0, risk_if_weak: q.risk_if_weak || '' };
                      cMap[ch].max_score++;
                      if(ok) cMap[ch].score++;

                      // Skills
                      const sk = (q.skill_type || '').toUpperCase();
                      if (sk.includes('P1') || sk.includes('CONCEPT')) { p1m++; if(ok) p1s++; }
                      else if (sk.includes('P2') || sk.includes('PROCED')) { p2m++; if(ok) p2s++; }
                      else if (sk.includes('P3') || sk.includes('APPLIC')) { p3m++; if(ok) p3s++; }
                    });

                    // Build fresh Bloom Array
                    const bloom_scores = Object.keys(bMap).map(k => ({
                      bloom_level: k,
                      score: bMap[k].score,
                      max_score: bMap[k].max_score,
                      pct: bMap[k].max_score > 0 ? ((bMap[k].score / bMap[k].max_score) * 100).toFixed(2) : 0
                    }));

                    // Build fresh Chapter Array
                    const chapter_scores = Object.values(cMap).map(c => {
                      const calcPct = c.max_score > 0 ? ((c.score / c.max_score) * 100).toFixed(2) : 0;
                      let swotCat = "weakness";
                      if (calcPct >= 70) swotCat = "strength";
                      else if (calcPct >= 40) swotCat = "opportunity";

                      return {
                        ...c,
                        pct: calcPct,
                        swot_category: swotCat
                      };
                    }).sort((a,b) => b.pct - a.pct);

                    // Overwrite bad data
                    activeReport = {
                      ...activeReport,
                      total_score: totalScore,
                      max_score: totalMax,
                      overall_pct: totalMax > 0 ? ((totalScore/totalMax)*100).toFixed(2) : 0,
                      math_score: mathScore,
                      math_max: mathMax,
                      math_pct: mathMax > 0 ? Math.round((mathScore/mathMax)*100) : 0,
                      sci_score: sciScore,
                      sci_max: sciMax,
                      sci_pct: sciMax > 0 ? Math.round((sciScore/sciMax)*100) : 0,
                      bloom_scores: bloom_scores,
                      chapter_scores: chapter_scores,
                      p1: p1m > 0 ? Math.round((p1s/p1m)*100) : 0,
                      p2: p2m > 0 ? Math.round((p2s/p2m)*100) : 0,
                      p3: p3m > 0 ? Math.round((p3s/p3m)*100) : 0,
                      correct: totalScore,
                      unanswered: skipped,
                      wrong: totalMax - totalScore - skipped
                    };
                  }
                  // ========================================================


                  const perf = getPerf(activeReport.overall_pct);
                  const mathSt = getStatus(activeReport.math_pct);
                  const sciSt = getStatus(activeReport.sci_pct);
                  const sName = activeStudent.name.split(" ")[0];
                  const tClass = activeReport.test_class || activeStudent.class || '10';

                  // Logic for SWOT and SKILL blocks using freshly calculated data
                  const chapterSectionMap = buildChapterSectionMap(activeReport.questions || []);
                  const swot = buildSwotBuckets(activeReport.chapter_scores || [], chapterSectionMap);
                  const skillRows = buildSkillRows(activeReport);
                  const skillInsight = buildSkillInsight(sName, activeReport);

                  const classNum = Number(activeStudent.class);
                  const hasClassNum = Number.isFinite(classNum) && classNum > 0;
                  const currentClass = hasClassNum ? `Class ${classNum}` : "current class";
                  const nextClass = hasClassNum ? `Class ${classNum + 1}` : "next class";

                  const strengthCount = swot.strength.length;
                  const priorityCount = swot.weakness.length;

                  // Pre-extract L1 and L2 for the purple quote before rendering
                  const l1Pct = activeReport.bloom_scores?.find(b => b.bloom_level.toUpperCase().includes('L1'))?.pct || 0;
                  const l2Score = activeReport.bloom_scores?.find(b => b.bloom_level.toUpperCase().includes('L2'))?.score || 0;

                  return (
                    <>
                      <div className="eyebrow">📊 Overall Score</div>
                      
                      {/* RESTORED GRADIENT HERO CARD */}
                      <div className="hero-card">
                        <div className="hero-l">
                          <span className="hero-tag">Diagnostic Assessment Result</span>
                          <span className="hero-name">{sName}'s Full Report</span>
                          <span className="hero-sub">Complete Teacher View — All Sections Unlocked</span>
                        </div>
                        <div className="hero-r">
                          <div style={{textAlign:'right'}}>
                            <div className="perf-lbl">{perf.label}</div>
                            <div style={{fontSize:'12px', color:'rgba(255,255,255,0.7)'}}>Performance</div>
                          </div>
                          <div className="score-ring">
                            <span className="ring-num">{activeReport.total_score}</span>
                            <span className="ring-den">/ {activeReport.max_score}</span>
                          </div>
                        </div>
                      </div>

                      <div className="eyebrow">📚 Subject-wise Score</div>
                      <div className="sub-grid">
                        <div className="sub-card">
                          <div className="sub-top">
                            <div className="sub-name">
                              <div className="sub-ico" style={{ background: "#EEF4FF" }}>📐</div>
                              Mathematics
                            </div>
                            <span className="sub-pct" style={{ color: "#185FA5" }}>{activeReport.math_pct}%</span>
                          </div>
                          <div className="bar-bg">
                            <div className="bar-fg" style={{ width: `${activeReport.math_pct}%`, background: "linear-gradient(90deg,#185FA5,#1D9E75)" }} />
                          </div>
                          <div className="sub-bot">
                            <span>{activeReport.math_score} / {activeReport.math_max} marks</span>
                            <span className="sub-st" style={{ background: mathSt.bg, color: mathSt.color }}>{mathSt.label}</span>
                          </div>
                        </div>
                        <div className="sub-card">
                          <div className="sub-top">
                            <div className="sub-name">
                              <div className="sub-ico" style={{ background: "#e6f7f1" }}>🔬</div>
                              Science
                            </div>
                            <span className="sub-pct" style={{ color: "#1D9E75" }}>{activeReport.sci_pct}%</span>
                          </div>
                          <div className="bar-bg">
                            <div className="bar-fg" style={{ width: `${activeReport.sci_pct}%`, background: "linear-gradient(90deg,#1D9E75,#185FA5)" }} />
                          </div>
                          <div className="sub-bot">
                            <span>{activeReport.sci_score} / {activeReport.sci_max} marks</span>
                            <span className="sub-st" style={{ background: sciSt.bg, color: sciSt.color }}>{sciSt.label}</span>
                          </div>
                        </div>
                      </div>

                      <div className="stat-row">
                        {[
                          { i: "✅", v: activeReport.correct, l: "Correct", c: "#1D9E75" },
                          { i: "❌", v: activeReport.wrong, l: "Wrong", c: "#e24b4a" },
                          { i: "⬜", v: activeReport.unanswered, l: "Skipped", c: "#aaa" },
                          { i: "🎯", v: `${activeReport.overall_pct}%`, l: "Overall", c: "#185FA5" },
                        ].map((st, i) => (
                          <div className="stat-box" key={i}>
                            <div className="stat-ico">{st.i}</div>
                            <div className="stat-val" style={{ color: st.c }}>{st.v}</div>
                            <div className="stat-lbl">{st.l}</div>
                          </div>
                        ))}
                      </div>

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
                                <div style={{color:'#888', fontStyle:'italic'}}>- No chapters in this zone yet</div>
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
                                <div style={{color:'#888', fontStyle:'italic'}}>- No chapters in this zone yet</div>
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
                                <div style={{color:'#888', fontStyle:'italic'}}>- No priority chapters!</div>
                              )}
                            </div>
                          </div>

                          <div className="swot-box swot-threat">
                            <h4>T - Threat</h4>
                            <p>Higher-grade concepts directly at risk from weak areas.</p>
                            <div className="swot-zone-title">Likely consequences:</div>
                            <div className="swot-list">
                              {swot.threats.length > 0 ? (
                                swot.threats.map((t, idx) => <div key={`t-${idx}`}>- {t}</div>)
                              ) : (
                                <div style={{color:'#1D9E75', fontStyle:'italic'}}>- No immediate threat pattern detected</div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="guide-quote" style={{ marginTop: "12px", marginBottom: 0 }}>
                          {`Think of it like a building. If the foundation (${currentClass}) has cracks, we cannot safely build the first floor (${nextClass}) on top of it. Right now ${sName} has ${strengthCount} Strength chapters and ${priorityCount} Priority chapters. That is why we are having this conversation today.`}
                        </div>
                      </div>

                      {/* BLOCK 2: SKILL */}
                      <div className="report-block">
                        <div className="block-chip">BLOCK 2 - SKILL</div>
                        <div className="block-title">What is Skill Analysis? (P1 / P2 / P3)</div>
                        <div className="block-desc">
                          This section shows why errors happened, not just how many.
                          The same score can come from very different skill gaps.
                        </div>
                        <div className="guide-quote">
                          {`Every question was tagged with one of three skill levels - P1, P2 or P3. This tells us not just what ${sName} got wrong, but why. That is far more useful for planning ${sName}'s revision.`}
                        </div>

                        <div className="skill-level-wrap">
                          <div className="skill-level-card skill-c1">
                            <div className="skill-level-top">
                              <div className="skill-code">P1</div>
                              <div className="skill-head">Conceptual clarity - understanding why</div>
                            </div>
                            <div className="skill-copy">
                              Can the child recall concepts, classify, and identify core ideas before solving?
                            </div>
                          </div>

                          <div className="skill-level-card skill-c2">
                            <div className="skill-level-top">
                              <div className="skill-code">P2</div>
                              <div className="skill-head">Procedural accuracy - executing steps correctly</div>
                            </div>
                            <div className="skill-copy">
                              Can the child apply methods in sequence without missing required steps?
                            </div>
                          </div>

                          <div className="skill-level-card skill-c3">
                            <div className="skill-level-top">
                              <div className="skill-code">P3</div>
                              <div className="skill-head">Application - solving new, real-world problems</div>
                            </div>
                            <div className="skill-copy">
                              Can the child transfer concepts to unfamiliar situations and HOTS-style questions?
                            </div>
                          </div>
                        </div>

                        <div className="skill-bars">
                          <h5>{`${sName}'s skill breakdown - Mathematics and Science`}</h5>
                          {skillRows.map((row, idx) => (
                            <div className="skill-row" key={`sr-${idx}`}>
                              <div className="skill-tag">{row.code}</div>
                              <div className="skill-bar-main">
                                <div className="skill-label">{row.title}</div>
                                <div className="skill-track">
                                  <div
                                    className="skill-fill"
                                    style={{ width: `${row.pct}%`, background: row.color }}
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

                      {/* 🌸 EXACT MATCH: BLOOM'S ANALYSIS */}
                      <div className="eyebrow">🌸 Bloom's Taxonomy — Cognitive Level Analysis</div>
                      {activeReport.bloom_scores?.length > 0 ? (
                        <div className="bloom-container">
                          <div className="report-header-text">BLOOM'S TAXONOMY — COGNITIVE LEVEL ANALYSIS</div>
                          <div className="report-desc-text">
                            Bloom's Taxonomy measures HOW DEEPLY a student understands — not just WHAT they know. 6 levels from simple recall to creative thinking. This report shows cognitive gaps.
                          </div>

                          <div className="chart-title">▌ THE SIX LEVELS — Explained for Parents</div>
                          <div style={{overflowX: 'auto'}}>
                            <table className="report-table">
                              <thead>
                                <tr>
                                  <th style={{width: '10%'}}>Level</th>
                                  <th style={{width: '15%'}}>Name</th>
                                  <th style={{width: '30%'}}>Meaning</th>
                                  <th style={{width: '25%'}}>Example Q</th>
                                  <th style={{width: '5%'}}>Max Marks</th>
                                  <th style={{width: '5%'}}>Scored</th>
                                  <th style={{width: '10%'}}>Score %</th>
                                </tr>
                              </thead>
                              <tbody>
                                {BLOOM_LEVELS.map((levelObj, i) => {
                                  const dbScore = activeReport.bloom_scores?.find(b => b.bloom_level.toUpperCase().includes(levelObj.level));
                                  const maxMarks = dbScore ? dbScore.max_score : (levelObj.level === 'L6' ? '-' : 0);
                                  const scored = dbScore ? dbScore.score : (levelObj.level === 'L6' ? 'N/A' : 0);
                                  const pct = dbScore ? dbScore.pct : (levelObj.level === 'L6' ? 'N/A' : 0);

                                  return (
                                    <tr key={i}>
                                      <td style={{fontWeight:'700'}}>{levelObj.level}</td>
                                      <td className="left-align" style={{color: '#0d1f3c'}}>{levelObj.name}</td>
                                      <td className="desc-text">{levelObj.meaning}</td>
                                      <td className="desc-text" style={{fontStyle:'italic', fontSize:'12px'}}>{levelObj.example}</td>
                                      <td style={{fontWeight:'600'}}>{maxMarks}</td>
                                      <td style={{fontWeight:'600'}}>{scored}</td>
                                      <td style={{fontWeight:'800', color: pct !== 'N/A' && pct >= 50 ? '#1D9E75' : '#e24b4a'}}>{pct !== 'N/A' ? `${pct}%` : pct}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>

                          <div className="chart-title" style={{marginTop: '40px'}}>▌ VISUAL: Marks Scored vs Maximum at Each Cognitive Level</div>
                          
                          <div className="bloom-graph-wrapper">
                            <div className="bloom-grid-lines">
                              {[0, 20, 40, 60, 80, 100].map(val => (
                                <div key={val} className="bloom-grid-line">
                                  <span>{val}%</span>
                                </div>
                              ))}
                            </div>

                            {BLOOM_LEVELS.slice(0, 5).map((levelObj, i) => {
                              const dbScore = activeReport.bloom_scores?.find(b => b.bloom_level.toUpperCase().includes(levelObj.level));
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
                                  const dbScore = activeReport.bloom_scores?.find(b => b.bloom_level.toUpperCase().includes(levelObj.level));
                                  const pct = dbScore ? parseFloat(dbScore.pct) : 0;
                                  const actionMeaningMap = {
                                    'L1': 'Memory gap',
                                    'L2': 'Understanding gap',
                                    'L3': 'Cannot solve',
                                    'L4': 'Cannot analyze',
                                    'L5': 'Cannot evaluate'
                                  };

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
                          
                          <div className="purple-quote">
                            "{sName} currently struggles at every level — including basic recall (L1 at {l1Pct}%). The most urgent fix is L2 — they scored {l2Score} here, which means they are memorising facts without truly understanding them. This explains why they know a concept but cannot solve a problem with it. Fixing L2 will automatically lift L3, L4 and L5 over time."
                          </div>
                        </div>
                      ) : (
                        <div className="bloom-container" style={{textAlign:'center', color:'#888'}}>
                          No Bloom's Taxonomy data available for this test.
                        </div>
                      )}

                      {/* 📈 EXACT MATCH: CHAPTER ANALYSIS */}
                      <div className="eyebrow">📈 Chapter-wise Analysis</div>
                      {activeReport.chapter_scores?.length > 0 ? (
                        <div className="chapter-container">
                          <div className="report-header-text">Chapter-wise Analysis — All {activeReport.chapter_scores.length} Chapters</div>
                          <div className="report-desc-text">
                            Walk through the full chapter breakdown so the parent can see exactly where {sName} stands in every topic.
                          </div>

                          <div className="purple-quote">
                            "We tested {activeReport.chapter_scores.length} chapters from the Class {tClass} syllabus. Each chapter is scored and placed in one of three bands. Let me walk you through all of them so you have the complete picture."
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
                                {activeReport.chapter_scores.map((ch, i) => {
                                  const status = getChapterStatus(ch.pct);
                                  let subject = ch.subject;
                                  let risk = ch.risk_if_weak;
                                  
                                  if (!subject || !risk) {
                                    const qMatch = activeReport.questions?.find(q => q.chapter === ch.chapter);
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

                          <div className="purple-quote">
                            "{swot.weakness.length} out of {activeReport.chapter_scores.length} chapters are in the Priority zone. This tells us {sName} needs structured support before Class {tClass} begins, not after. The good news is that {swot.opportunity.length} chapters are Gap chapters — {swot.opportunity.map(o => o.chapter).join(", ") || 'none'}. Just 2-3 focused sessions each can convert these into Strengths. These are our biggest quick wins."
                          </div>

                          <div className="green-note">
                            <strong>Important note for parents:</strong> This report is not a judgment — it is a map. It tells us exactly where to go next. {sName} has shown they understand Math concepts (P1 at {activeReport.p1 || 0}%) — that is a real strength we can build on. With focused effort and the right plan, they will enter Class {tClass} on a much stronger footing.
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
                              {activeReport.questions?.map((q, i) => {
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
                      {activeReport.action_plan && (
                        <>
                          <div className="eyebrow">📝 Next Steps</div>
                          <div className="action-card">
                            <div className="report-header-text">Recommended 4-Week Action Plan</div>
                            <div className="report-desc-text">
                              Based on the data above, here is the exact roadmap to get {sName} ready for Class {tClass}.
                            </div>
                            
                            {(() => {
                              let plan = null;
                              try {
                                plan = typeof activeReport.action_plan === "string" ? JSON.parse(activeReport.action_plan) : activeReport.action_plan;
                              } catch (e) {
                                return <div className="desc-text" style={{whiteSpace:'pre-line'}}>{activeReport.action_plan}</div>;
                              }

                              if (plan && typeof plan === "object") {
                                return (
                                  <table className="report-table" style={{marginBottom: 0, background: 'white'}}>
                                    <tbody>
                                      {Object.entries(plan).map(([key, value], idx) => {
                                        const label = key.replace(/([a-zA-Z]+)(\d+)/, "$1 $2").replace(/^./, c => c.toUpperCase());
                                        return (
                                          <tr key={idx}>
                                            <td style={{width: '20%', fontWeight: '800', color: '#185FA5', background: '#f8fbff'}}>{label}</td>
                                            <td className="desc-text" style={{lineHeight: '1.6'}}>{value}</td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                );
                              }
                              return <div className="desc-text">{activeReport.action_plan}</div>;
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
    </>
  );
}