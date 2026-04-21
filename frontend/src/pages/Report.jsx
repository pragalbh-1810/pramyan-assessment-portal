import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import logo from "../assets/logo.jpeg";
import { getToken } from "../utils/auth";

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
  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
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
  .topbar-title {
    font-size: 14px;
    font-weight: 700;
    color: white;
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
    gap: 112px;
    flex-shrink: 0;
    align-content: stretch;
    justify-content: space-between;
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
  .performance-badge {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }
  .badge-emoji { font-size: 32px; }
  .badge-label {
    font-size: 13px;
    font-weight: 700;
    color: white;
  }
  .badge-sub {
    font-size: 10px;
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
  .subject-status {
    font-size: 11px;
    font-weight: 600;
    padding: 3px 10px;
    border-radius: 20px;
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
  .stat-value {
    font-size: 20px;
    font-weight: 700;
    color: #0d1f3c;
    margin-bottom: 2px;
  }
  .stat-label {
    font-size: 10px;
    color: #999;
    font-family: 'Inter', sans-serif;
    text-transform: uppercase;
    letter-spacing: 0.3px;
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
    animation: fadeInUp 0.5s ease 0.2s both;
    flex-direction: column;
    text-align: center;
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
  .notify-title {
    font-size: 13px;
    font-weight: 700;
    color: #0d1f3c;
    margin-bottom: 2px;
  }
  .notify-text {
    font-size: 11.5px;
    color: #888;
    font-family: 'Inter', sans-serif;
    line-height: 1.5;
  }
  .notify-badge {
    background: linear-gradient(135deg, #1D9E75, #185FA5);
    color: white;
    font-size: 10px;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 20px;
    font-family: 'Inter', sans-serif;
    white-space: nowrap;
    flex-shrink: 0;
  }

  /* ── BLURRED SECTIONS ── */
  .blurred-section {
    position: relative;
    margin-bottom: 20px;
    border-radius: 18px;
    overflow: hidden;
    animation: fadeInUp 0.5s ease 0.25s both;
  }
  .blur-content {
    filter: blur(5px);
    pointer-events: none;
    user-select: none;
  }
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
  .blur-msg-title {
    font-size: 13px;
    font-weight: 700;
    color: #0d1f3c;
    margin-bottom: 4px;
  }
  .blur-msg-text {
    font-size: 11px;
    color: #888;
    font-family: 'Inter', sans-serif;
    line-height: 1.5;
  }

  /* Blurred card content */
  .blurred-card {
    background: white;
    border-radius: 18px;
    padding: 20px;
    box-shadow: 0 2px 16px rgba(24,95,165,0.07);
    border: 1.5px solid #f0f4fb;
  }
  .blurred-title {
    font-size: 14px;
    font-weight: 700;
    color: #0d1f3c;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .fake-bar-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }
  .fake-label {
    width: 120px;
    height: 12px;
    background: #e2edf8;
    border-radius: 4px;
    flex-shrink: 0;
  }
  .fake-bar {
    flex: 1;
    height: 12px;
    border-radius: 4px;
  }
  .fake-pct {
    width: 36px;
    height: 12px;
    background: #e2edf8;
    border-radius: 4px;
    flex-shrink: 0;
  }
  .fake-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
  .fake-cell {
    height: 60px;
    background: #f0f4fb;
    border-radius: 10px;
  }

  @media (max-width: 768px) {
    /* ── HEADER ── */
    .report-topbar {
      padding: 10px 14px !important;
      height: auto !important;
      min-height: 48px !important;
      margin: 8px !important;
      border-radius: 12px !important;
      display: flex !important;
      flex-wrap: nowrap !important;
      align-items: center !important;
      justify-content: space-between !important;
      gap: 8px !important;
      position: static !important;
    }
    .topbar-logo {
      flex-shrink: 0 !important;
      min-width: 0 !important;
      display: flex !important;
      align-items: center !important;
    }
    .topbar-logo img {
      height: 24px !important;
      max-width: 90px !important;
      width: auto !important;
      object-fit: contain !important;
      background: white !important;
      padding: 2px 4px !important;
      border-radius: 6px !important;
    }
    .topbar-title { display: none !important; }
    .topbar-student-info {
      flex: 0 1 auto !important;
      min-width: 0 !important;
      text-align: right !important;
      overflow: hidden !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: flex-end !important;
      gap: 2px !important;
    }
    .topbar-name {
      display: block !important;
      font-size: 13px !important;
      font-weight: 700 !important;
      color: white !important;
      line-height: 1.2 !important;
      white-space: nowrap !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      max-width: 170px !important;
    }
    .topbar-sub {
      display: block !important;
      font-size: 10px !important;
      color: rgba(255,255,255,0.75) !important;
      line-height: 1.2 !important;
      white-space: nowrap !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      max-width: 170px !important;
    }

    /* ── MAIN ── */
    .report-main { padding: 14px 12px 32px !important; }

    /* ── HERO SCORE CARD ── */
    .hero-card {
      flex-direction: column !important;
      align-items: stretch !important;
      padding: 20px !important;
      border-radius: 18px !important;
      gap: 16px !important;
      text-align: left !important;
    }
    .hero-left { text-align: left !important; align-items: flex-start !important; }
    .hero-greeting { font-size: 12px !important; }
    .hero-name { font-size: 20px !important; line-height: 1.25 !important; }
    .hero-test { font-size: 11.5px !important; }
    .hero-right {
      align-self: stretch !important;
      justify-content: space-between !important;
      align-items: center !important;
      gap: 12px !important;
      padding-top: 8px !important;
      border-top: 1px solid rgba(255,255,255,0.15) !important;
    }
    .performance-badge {
      flex-direction: row !important;
      align-items: center !important;
      gap: 10px !important;
      text-align: left !important;
    }
    .badge-emoji { font-size: 26px !important; }
    .badge-label { font-size: 13px !important; }
    .badge-sub { font-size: 10px !important; }
    .score-circle { width: 72px !important; height: 72px !important; }
    .score-num { font-size: 22px !important; }
    .score-total { font-size: 11px !important; }

    /* ── SUBJECT / STATS GRID ── */
    .subject-row { grid-template-columns: 1fr !important; gap: 10px !important; }
    .stats-row { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
    .stat-card { padding: 14px !important; }
    .stat-value { font-size: 18px !important; }

    /* ── NOTIFICATION BANNER ── */
    .notify-banner {
      flex-direction: column !important;
      align-items: center !important;
      padding: 24px 20px !important;
      gap: 12px !important;
      border-radius: 16px !important;
      text-align: center !important;
    }
    .notify-icon {
      width: 44px !important;
      height: 44px !important;
      font-size: 22px !important;
      margin-bottom: 4px !important;
    }
    .notify-content {
      flex: 1 1 auto !important;
      min-width: 0 !important;
      text-align: center !important;
    }
    .notify-title {
      font-size: 14px !important;
      line-height: 1.35 !important;
      margin-bottom: 8px !important;
      white-space: normal !important;
      color: #0d1f3c !important;
    }
    .notify-text {
      font-size: 12px !important;
      line-height: 1.5 !important;
      white-space: normal !important;
      margin-bottom: 4px !important;
    }
    .notify-badge {
      align-self: center !important;
      font-size: 11px !important;
      padding: 8px 20px !important;
      margin-top: 8px !important;
      border-radius: 22px !important;
    }

    /* ── SECTION LABEL ── */
    .section-label { font-size: 9.5px !important; margin-bottom: 10px !important; }

    /* ── SUBJECT CARDS ── */
    .subject-card { padding: 16px !important; border-radius: 14px !important; }
    .subject-pct { font-size: 20px !important; }
    .subject-name { font-size: 13px !important; }
    .subject-icon { width: 28px !important; height: 28px !important; font-size: 14px !important; }

    /* ── BLURRED SECTIONS ── */
    .blurred-card { padding: 16px !important; }
    .blur-msg { padding: 14px 18px !important; max-width: 240px !important; }
    .blur-msg-icon { font-size: 24px !important; }
    .blur-msg-title { font-size: 12px !important; }
    .blur-msg-text { font-size: 10.5px !important; }
    .fake-label { width: 80px !important; }
  }

  @media (max-width: 400px) {
    .topbar-name { max-width: 110px !important; font-size: 11px !important; }
    .topbar-logo img { max-width: 75px !important; height: 22px !important; }
    .hero-name { font-size: 17px !important; }
    .notify-badge { display: none !important; }
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
  if (pct >= 50)
    return { label: "⚠️ Average", bg: "#fff4e6", color: "#e07b2a" };
  return { label: "❌ Needs Work", bg: "#fff0f0", color: "#e24b4a" };
}

export default function Report() {
  const navigate = useNavigate();
  const { testId } = useParams();
  const [report, setReport] = useState(null);
  const [studentName, setStudentName] = useState("Student");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token came via URL (Google redirect)
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get("token");
    if (urlToken) {
      localStorage.setItem("token", urlToken);
    }
    const token = urlToken || getToken() || "test";
    const decoded = decodeToken(token);
    if (decoded?.name) setStudentName(decoded.name);
    fetchReport(token);
  }, [testId]);

  const fetchReport = async (token) => {
    try {
      const res = await fetch(
        `https://pramyan.com/assessment/backend_test/backend/routes/get-report.php?test_id=${testId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
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
            <div className="topbar-logo">
              <img src={logo} alt="Pramyan" />
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "80px",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
            }}>
            <div style={{ fontSize: "32px" }}>⏳</div>
            <p
              style={{
                color: "#888",
                fontFamily: "Inter, sans-serif",
                fontSize: "14px",
              }}>
              Loading your results...
            </p>
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
            <div className="topbar-logo">
              <img src={logo} alt="Pramyan" />
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "80px",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
            }}>
            <div style={{ fontSize: "32px" }}>⚠️</div>
            <p
              style={{
                color: "#888",
                fontFamily: "Inter, sans-serif",
                fontSize: "14px",
              }}>
              Report not available. Please complete the test first.
            </p>
          </div>
        </div>
      </>
    );
  }

  const perf = getPerformanceLabel(report.overall_pct);
  const mathStatus = getSubjectStatus(report.math_pct);
  const sciStatus = getSubjectStatus(report.sci_pct);

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
              <span className="hero-name">
                {studentName.split(" ")[0]}, here's your score
              </span>
              <span className="hero-test">Pramyan Diagnostic Assessment</span>
            </div>
            <div className="hero-right">
              <div className="performance-badge">
                <span className="badge-emoji">{perf.emoji}</span>
                <span className="badge-label">{perf.label}</span>
                <span className="badge-sub">Performance</span>
              </div>
              <div className="score-circle">
                <span className="score-num">{report.total_score}</span>
                <span className="score-total">/ {report.max_score}</span>
              </div>
            </div>
          </div>

          {/* SUBJECT CARDS */}
          <div className="section-label">📚 Subject-wise Score</div>
          <div className="subject-row">
            {/* Math */}
            <div className="subject-card">
              <div className="subject-header">
                <div className="subject-name">
                  <div
                    className="subject-icon"
                    style={{ background: "#EEF4FF" }}>
                    📐
                  </div>
                  Mathematics
                </div>
                <span className="subject-pct" style={{ color: "#185FA5" }}>
                  {report.math_pct}%
                </span>
              </div>
              <div className="progress-bar-wrap">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${report.math_pct}%`,
                    background: "linear-gradient(90deg, #185FA5, #1D9E75)",
                  }}
                />
              </div>
              <div className="subject-stats">
                <span>
                  {report.math_score} / {report.math_max} marks
                </span>
                <span
                  className="subject-status"
                  style={{
                    background: mathStatus.bg,
                    color: mathStatus.color,
                  }}>
                  {mathStatus.label}
                </span>
              </div>
            </div>

            {/* Science */}
            <div className="subject-card">
              <div className="subject-header">
                <div className="subject-name">
                  <div
                    className="subject-icon"
                    style={{ background: "#e6f7f1" }}>
                    🔬
                  </div>
                  Science
                </div>
                <span className="subject-pct" style={{ color: "#1D9E75" }}>
                  {report.sci_pct}%
                </span>
              </div>
              <div className="progress-bar-wrap">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${report.sci_pct}%`,
                    background: "linear-gradient(90deg, #1D9E75, #185FA5)",
                  }}
                />
              </div>
              <div className="subject-stats">
                <span>
                  {report.sci_score} / {report.sci_max} marks
                </span>
                <span
                  className="subject-status"
                  style={{ background: sciStatus.bg, color: sciStatus.color }}>
                  {sciStatus.label}
                </span>
              </div>
            </div>
          </div>

          {/* STATS ROW */}
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-value" style={{ color: "#1D9E75" }}>
                {report.correct}
              </div>
              <div className="stat-label">Correct</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">❌</div>
              <div className="stat-value" style={{ color: "#e24b4a" }}>
                {report.wrong}
              </div>
              <div className="stat-label">Wrong</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⬜</div>
              <div className="stat-value" style={{ color: "#aaa" }}>
                {report.unanswered}
              </div>
              <div className="stat-label">Skipped</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-value">{report.overall_pct}%</div>
              <div className="stat-label">Overall</div>
            </div>
          </div>

          {/* NOTIFICATION BANNER */}
          <div className="notify-banner">
            <div className="notify-icon">🔔</div>
            <div className="notify-content">
              <div className="notify-title">
                Full Report Available with Your Teacher
              </div>
              <div className="notify-text">
                Your detailed analysis including Chapter Analysis, Skill
                Analysis, Bloom's Taxonomy report and Action Plan is available.
                Contact your teacher to see the complete report.
              </div>
            </div>
            <div className="notify-badge">Teacher Only</div>
          </div>

          {/* BLURRED — CHAPTER ANALYSIS */}
          <div className="section-label">📈 Chapter Analysis</div>
          <div className="blurred-section">
            <div className="blur-content">
              <div className="blurred-card">
                <div className="blurred-title">📈 Chapter-wise Performance</div>
                {[
                  "Number Systems",
                  "Polynomials",
                  "Linear Equations",
                  "Triangles",
                  "Chemical Reactions",
                  "Force & Motion",
                ].map((ch, i) => (
                  <div className="fake-bar-row" key={i}>
                    <div className="fake-label" />
                    <div
                      className="fake-bar"
                      style={{
                        background: `hsl(${200 + i * 20}, 60%, ${75 + i * 3}%)`,
                      }}
                    />
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
                  Chapter analysis is available only to your teacher and admin.
                  Contact your teacher to see this report.
                </div>
              </div>
            </div>
          </div>

          {/* BLURRED — SKILL ANALYSIS */}
          <div className="section-label">🎯 Skill Analysis</div>
          <div className="blurred-section">
            <div className="blur-content">
              <div className="blurred-card">
                <div className="blurred-title">
                  🎯 P1 · P2 · P3 Skill Breakdown
                </div>
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
                  Skill analysis (P1 Concepts, P2 Procedure, P3 Application) is
                  visible to your teacher only.
                </div>
              </div>
            </div>
          </div>

          {/* BLURRED — BLOOM'S ANALYSIS */}
          <div className="section-label">🌸 Bloom's Analysis</div>
          <div className="blurred-section">
            <div className="blur-content">
              <div className="blurred-card">
                <div className="blurred-title">🌸 Bloom's Taxonomy Report</div>
                {[
                  "L1 Remember",
                  "L2 Understand",
                  "L3 Apply",
                  "L4 Analyse",
                  "L5 Evaluate",
                ].map((level, i) => (
                  <div className="fake-bar-row" key={i}>
                    <div className="fake-label" />
                    <div
                      className="fake-bar"
                      style={{ background: `hsl(${160 + i * 15}, 50%, 75%)` }}
                    />
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
                  Bloom's cognitive level analysis is available to your teacher
                  only. Ask them to share your results!
                </div>
              </div>
            </div>
          </div>

          {/* BLURRED — SCORE ENTRY */}
          <div className="section-label">📋 Question-wise Score Entry</div>
          <div className="blurred-section">
            <div className="blur-content">
              <div className="blurred-card">
                <div className="blurred-title">📋 Score Entry Sheet</div>
                <div className="fake-grid">
                  {[...Array(9)].map((_, i) => (
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
                  Detailed question-wise score entry is visible to your teacher
                  and admin only.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
