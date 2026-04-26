import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import logo from "../assets/logo.jpeg";
import { getToken } from "../utils/auth";
import { apiUrl } from "../utils/api";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=Inter:wght@400;500&display=swap');

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
    background: linear-gradient(145deg, #1D9E75 0%, #185FA5 100%);
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
    padding: 28px 20px 48px;
    animation: fadeIn 0.5s ease both;
  }

  /* ── SECTION TITLE ── */
  .section-label {
    font-size: 10px;
    font-weight: 700;
    color: #185FA5;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    margin-bottom: 12px;
    font-family: 'Inter', sans-serif;
  }

  /* ── HERO SCORE CARD ── */
  .hero-card {
    background: linear-gradient(145deg, #1D9E75 0%, #185FA5 100%);
    border-radius: 24px;
    padding: 28px 32px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    box-shadow: 0 8px 32px rgba(24,95,165,0.2);
    animation: fadeInUp 0.5s ease both;
  }
  .hero-left {
    display: flex;
    flex-direction: column;
    gap: 6px;
    text-align: left;
  }
  .hero-greeting {
    font-size: 13px;
    color: rgba(255,255,255,0.8);
    font-family: 'Inter', sans-serif;
  }
  .hero-name {
    font-size: 22px;
    font-weight: 700;
    color: white;
  }
  .hero-test {
    font-size: 12px;
    color: rgba(255,255,255,0.7);
    font-family: 'Inter', sans-serif;
  }
  .hero-right {
    display: flex;
    align-items: center;
    gap: 24px;
    flex-shrink: 0;
  }
  .score-circle {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: rgba(255,255,255,0.15);
    border: 3px solid rgba(255,255,255,0.4);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .score-num {
    font-size: 28px;
    font-weight: 700;
    color: white;
    line-height: 1;
  }
  .score-total {
    font-size: 12px;
    color: rgba(255,255,255,0.7);
    font-family: 'Inter', sans-serif;
  }

  /* ── SUBJECT CARDS ── */
  .subject-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    margin-bottom: 20px;
    animation: fadeInUp 0.5s ease 0.1s both;
  }
  .subject-card {
    background: white;
    border-radius: 18px;
    padding: 20px;
    box-shadow: 0 2px 16px rgba(24,95,165,0.07);
    border: 1.5px solid #f0f4fb;
  }
  .subject-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }
  .subject-name {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 700;
    color: #0d1f3c;
  }
  .subject-icon {
    width: 32px;
    height: 32px;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
  }
  .subject-pct {
    font-size: 22px;
    font-weight: 700;
  }
  .progress-bar-wrap {
    height: 8px;
    background: #f0f4fb;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 10px;
  }
  .progress-bar-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 1s ease;
  }
  .subject-stats {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: #888;
    font-family: 'Inter', sans-serif;
  }

  /* ── STATS ROW ── */
  .stats-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 20px;
    animation: fadeInUp 0.5s ease 0.15s both;
  }
  .stat-card {
    background: white;
    border-radius: 14px;
    padding: 16px;
    text-align: center;
    box-shadow: 0 2px 12px rgba(24,95,165,0.06);
    border: 1.5px solid #f0f4fb;
  }
  .stat-icon { font-size: 20px; margin-bottom: 6px; }
  .stat-value { font-size: 20px; font-weight: 700; color: #0d1f3c; margin-bottom: 2px; }
  .stat-label { font-size: 10px; color: #999; font-family: 'Inter', sans-serif; text-transform: uppercase; }

  /* ── SWOT CHAPTER ANALYSIS ── */
  .swot-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 24px;
    animation: fadeInUp 0.5s ease 0.2s both;
  }
  .swot-card {
    border-radius: 18px;
    padding: 20px;
    border: 1.5px solid transparent;
    display: flex;
    flex-direction: column;
  }
  .swot-card.strength { background: #f0fdf4; border-color: #bbf7d0; }
  .swot-card.opportunity { background: #fffbeb; border-color: #fef08a; }
  .swot-card.weakness { background: #fef2f2; border-color: #fecaca; }

  .swot-header {
    font-weight: 700;
    font-size: 15px;
    color: #0d1f3c;
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .swot-desc {
    font-size: 11px;
    color: #666;
    margin-bottom: 16px;
    font-family: 'Inter', sans-serif;
    line-height: 1.4;
  }
  .swot-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
  }
  .swot-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: white;
    padding: 12px 14px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  }
  .swot-item-name { font-size: 12px; font-weight: 600; color: #1a1a1a; line-height: 1.3;}
  .swot-item-score { font-size: 13px; font-weight: 700; }

  /* ── BLOOM'S ANALYSIS TABLE ── */
  .bloom-container {
    background: white;
    padding: 0;
    border: none;
    box-shadow: none;
    margin-bottom: 24px;
    animation: fadeInUp 0.5s ease 0.25s both;
  }
  .bloom-header-text {
    font-size: 24px;
    font-weight: 700;
    color: #185FA5;
    margin-bottom: 8px;
    font-family: 'Inter', sans-serif;
  }
  .bloom-desc-text {
    font-size: 13px;
    color: #444;
    margin-bottom: 16px;
    font-family: 'Inter', sans-serif;
    line-height: 1.5;
  }
  .bloom-purple-quote {
    background-color: #efebf5;
    border-left: 4px solid #8e62b6;
    padding: 16px;
    margin-bottom: 24px;
    font-style: italic;
    color: #49335e;
    font-size: 13px;
    font-family: 'Inter', sans-serif;
    line-height: 1.5;
  }
  .bloom-table {
    width: 100%;
    border-collapse: collapse;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    margin-bottom: 24px;
  }
  .bloom-table th {
    background: #234674;
    color: white;
    font-weight: 600;
    padding: 12px;
    text-align: center;
    border: 1px solid #234674;
  }
  .bloom-table td {
    padding: 12px;
    border: 1px solid #e2edf8;
    text-align: center;
    color: #333;
  }
  .bloom-table td.left-align {
    text-align: left;
    font-weight: 600;
  }
  .bloom-chart-section {
    margin-bottom: 24px;
  }
  .bloom-chart-title {
    font-weight: 700;
    font-size: 14px;
    margin-bottom: 16px;
    font-family: 'Inter', sans-serif;
    color: #1a1a1a;
  }
  .bloom-bar-row {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    gap: 16px;
  }
  .bloom-bar-label {
    width: 140px;
    font-size: 13px;
    font-family: 'Inter', sans-serif;
    text-align: right;
  }
  .bloom-bar-bg {
    flex: 1;
    height: 12px;
    background: #e2edf8;
    border-radius: 6px;
    overflow: hidden;
  }
  .bloom-bar-fill {
    height: 100%;
    border-radius: 6px;
  }
  .bloom-bar-pct {
    width: 40px;
    font-size: 13px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    text-align: right;
  }
  .bloom-actions-table {
    width: 100%;
    border-collapse: collapse;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    margin-bottom: 24px;
  }
  .bloom-actions-table td {
    padding: 12px;
    border: 1px solid #e2edf8;
    line-height: 1.5;
    background: white;
  }

  /* ── NOTIFICATION BANNER ── */
  .notify-banner {
    background: white;
    border: 1.5px solid #d4e4f7;
    border-radius: 16px;
    padding: 16px 20px;
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 20px;
    box-shadow: 0 2px 12px rgba(24,95,165,0.06);
    animation: fadeInUp 0.5s ease 0.3s both;
  }
  .notify-icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: #EEF4FF;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
  }
  .notify-content { flex: 1; }
  .notify-title { font-size: 13px; font-weight: 700; color: #0d1f3c; margin-bottom: 2px; }
  .notify-text { font-size: 11.5px; color: #888; font-family: 'Inter', sans-serif; line-height: 1.5; }
  .notify-badge {
    background: linear-gradient(135deg, #1D9E75, #185FA5);
    color: white;
    font-size: 10px;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 20px;
    font-family: 'Inter', sans-serif;
    white-space: nowrap;
  }

  /* ── BLURRED SECTIONS ── */
  .blurred-section {
    position: relative;
    margin-bottom: 20px;
    border-radius: 18px;
    overflow: hidden;
    animation: fadeInUp 0.5s ease 0.35s both;
  }
  .blur-content { filter: blur(5px); pointer-events: none; user-select: none; }
  .blur-overlay {
    position: absolute;
    inset: 0;
    background: rgba(238,244,255,0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    border-radius: 18px;
    backdrop-filter: blur(2px);
  }
  .blur-msg {
    background: white;
    border-radius: 16px;
    padding: 16px 24px;
    text-align: center;
    box-shadow: 0 8px 24px rgba(24,95,165,0.15);
    border: 1.5px solid #d4e4f7;
    max-width: 280px;
  }
  .blur-msg-icon { font-size: 28px; margin-bottom: 6px; }
  .blur-msg-title { font-size: 13px; font-weight: 700; color: #0d1f3c; margin-bottom: 4px; }
  .blur-msg-text { font-size: 11px; color: #888; font-family: 'Inter', sans-serif; line-height: 1.5; }

  .blurred-card {
    background: white;
    border-radius: 18px;
    padding: 20px;
    box-shadow: 0 2px 16px rgba(24,95,165,0.07);
    border: 1.5px solid #f0f4fb;
  }
  .blurred-title { font-size: 14px; font-weight: 700; color: #0d1f3c; margin-bottom: 16px; }
  .fake-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .fake-cell { height: 60px; background: #f0f4fb; border-radius: 10px; }
  .fake-bar-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
  .fake-label { width: 120px; height: 12px; background: #e2edf8; border-radius: 4px; flex-shrink: 0; }
  .fake-bar { flex: 1; height: 12px; border-radius: 4px; }
  .fake-pct { width: 36px; height: 12px; background: #e2edf8; border-radius: 4px; flex-shrink: 0; }

  /* ── CHAPTER ANALYSIS TABLE ── */
  .chapter-container {
    background: white;
    padding: 0;
    border: none;
    box-shadow: none;
    margin-bottom: 24px;
    animation: fadeInUp 0.5s ease 0.2s both;
  }
  .chapter-header-text {
    font-size: 24px;
    font-weight: 700;
    color: #185FA5;
    margin-bottom: 8px;
    font-family: 'Inter', sans-serif;
  }
  .chapter-desc-text {
    font-size: 13px;
    color: #444;
    margin-bottom: 16px;
    font-family: 'Inter', sans-serif;
    line-height: 1.5;
  }
  .chapter-purple-quote {
    background-color: #efebf5;
    border-left: 4px solid #8e62b6;
    padding: 16px;
    margin-bottom: 24px;
    font-style: italic;
    color: #49335e;
    font-size: 13px;
    font-family: 'Inter', sans-serif;
    line-height: 1.5;
  }
  .chapter-table {
    width: 100%;
    border-collapse: collapse;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    margin-bottom: 24px;
  }
  .chapter-table th {
    background: #234674;
    color: white;
    font-weight: 600;
    padding: 12px;
    text-align: center;
    border: 1px solid #234674;
  }
  .chapter-table td {
    padding: 12px;
    border: 1px solid #e2edf8;
    text-align: center;
    color: #333;
  }
  .chapter-table td.left-align {
    text-align: left;
    font-weight: 600;
  }
  .chapter-table td.risk-text {
    text-align: left;
    color: #666;
    font-size: 12px;
  }
  .chapter-status-badge {
    font-weight: 700;
  }
  .chapter-green-note {
    background-color: #e6f7f1;
    border: 2px solid #a3e6cd;
    padding: 16px;
    border-radius: 8px;
    font-size: 13px;
    color: #1a4f3e;
    font-family: 'Inter', sans-serif;
    line-height: 1.5;
    margin-bottom: 24px;
  }

  @media (max-width: 768px) {
    .swot-grid { grid-template-columns: 1fr; gap: 12px; }
    .report-outer .stats-row { grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .report-outer .subject-row { grid-template-columns: 1fr; gap: 10px; }
    .report-outer .hero-card { flex-direction: column; text-align: left; align-items: stretch; }
    .report-outer .hero-right { align-self: stretch; justify-content: space-between; }
    
    .report-outer .notify-banner {
      flex-direction: column; text-align: center; padding: 20px;
    }
    .chapter-table, .bloom-table, .bloom-actions-table { display: block; overflow-x: auto; white-space: nowrap; }
  }
`;

function decodeToken(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

function getPerformanceLabel(pct) {
  if (pct >= 80) return { label: "Excellent", emoji: "🏆", color: "#1D9E75" };
  if (pct >= 60) return { label: "Good", emoji: "👍", color: "#185FA5" };
  if (pct >= 40) return { label: "Average", emoji: "📈", color: "#e07b2a" };
  return { label: "Needs Work", emoji: "💪", color: "#e24b4a" };
}

function getSubjectStatus(pct) {
  if (pct >= 80) return { label: "✅ Strong", bg: "#e6f7f1", color: "#1D9E75" };
  if (pct >= 50) return { label: "⚠️ Average", bg: "#fff4e6", color: "#e07b2a" };
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

// FIX: ADDED MISSING BRACE HERE
function getChapterStatus(pct) {
  const p = parseFloat(pct);
  if (p >= 70) return { label: "Strength", bg: "#e6f7f1", color: "#1D9E75" };
  if (p >= 40) return { label: "Gap area", bg: "#fcebc5", color: "#a06a1b" };
  return { label: "Priority", bg: "#fbeae9", color: "#c94a4a" };
}

const BLOOM_LEVELS = [
  { level: 'L1', name: 'Remember', meaning: 'Recall facts & definitions', action: 'Memory gaps. Daily 10-minute flashcard drill — key terms, definitions, facts from each chapter.', barColor: '#E88E35' },
  { level: 'L2', name: 'Understand', meaning: 'Explain & interpret concepts', action: 'Memorised without meaning. Always ask \'why?\' and \'how?\'. Use real-life examples and drawings.', barColor: '#E25844' },
  { level: 'L3', name: 'Apply', meaning: 'Use formulas to solve', action: 'Cannot execute procedures. Walk through NCERT solved examples one step at a time — identify exactly which step fails.', barColor: '#E85F2C' },
  { level: 'L4', name: 'Analyze', meaning: 'Reason across multiple steps', action: 'Cannot think in multiple steps. Teach: read -> identify what is given -> plan -> solve. Practice multi-step problems.', barColor: '#E85F2C' },
  { level: 'L5', name: 'Evaluate', meaning: 'Judge & synthesise ideas', action: 'No higher-order thinking yet. Practice HOTS and competency-based questions from CBSE Class 5 & 6 banks.', barColor: '#4A8CDB' },
];

export default function Report() {
  const navigate = useNavigate();
  const { testId } = useParams();
  const [report, setReport] = useState(null);
  const [studentName, setStudentName] = useState("Student");
  
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

  const perf = getPerformanceLabel(report.overall_pct);
  const mathStatus = getSubjectStatus(report.math_pct);
  const sciStatus = getSubjectStatus(report.sci_pct);

  const chapters = report.chapter_scores || [];
  const strengths = chapters.filter(c => c.pct >= 70);
  const opportunities = chapters.filter(c => c.pct >= 40 && c.pct < 70);
  const weaknesses = chapters.filter(c => c.pct < 40);

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
          <div className="section-label">📊 Your Result</div>
          <div className="hero-card">
            <div className="hero-left">
              <span className="hero-greeting">Test Completed!</span>
              <span className="hero-name">{studentName.split(" ")[0]}, here's your score</span>
              <span className="hero-test">Pramyan Diagnostic Assessment</span>
            </div>
            <div className="hero-right">
              <div className="score-circle">
                <span className="score-num">{report.total_score}</span>
                <span className="score-total">/ {report.max_score}</span>
              </div>
            </div>
          </div>

          {/* SUBJECT CARDS */}
          <div className="section-label">📚 Subject-wise Score</div>
          <div className="subject-row">
            <div className="subject-card">
              <div className="subject-header">
                <div className="subject-name">
                  <div className="subject-icon" style={{ background: "#EEF4FF" }}>📐</div>
                  Mathematics
                </div>
                <span className="subject-pct" style={{ color: "#185FA5" }}>{report.math_pct}%</span>
              </div>
              <div className="progress-bar-wrap">
                <div className="progress-bar-fill" style={{ width: `${report.math_pct}%`, background: "linear-gradient(90deg, #185FA5, #1D9E75)" }} />
              </div>
              <div className="subject-stats">
                <span>{report.math_score} / {report.math_max} marks</span>
                <span className="subject-status" style={{ background: mathStatus.bg, color: mathStatus.color }}>{mathStatus.label}</span>
              </div>
            </div>

            <div className="subject-card">
              <div className="subject-header">
                <div className="subject-name">
                  <div className="subject-icon" style={{ background: "#e6f7f1" }}>🔬</div>
                  Science
                </div>
                <span className="subject-pct" style={{ color: "#1D9E75" }}>{report.sci_pct}%</span>
              </div>
              <div className="progress-bar-wrap">
                <div className="progress-bar-fill" style={{ width: `${report.sci_pct}%`, background: "linear-gradient(90deg, #1D9E75, #185FA5)" }} />
              </div>
              <div className="subject-stats">
                <span>{report.sci_score} / {report.sci_max} marks</span>
                <span className="subject-status" style={{ background: sciStatus.bg, color: sciStatus.color }}>{sciStatus.label}</span>
              </div>
            </div>
          </div>

          {/* STATS ROW */}
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-value" style={{ color: "#1D9E75" }}>{report.correct}</div>
              <div className="stat-label">Correct</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">❌</div>
              <div className="stat-value" style={{ color: "#e24b4a" }}>{report.wrong}</div>
              <div className="stat-label">Wrong</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⬜</div>
              <div className="stat-value" style={{ color: "#aaa" }}>{report.unanswered}</div>
              <div className="stat-label">Skipped</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-value">{report.overall_pct}%</div>
              <div className="stat-label">Overall</div>
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

          {/* 🚀 EXACT MATCH: CHAPTER-WISE ANALYSIS TABLE */}
          <div className="section-label">📈 Chapter Analysis — All {chapters.length} Chapters</div>
          {isAuthorized ? (
            chapters.length > 0 ? (
              <div className="chapter-container">
                <div className="chapter-desc-text" style={{ padding: '0' }}>
                  Walk through the full chapter breakdown so the parent can see exactly where {studentName.split(" ")[0]} stands in every topic.
                </div>

                <div className="chapter-purple-quote" style={{ margin: '16px 0' }}>
                  "We tested {chapters.length} chapters from the Class {report.test_class || '10'} syllabus. Each chapter is scored and placed in one of three bands. Let me walk you through all of them so you have the complete picture."
                </div>

                <div className="chapter-table-wrap" style={{ overflowX: 'auto' }}>
                  <table className="chapter-table" style={{ width: '100%' }}>
                    <thead>
                      <tr>
                        <th>Chapter</th>
                        <th>Subject</th>
                        <th>Marks</th>
                        <th>Score %</th>
                        <th>Status</th>
                        <th>Class {report.test_class || '10'} Risk if Weak</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chapters.map((ch, i) => {
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
                        
                        subject = subject || "N/A";
                        risk = risk || `Class ${report.test_class || '10'} related topics`;

                        return (
                          <tr key={i}>
                            <td className="left-align">{ch.chapter}</td>
                            <td style={{fontWeight: '600'}}>{subject}</td>
                            <td style={{fontWeight: '600'}}>{ch.score} / {ch.max_score}</td>
                            <td style={{fontWeight: '700', color: status.color}}>{ch.pct}%</td>
                            <td style={{background: status.bg, color: status.color}} className="chapter-status-badge">
                              {status.label}
                            </td>
                            <td className="risk-text">{risk}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="chapter-purple-quote">
                  "{weaknesses.length} out of {chapters.length} chapters are in the Priority zone. This tells us {studentName.split(" ")[0]} needs structured support before Class {report.test_class || '10'} begins, not after. The good news is that {opportunities.length} chapters are Gap chapters — {opportunities.map(o => o.chapter).join(", ") || 'none'}. Just 2-3 focused sessions each can convert these into Strengths. These are our biggest quick wins."
                </div>

                <div className="chapter-green-note">
                  <strong>Important note for parents:</strong> This report is not a judgment — it is a map. It tells us exactly where to go next. {studentName.split(" ")[0]} has shown they understand Math concepts (P1 at {report.p1 || 0}%) — that is a real strength we can build on. With focused effort and the right plan, they will enter Class {report.test_class || '10'} on a much stronger footing.
                </div>
              </div>
            ) : (
              <p style={{fontSize: '12px', color: '#888'}}>No Chapter Analysis data available for this test.</p>
            )
          ) : (
            <div className="blurred-section">
              <div className="blur-content">
                <div className="blurred-card">
                  <div className="blurred-title">📈 Chapter-wise Performance</div>
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
                    Chapter analysis is available only to your teacher and admin. Contact your teacher to see this report.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 🚀 EXACT MATCH: BLOOM'S COGNITIVE ANALYSIS TABLE */}
          <div className="section-label">🌸 Bloom's Taxonomy — Cognitive Level Analysis</div>
          {isAuthorized ? (
            <div className="bloom-container">
              <div className="bloom-header-text">What is Bloom's Taxonomy Analysis?</div>
              <div className="bloom-desc-text">
                Bloom's tells us how deeply {studentName.split(" ")[0]} thinks — not just what they know, but at which cognitive level they can operate. There are 5 levels tested in this paper.
              </div>
              
              <div className="bloom-purple-quote">
                "Beyond chapters and skills, we also measure how deeply {studentName.split(" ")[0]} processes information. Think of it as five floors of a building. Most students only live on the ground floor (remembering facts). Class {report.test_class || '10'} expects students on floors 3 and 4 regularly. Let me show you where {studentName.split(" ")[0]} currently stands."
              </div>

              <div className="bloom-table-wrap">
                <table className="bloom-table">
                  <thead>
                    <tr>
                      <th style={{width: '20%'}}>Level</th>
                      <th style={{width: '35%'}}>What it means</th>
                      <th style={{width: '15%'}}>Marks</th>
                      <th style={{width: '15%'}}>Score %</th>
                      <th style={{width: '15%'}}>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {BLOOM_LEVELS.map((levelObj, i) => {
                      const dbScore = report.bloom_scores?.find(b => b.bloom_level.toUpperCase().includes(levelObj.level));
                      const maxMarks = dbScore ? dbScore.max_score : 0;
                      const scored = dbScore ? dbScore.score : 0;
                      const pct = dbScore ? dbScore.pct : 0;
                      const result = getBloomResult(pct);

                      return (
                        <tr key={i}>
                          <td className="left-align">{levelObj.level} — {levelObj.name}</td>
                          <td className="left-align">{levelObj.meaning}</td>
                          <td>{scored} / {maxMarks}</td>
                          <td style={{fontWeight: '700'}}>{pct}%</td>
                          <td style={{background: result.bg, color: result.color, fontWeight: '600'}}>
                            {result.label}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="bloom-chart-section">
                <div className="bloom-chart-title">Visual score at each cognitive level:</div>
                {BLOOM_LEVELS.map((levelObj, i) => {
                  const dbScore = report.bloom_scores?.find(b => b.bloom_level.toUpperCase().includes(levelObj.level));
                  const pct = dbScore ? dbScore.pct : 0;

                  return (
                    <div className="bloom-bar-row" key={i}>
                      <div className="bloom-bar-label">{levelObj.level} — {levelObj.name}</div>
                      <div className="bloom-bar-bg">
                        <div className="bloom-bar-fill" style={{ width: `${pct}%`, background: levelObj.barColor }} />
                      </div>
                      <div className="bloom-bar-pct">{pct}%</div>
                    </div>
                  );
                })}
              </div>

              <div className="bloom-chart-section">
                <div className="bloom-chart-title">What to do at each level — specific actions:</div>
                <div className="bloom-table-wrap">
                  <table className="bloom-actions-table">
                    <tbody>
                      {BLOOM_LEVELS.map((levelObj, i) => {
                        const dbScore = report.bloom_scores?.find(b => b.bloom_level.toUpperCase().includes(levelObj.level));
                        const pct = dbScore ? dbScore.pct : 0;
                        const result = getBloomResult(pct);

                        return (
                          <tr key={i}>
                            <td style={{width: '20%', fontWeight: '700', color: result.color, textAlign: 'center'}}>
                              {levelObj.level} — {pct}%
                            </td>
                            <td style={{width: '80%'}}>
                              {levelObj.action}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bloom-purple-quote">
                "{studentName.split(" ")[0]} currently struggles at every level — including basic recall (L1 at {report.bloom_scores?.find(b => b.bloom_level.toUpperCase().includes('L1'))?.pct || 0}%). The most urgent fix is L2 — they scored {report.bloom_scores?.find(b => b.bloom_level.toUpperCase().includes('L2'))?.score || 0} here, which means they are memorising facts without truly understanding them. This explains why they know a concept but cannot solve a problem with it. Fixing L2 will automatically lift L3, L4 and L5 over time."
              </div>
            </div>
          ) : (
            <div className="blurred-section">
              <div className="blur-content">
                <div className="blurred-card">
                  <div className="blurred-title">🌸 Bloom's Taxonomy Report</div>
                  <table className="bloom-table" style={{ width: '100%', filter: 'blur(2px)' }}>
                    <thead>
                      <tr><th>Level</th><th>Name</th><th>Max Marks</th><th>Score %</th></tr>
                    </thead>
                    <tbody>
                      {[...Array(5)].map((_, i) => (
                        <tr key={i}>
                          <td>L{i+1}</td>
                          <td>Loading...</td>
                          <td>0</td>
                          <td>0%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="blur-overlay">
                <div className="blur-msg">
                  <div className="blur-msg-icon">🔒</div>
                  <div className="blur-msg-title">Teacher Only</div>
                  <div className="blur-msg-text">
                    Bloom's cognitive level analysis is available to your teacher only. Ask them to share your results!
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SKILL ANALYSIS */}
          <div className="section-label">🎯 Skill Analysis</div>
          {isAuthorized ? (
            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-value" style={{color: '#1D9E75'}}>{report.p1}%</div>
                <div className="stat-label">P1 Concepts</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{color: '#185FA5'}}>{report.p2}%</div>
                <div className="stat-label">P2 Procedures</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{color: '#e07b2a'}}>{report.p3}%</div>
                <div className="stat-label">P3 Application</div>
              </div>
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
                    Skill analysis (P1 Concepts, P2 Procedure, P3 Application) is visible to your teacher only.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SCORE ENTRY / QUESTION BREAKDOWN */}
          <div className="section-label">📋 Question-wise Breakdown</div>
          {isAuthorized ? (
            <div className="subject-card" style={{overflowX: 'auto', padding: '16px'}}>
              <table style={{width: '100%', fontSize: '12px', borderCollapse: 'collapse', minWidth: '500px'}}>
                <thead>
                  <tr style={{borderBottom: '2px solid #e2edf8', color: '#888', textAlign: 'left'}}>
                    <th style={{padding: '10px 8px'}}>Q No.</th>
                    <th style={{padding: '10px 8px'}}>Chapter</th>
                    <th style={{padding: '10px 8px'}}>Skill Type</th>
                    <th style={{padding: '10px 8px'}}>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {report.questions?.map(q => (
                    <tr key={q.question_id} style={{borderBottom: '1px solid #f0f4fb'}}>
                      <td style={{padding: '10px 8px', fontWeight: '600'}}>{q.question_id}</td>
                      <td style={{padding: '10px 8px'}}>{q.chapter}</td>
                      <td style={{padding: '10px 8px'}}>{q.skill_type || 'N/A'}</td>
                      <td style={{padding: '10px 8px', color: q.is_correct ? '#1D9E75' : '#e24b4a', fontWeight: 'bold'}}>
                        {q.is_correct ? '✅ Correct' : '❌ Wrong'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                    Detailed question-wise score entry is visible to your teacher and admin only.
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