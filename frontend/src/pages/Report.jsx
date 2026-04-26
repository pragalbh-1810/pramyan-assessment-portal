import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import logo from "../assets/logo.jpeg";
import { getToken } from "../utils/auth";
import { apiUrl } from "../utils/api";

function decodeToken(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
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

function getChapterStatus(pct) {
  const p = parseFloat(pct);
  if (p >= 70) return { label: "Strength", bg: "#e6f7f1", color: "#1D9E75" };
  if (p >= 40) return { label: "Gap area", bg: "#fff4e0", color: "#d97706" };
  return { label: "Priority", bg: "#fff0f0", color: "#e24b4a" };
}

const BLOOM_LEVELS = [
  { level: 'L1', name: 'Remember', barColor: '#185FA5' },
  { level: 'L2', name: 'Understand', barColor: '#2563a8' },
  { level: 'L3', name: 'Apply', barColor: '#3a7bd5' },
  { level: 'L4', name: 'Analyze', barColor: '#1D9E75' },
  { level: 'L5', name: 'Evaluate', barColor: '#e07b2a' },
];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=DM+Sans:wght@400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  html, body {
    min-height: 100%; margin: 0;
    background: #EEF4FF;
    font-family: 'Sora', sans-serif;
  }

  .report-outer {
    min-height: 100vh;
    background: #EEF4FF;
  }

  /* ── TOPBAR ── */
  .report-topbar {
    background: linear-gradient(135deg, #1D9E75 0%, #185FA5 100%);
    padding: 0 28px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 4px 16px rgba(24,95,165,0.2);
    position: sticky;
    top: 10px;
    z-index: 100;
    border-radius: 16px;
    margin: 10px 16px 0;
  }
  .topbar-logo {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .topbar-logo img {
    height: 36px;
    border-radius: 8px;
    background: white;
    padding: 3px;
  }
  .topbar-student-info {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }
  .topbar-name {
    font-size: 13px;
    font-weight: 600;
    color: white;
    font-family: 'Inter', sans-serif;
  }
  .topbar-sub {
    font-size: 11px;
    color: rgba(255,255,255,0.7);
    font-family: 'Inter', sans-serif;
  }

  /* ── MAIN ── */
  .report-main {
    max-width: 900px;
    margin: 0 auto;
    padding: 32px 20px 60px;
    animation: fadeIn 0.5s ease both;
  }

  /* ── SECTION TITLE ── */
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

  /* ── HERO SCORE CARD ── */
  .hero-card {
    background: linear-gradient(135deg, #1D9E75 0%, #185FA5 100%);
    border-radius: 24px;
    padding: 32px;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    box-shadow: 0 8px 32px rgba(24,95,165,.2);
    animation: fadeUp .4s ease .05s both;
  }
  .hero-l { display: flex; flex-direction: column; gap: 5px; }
  .hero-tag { font-size: 12px; color: rgba(255,255,255,.8); font-family: 'Inter', sans-serif; }
  .hero-name { font-size: 22px; font-weight: 800; color: #fff; margin: 4px 0; }
  .hero-sub { font-size: 12px; color: rgba(255,255,255,.7); font-family: 'Inter', sans-serif; }
  .hero-r { display: flex; align-items: center; gap: 20px; flex-shrink: 0; }
  .perf-lbl { font-size: 14px; font-weight: 700; color: #fff; }
  .score-ring {
    width: 96px; height: 96px; border-radius: 50%;
    background: rgba(255,255,255,.15); border: 3px solid rgba(255,255,255,.4);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
  }
  .ring-num { font-size: 28px; font-weight: 800; color: #fff; line-height: 1; }
  .ring-den { font-size: 12px; color: rgba(255,255,255,.7); font-family: 'DM Sans', sans-serif; }

  /* ── SUBJECT CARDS ── */
  .sub-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; animation: fadeUp .4s ease .08s both; }
  .sub-card { background: #fff; border-radius: 18px; padding: 24px; box-shadow: 0 4px 16px rgba(24,95,165,.05); border: 1px solid #e2edf8; }
  .sub-name { font-size: 15px; font-weight: 700; color: #0d1f3c; display: flex; align-items: center; gap: 8px;}
  .sub-ico { width: 28px; height: 28px; border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 14px; }
  .sub-pct { font-size: 20px; font-weight: 800; }
  .bar-bg { height: 8px; background: #f0f4fb; border-radius: 4px; margin: 12px 0; overflow: hidden; }
  .bar-fg { height: 100%; border-radius: 4px; transition: width 1.2s ease; }
  .sub-bot { display: flex; justify-content: space-between; font-size: 11px; color: #aaa; font-family: 'DM Sans', sans-serif; align-items: center;}
  .sub-st { font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 20px; }

  /* ── STATS ROW ── */
  .stat-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; animation: fadeUp .4s ease .1s both; }
  .stat-box { background: #fff; border-radius: 16px; padding: 20px; text-align: center; border: 1px solid #e2edf8; box-shadow: 0 2px 10px rgba(24,95,165,.05); }
  .stat-ico { font-size: 18px; margin-bottom: 5px; }
  .stat-val { font-size: 22px; font-weight: 800; margin: 6px 0 2px; }
  .stat-lbl { font-size: 10px; color: #aaa; text-transform: uppercase; letter-spacing: .3px; font-family: 'DM Sans', sans-serif; }

  /* ── NOTIFICATION BANNER ── */
  .notify-banner {
    background: white; border: 1.5px solid #d4e4f7; border-radius: 16px; padding: 16px 20px;
    display: flex; align-items: center; gap: 14px; margin-bottom: 32px;
    box-shadow: 0 4px 16px rgba(24,95,165,0.05); animation: fadeInUp 0.5s ease 0.3s both;
  }
  .notify-icon { width: 40px; height: 40px; border-radius: 12px; background: #EEF4FF; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
  .notify-content { flex: 1; }
  .notify-title { font-size: 13px; font-weight: 700; color: #0d1f3c; margin-bottom: 2px; }
  .notify-text { font-size: 11.5px; color: #888; font-family: 'Inter', sans-serif; line-height: 1.5; }
  .notify-badge { background: linear-gradient(135deg, #1D9E75, #185FA5); color: white; font-size: 10px; font-weight: 700; padding: 4px 10px; border-radius: 20px; font-family: 'Inter', sans-serif; white-space: nowrap; flex-shrink: 0; }

  /* ── BLURRED SECTIONS ── */
  .blurred-section { position: relative; margin-bottom: 24px; border-radius: 20px; overflow: hidden; animation: fadeInUp 0.5s ease 0.35s both; }
  .blur-content { filter: blur(6px); pointer-events: none; user-select: none; }
  .blur-overlay { position: absolute; inset: 0; background: rgba(238,244,255,0.6); display: flex; align-items: center; justify-content: center; z-index: 10; border-radius: 20px; backdrop-filter: blur(2px); }
  .blur-msg { background: white; border-radius: 16px; padding: 20px 24px; text-align: center; box-shadow: 0 8px 24px rgba(24,95,165,0.15); border: 1.5px solid #d4e4f7; max-width: 280px; }
  .blur-msg-icon { font-size: 28px; margin-bottom: 6px; }
  .blur-msg-title { font-size: 14px; font-weight: 700; color: #0d1f3c; margin-bottom: 4px; }
  .blur-msg-text { font-size: 11.5px; color: #888; font-family: 'Inter', sans-serif; line-height: 1.5; }

  .blurred-card { background: white; border-radius: 20px; padding: 32px; box-shadow: 0 4px 24px rgba(24,95,165,0.06); border: 1px solid #e2edf8; }
  .blurred-title { font-size: 16px; font-weight: 800; color: #0d1f3c; margin-bottom: 20px; font-family:'Sora', sans-serif; }
  .fake-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .fake-cell { height: 80px; background: #f0f4fb; border-radius: 12px; }
  .fake-bar-row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
  .fake-label { width: 140px; height: 14px; background: #e2edf8; border-radius: 4px; flex-shrink: 0; }
  .fake-bar { flex: 1; height: 14px; border-radius: 4px; }
  .fake-pct { width: 40px; height: 14px; background: #e2edf8; border-radius: 4px; flex-shrink: 0; }

  @media (max-width: 768px) {
    .report-outer .report-topbar { padding: 10px 16px !important; margin: 10px !important; }
    .hero-card { flex-direction: column; align-items: stretch; padding: 24px; text-align: left; }
    .hero-r { flex-direction: row; justify-content: space-between; align-items: center; width: 100%; margin-top: 10px;}
    .hero-r > div { text-align: left !important; }
    .sub-grid { grid-template-columns: 1fr; }
    .stat-row { grid-template-columns: repeat(2, 1fr); }
    .notify-banner { flex-direction: column; text-align: center; padding: 24px 20px; }
    .notify-badge { align-self: center; margin-top: 8px;}
    .fake-grid { grid-template-columns: 1fr; }
    .fake-label { width: 80px; }
  }
`;

export default function Report() {
  const navigate = useNavigate();
  const { testId } = useParams();
  const [report, setReport] = useState(null);
  const [studentName, setStudentName] = useState("Student");
  
  // Role verification state
  const [userRole, setUserRole] = useState("student");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get("token");
    if (urlToken) localStorage.setItem("token", urlToken);
    
    const token = urlToken || getToken();
    const decoded = decodeToken(token);
    
    if (decoded?.name) setStudentName(decoded.name);
    if (decoded?.role) setUserRole(decoded.role); 
    
    fetchReport(token);
  }, [testId]);

  const fetchReport = async (token) => {
    try {
      const res = await fetch(apiUrl(`get-report.php?test_id=${testId}`), { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      const result = await res.json();
      if (result.success) {
        setReport(result);
      } else {
        setReport(null);
      }
    } catch {
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="report-outer">
          <div className="report-topbar">
            <div className="topbar-logo"><img src={logo} alt="Pramyan" /></div>
          </div>
          <div style={{ display: "flex", justifyContent: "center", padding: "80px", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            <div style={{ fontSize: "32px" }}>⏳</div>
            <p style={{ color: "#888", fontFamily: "Inter, sans-serif", fontSize: "14px" }}>Loading your results...</p>
          </div>
        </div>
      </>
    );
  }

  if (!report) {
    return (
      <>
        <style>{styles}</style>
        <div className="report-outer">
          <div className="report-topbar">
            <div className="topbar-logo"><img src={logo} alt="Pramyan" /></div>
          </div>
          <div style={{ display: "flex", justifyContent: "center", padding: "80px", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            <div style={{ fontSize: "32px" }}>⚠️</div>
            <p style={{ color: "#888", fontFamily: "Inter, sans-serif", fontSize: "14px" }}>Report not available. Please complete the test first.</p>
          </div>
        </div>
      </>
    );
  }

  // 👇 ========================================================
  // DYNAMIC RECALCULATION ENGINE 
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

  // BOOLEAN TO CHECK IF USER IS PRIVILEGED
  // Change to "true" manually here if you want to test the unlocked state on your machine
  const isAuthorized = userRole === "admin" || userRole === "teacher";

  return (
    <>
      <style>{styles}</style>
      <div className="report-outer">
        
        {/* TOPBAR */}
        <div className="report-topbar">
          <div className="topbar-logo">
            <img src={logo} alt="Pramyan" />
          </div>
          <div className="topbar-student-info">
            <span className="topbar-name">{studentName}</span>
            <span className="topbar-sub">Diagnostic Assessment Report</span>
          </div>
        </div>

        <div className="report-main">
          
          {/* HERO SCORE CARD */}
          <div className="eyebrow">📊 Overall Score</div>
          <div className="hero-card">
            <div className="hero-l">
              <span className="hero-tag">Diagnostic Assessment Result</span>
              <span className="hero-name">{studentName.split(" ")[0]}'s Report</span>
              <span className="hero-sub">Pramyan Foundational Assessment</span>
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

          {/* SUBJECT CARDS */}
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
                <div className="bar-fg" style={{ width: `${activeReport.math_pct}%`, background: "linear-gradient(90deg, #185FA5, #1D9E75)" }} />
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
                <div className="bar-fg" style={{ width: `${activeReport.sci_pct}%`, background: "linear-gradient(90deg, #1D9E75, #185FA5)" }} />
              </div>
              <div className="sub-bot">
                <span>{activeReport.sci_score} / {activeReport.sci_max} marks</span>
                <span className="sub-st" style={{ background: sciSt.bg, color: sciSt.color }}>{sciSt.label}</span>
              </div>
            </div>
          </div>

          {/* STATS ROW */}
          <div className="stat-row">
            <div className="stat-box">
              <div className="stat-ico">✅</div>
              <div className="stat-val" style={{ color: "#1D9E75" }}>{activeReport.correct}</div>
              <div className="stat-lbl">Correct</div>
            </div>
            <div className="stat-box">
              <div className="stat-ico">❌</div>
              <div className="stat-val" style={{ color: "#e24b4a" }}>{activeReport.wrong}</div>
              <div className="stat-lbl">Wrong</div>
            </div>
            <div className="stat-box">
              <div className="stat-ico">⬜</div>
              <div className="stat-val" style={{ color: "#aaa" }}>{activeReport.unanswered}</div>
              <div className="stat-lbl">Skipped</div>
            </div>
            <div className="stat-box">
              <div className="stat-ico">🎯</div>
              <div className="stat-val">{activeReport.overall_pct}%</div>
              <div className="stat-lbl">Overall</div>
            </div>
          </div>

          {/* NOTIFICATION BANNER: Only show to Students */}
          {!isAuthorized && (
            <div className="notify-banner">
              <div className="notify-icon">🔔</div>
              <div className="notify-content">
                <div className="notify-title">Deep Dive Analysis Available with Your Teacher</div>
                <div className="notify-text">
                  Your detailed SWOT Analysis, Bloom's Taxonomy report, and Question-by-Question breakdown are available in the Teacher Portal. Reach out to discuss your custom action plan.
                </div>
              </div>
              <div className="notify-badge">Teacher Only</div>
            </div>
          )}

          {/* BLURRED — CHAPTER ANALYSIS */}
          <div className="eyebrow">📈 Chapter-wise Analysis</div>
          {isAuthorized ? (
             <div className="blurred-card">
                 <div className="blurred-title">To view exact Chapter details, log in as a Teacher.</div>
             </div>
          ) : (
            <div className="blurred-section">
              <div className="blur-content">
                <div className="blurred-card">
                  <div className="blurred-title">📈 Chapter Performance Matrix</div>
                  {[...Array(5)].map((_, i) => (
                    <div className="fake-bar-row" key={i}>
                      <div className="fake-label" />
                      <div className="fake-bar" style={{background: '#e2edf8'}} />
                      <div className="fake-pct" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="blur-overlay">
                <div className="blur-msg">
                  <div className="blur-msg-icon">🔒</div>
                  <div className="blur-msg-title">Teacher Only</div>
                  <div className="blur-msg-text">
                    Detailed Chapter SWOT Matrix (Strengths, Weaknesses, Opportunities, Threats) is locked. Contact your teacher.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BLURRED — SKILL ANALYSIS */}
          <div className="eyebrow">🎯 Concept vs Procedure</div>
          {isAuthorized ? (
            <div className="blurred-card">
                 <div className="blurred-title">To view exact Skill breakdown, log in as a Teacher.</div>
             </div>
          ) : (
            <div className="blurred-section">
              <div className="blur-content">
                <div className="blurred-card">
                  <div className="blurred-title">🎯 P1 · P2 · P3 Skill Breakdown</div>
                  <div className="fake-grid">
                    {[...Array(3)].map((_, i) => (
                      <div className="fake-cell" key={i} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="blur-overlay">
                <div className="blur-msg">
                  <div className="blur-msg-icon">🔒</div>
                  <div className="blur-msg-title">Teacher Only</div>
                  <div className="blur-msg-text">
                    Skill analysis (P1 Conceptual Clarity, P2 Procedural Accuracy, P3 Application) is visible to your teacher only.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BLURRED — BLOOM'S ANALYSIS */}
          <div className="eyebrow">🌸 Bloom's Taxonomy</div>
          {isAuthorized ? (
            <div className="blurred-card">
                 <div className="blurred-title">To view exact Bloom's levels, log in as a Teacher.</div>
             </div>
          ) : (
            <div className="blurred-section">
              <div className="blur-content">
                <div className="blurred-card">
                  <div className="blurred-title">🌸 Bloom's Cognitive Levels</div>
                  {BLOOM_LEVELS.map((level, i) => (
                    <div className="fake-bar-row" key={i}>
                      <div className="fake-label" />
                      <div className="fake-bar" style={{ background: `hsl(${160 + i * 15}, 50%, 75%)` }} />
                      <div className="fake-pct" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="blur-overlay">
                <div className="blur-msg">
                  <div className="blur-msg-icon">🔒</div>
                  <div className="blur-msg-title">Teacher Only</div>
                  <div className="blur-msg-text">
                    Bloom's cognitive level analysis (L1 Remember to L5 Evaluate) is available to your teacher only.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BLURRED — SCORE ENTRY */}
          <div className="eyebrow">📋 Question-wise Breakdown</div>
          {isAuthorized ? (
            <div className="blurred-card">
                 <div className="blurred-title">To view the raw question data, log in as a Teacher.</div>
             </div>
          ) : (
            <div className="blurred-section">
              <div className="blur-content">
                <div className="blurred-card">
                  <div className="blurred-title">📋 Score Entry Sheet</div>
                  <div className="fake-grid">
                    {[...Array(6)].map((_, i) => (
                      <div className="fake-cell" key={i} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="blur-overlay">
                <div className="blur-msg">
                  <div className="blur-msg-icon">🔒</div>
                  <div className="blur-msg-title">Teacher Only</div>
                  <div className="blur-msg-text">
                    Detailed question-by-question breakdown, including correct/incorrect options, is locked.
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}