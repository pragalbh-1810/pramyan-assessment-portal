import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  BarChart3,
  BookOpen,
  Calculator,
  FlaskConical,
  TrendingUp,
  Target,
  Brain,
  ClipboardList,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Bell,
  Lock,
  Loader2,
  AlertTriangle,
  Trophy,
  ThumbsUp,
  Dumbbell,
  LogOut,
} from "lucide-react";
import logo from "../assets/logo.jpeg";
import { getToken, removeToken } from "../utils/auth";
import { apiUrl } from "../utils/api";

function decodeToken(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

function getPerf(pct) {
  if (pct >= 80) return { label: "Excellent", Icon: Trophy, color: "#1D9E75" };
  if (pct >= 60) return { label: "Good", Icon: ThumbsUp, color: "#185FA5" };
  if (pct >= 40)
    return { label: "Average", Icon: TrendingUp, color: "#e07b2a" };
  return { label: "Needs Work", Icon: Dumbbell, color: "#e24b4a" };
}

function getStatus(pct) {
  if (pct >= 80) return { label: "Strong", tone: "green" };
  if (pct >= 50) return { label: "Average", tone: "amber" };
  return { label: "Needs Work", tone: "red" };
}

function getChapterStatus(pct) {
  const p = parseFloat(pct);
  if (p >= 70) return { label: "Strength", tone: "green" };
  if (p >= 40) return { label: "Gap area", tone: "amber" };
  return { label: "Priority", tone: "red" };
}

const BLOOM_LEVELS = [
  { level: "L1", name: "Remember", barColor: "#185FA5" },
  { level: "L2", name: "Understand", barColor: "#2563a8" },
  { level: "L3", name: "Apply", barColor: "#3a7bd5" },
  { level: "L4", name: "Analyze", barColor: "#1D9E75" },
  { level: "L5", name: "Evaluate", barColor: "#e07b2a" },
];

// Status pill colors (used by Strong / Average / Needs Work badges)
const STATUS_PILL = {
  green: "bg-[#e6f7f1] text-[#1D9E75]",
  amber: "bg-[#fff4e0] text-[#d97706]",
  red: "bg-[#fff0f0] text-[#e24b4a]",
};

const STATUS_ICON = {
  green: CheckCircle2,
  amber: AlertTriangle,
  red: XCircle,
};

// Keyframes that aren't in Tailwind by default
const keyframes = `
  @keyframes report-fade-up {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes report-fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes report-spin {
    to { transform: rotate(360deg); }
  }
  .anim-fade-up   { animation: report-fade-up 0.4s ease both; }
  .anim-fade-in   { animation: report-fade-in 0.5s ease both; }
  .anim-spin      { animation: report-spin 1s linear infinite; }
  .anim-d-50      { animation-delay: 0.05s; }
  .anim-d-80      { animation-delay: 0.08s; }
  .anim-d-100     { animation-delay: 0.10s; }
  .anim-d-300     { animation-delay: 0.30s; }
  .anim-d-350     { animation-delay: 0.35s; }
`;

/* ───────────────────────── shared subcomponents ───────────────────────── */

function Topbar({ studentName, onLogout }) {
  return (
    <div className="sticky top-2 md:top-2.5 z-40 mx-2.5 md:mx-4 mt-2.5 rounded-2xl bg-[linear-gradient(135deg,#1D9E75_0%,#185FA5_100%)] shadow-[0_4px_16px_rgba(24,95,165,0.2)]">
      <div className="flex items-center justify-between gap-2 px-3 md:px-7 h-14 md:h-16">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={logo}
            alt="Pramyan"
            className="h-8 md:h-9 rounded-lg bg-white p-0.5 shrink-0"
          />
        </div>

        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          {/* Student info — hidden when very narrow to give logout room */}
          <div className="hidden xs:flex flex-col items-end min-w-0">
            <span className="text-[12px] md:text-[13px] font-semibold text-white font-['Inter',sans-serif] truncate max-w-[140px] md:max-w-[260px]">
              {studentName}
            </span>
            <span className="text-[10px] md:text-[11px] text-white/70 font-['Inter',sans-serif] truncate max-w-[140px] md:max-w-[260px]">
              Diagnostic Assessment Report
            </span>
          </div>

          {/* Logout — icon only on mobile, icon+text on desktop */}
          <button
            type="button"
            onClick={onLogout}
            aria-label="Logout"
            className="bg-white text-[#185FA5] rounded-lg w-9 h-9 md:w-auto md:h-9 md:px-3.5 flex items-center justify-center md:gap-1.5 text-xs font-bold cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] active:scale-95">
            <LogOut size={14} strokeWidth={2.5} />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function Eyebrow({ Icon, children }) {
  return (
    <div className="flex items-center gap-2 mt-9 mb-5 text-[15px] md:text-base font-extrabold text-[#185FA5]">
      <Icon size={18} strokeWidth={2.5} />
      <span>{children}</span>
    </div>
  );
}

function StatusPill({ tone, label }) {
  const Icon = STATUS_ICON[tone];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-[3px] rounded-full text-[11px] font-semibold ${STATUS_PILL[tone]}`}>
      <Icon size={11} strokeWidth={2.5} />
      {label}
    </span>
  );
}

function BlurMessage({ title, text }) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[20px] bg-[#EEF4FF]/60 backdrop-blur-[2px]">
      <div className="bg-white rounded-2xl px-6 py-5 text-center shadow-[0_8px_24px_rgba(24,95,165,0.15)] border-[1.5px] border-[#d4e4f7] max-w-[280px] mx-3">
        <div className="w-11 h-11 rounded-full bg-[#EEF4FF] flex items-center justify-center mx-auto mb-2">
          <Lock size={20} className="text-[#185FA5]" strokeWidth={2.25} />
        </div>
        <div className="text-sm font-bold text-[#0d1f3c] mb-1">{title}</div>
        <div className="text-[11.5px] text-[#888] font-['Inter',sans-serif] leading-relaxed">
          {text}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── main component ───────────────────────── */

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
        headers: { Authorization: `Bearer ${token}` },
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

  const handleLogout = () => {
    removeToken();
    navigate("/");
  };

  if (loading) {
    return (
      <>
        <style>{keyframes}</style>
        <div className="min-h-screen bg-[#EEF4FF] font-['Sora',sans-serif]">
          <Topbar studentName={studentName} onLogout={handleLogout} />
          <div className="flex flex-col items-center justify-center gap-3 py-20 px-4">
            <Loader2 size={32} className="anim-spin text-[#185FA5]" />
            <p className="text-[#888] font-['Inter',sans-serif] text-sm">
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
        <style>{keyframes}</style>
        <div className="min-h-screen bg-[#EEF4FF] font-['Sora',sans-serif]">
          <Topbar studentName={studentName} onLogout={handleLogout} />
          <div className="flex flex-col items-center justify-center gap-3 py-20 px-4 text-center">
            <div className="w-14 h-14 rounded-full bg-[#fff0f0] flex items-center justify-center">
              <AlertTriangle
                size={28}
                className="text-[#e24b4a]"
                strokeWidth={2.25}
              />
            </div>
            <p className="text-[#888] font-['Inter',sans-serif] text-sm">
              Report not available. Please complete the test first.
            </p>
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
      const lvl = (q.bloom_level || "UNKNOWN").toUpperCase();
      if (!bMap[lvl]) bMap[lvl] = { max_score: 0, score: 0 };
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
      } else if (sk.includes("P2") || sk.includes("PROCED")) {
        p2m++;
        if (ok) p2s++;
      } else if (sk.includes("P3") || sk.includes("APPLIC")) {
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
          ? ((bMap[k].score / bMap[k].max_score) * 100).toFixed(2)
          : 0,
    }));

    // Build fresh Chapter Array
    const chapter_scores = Object.values(cMap)
      .map((c) => {
        const calcPct =
          c.max_score > 0 ? ((c.score / c.max_score) * 100).toFixed(2) : 0;
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
        totalMax > 0 ? ((totalScore / totalMax) * 100).toFixed(2) : 0,
      math_score: mathScore,
      math_max: mathMax,
      math_pct: mathMax > 0 ? Math.round((mathScore / mathMax) * 100) : 0,
      sci_score: sciScore,
      sci_max: sciMax,
      sci_pct: sciMax > 0 ? Math.round((sciScore / sciMax) * 100) : 0,
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

  // BOOLEAN TO CHECK IF USER IS PRIVILEGED
  const isAuthorized = userRole === "admin" || userRole === "teacher";

  return (
    <>
      <style>{keyframes}</style>

      <div className="min-h-screen bg-[#EEF4FF] font-['Sora',sans-serif]">
        <Topbar studentName={studentName} onLogout={handleLogout} />

        <div className="anim-fade-in max-w-[900px] mx-auto px-4 md:px-5 pt-6 md:pt-8 pb-16">
          {/* ─── HERO SCORE CARD ─── */}
          <Eyebrow Icon={BarChart3}>Overall Score</Eyebrow>
          <div className="anim-fade-up anim-d-50 bg-[linear-gradient(135deg,#1D9E75_0%,#185FA5_100%)] rounded-3xl p-6 md:p-8 mb-6 shadow-[0_8px_32px_rgba(24,95,165,0.2)] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-white/80 font-['Inter',sans-serif]">
                Diagnostic Assessment Result
              </span>
              <span className="text-[20px] md:text-[22px] font-extrabold text-white">
                {studentName.split(" ")[0]}'s Report
              </span>
              <span className="text-xs text-white/70 font-['Inter',sans-serif]">
                Pramyan Foundational Assessment
              </span>
            </div>
            <div className="flex items-center justify-between md:justify-end gap-5 md:flex-shrink-0">
              <div className="text-left md:text-right">
                <div className="flex items-center gap-1.5 text-sm font-bold text-white md:justify-end">
                  <perf.Icon size={14} strokeWidth={2.5} />
                  {perf.label}
                </div>
                <div className="text-xs text-white/70 font-['Inter',sans-serif] mt-0.5">
                  Performance
                </div>
              </div>
              <div className="w-24 h-24 rounded-full bg-white/15 border-[3px] border-white/40 flex flex-col items-center justify-center shrink-0">
                <span className="text-[28px] font-extrabold text-white leading-none">
                  {activeReport.total_score}
                </span>
                <span className="text-xs text-white/70 font-['DM_Sans',sans-serif] mt-0.5">
                  / {activeReport.max_score}
                </span>
              </div>
            </div>
          </div>

          {/* ─── SUBJECT CARDS ─── */}
          <Eyebrow Icon={BookOpen}>Subject-wise Score</Eyebrow>
          <div className="anim-fade-up anim-d-80 grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Mathematics */}
            <div className="bg-white rounded-[18px] p-6 shadow-[0_4px_16px_rgba(24,95,165,0.05)] border border-[#e2edf8]">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-[15px] font-bold text-[#0d1f3c]">
                  <div className="w-7 h-7 rounded-[7px] bg-[#EEF4FF] flex items-center justify-center">
                    <Calculator
                      size={14}
                      className="text-[#185FA5]"
                      strokeWidth={2.25}
                    />
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
                  {activeReport.math_score} / {activeReport.math_max} marks
                </span>
                <StatusPill tone={mathSt.tone} label={mathSt.label} />
              </div>
            </div>

            {/* Science */}
            <div className="bg-white rounded-[18px] p-6 shadow-[0_4px_16px_rgba(24,95,165,0.05)] border border-[#e2edf8]">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-[15px] font-bold text-[#0d1f3c]">
                  <div className="w-7 h-7 rounded-[7px] bg-[#e6f7f1] flex items-center justify-center">
                    <FlaskConical
                      size={14}
                      className="text-[#1D9E75]"
                      strokeWidth={2.25}
                    />
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
                  {activeReport.sci_score} / {activeReport.sci_max} marks
                </span>
                <StatusPill tone={sciSt.tone} label={sciSt.label} />
              </div>
            </div>
          </div>

          {/* ─── STATS ROW ─── */}
          <div className="anim-fade-up anim-d-100 grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <StatBox
              Icon={CheckCircle2}
              num={activeReport.correct}
              label="Correct"
              color="#1D9E75"
            />
            <StatBox
              Icon={XCircle}
              num={activeReport.wrong}
              label="Wrong"
              color="#e24b4a"
            />
            <StatBox
              Icon={MinusCircle}
              num={activeReport.unanswered}
              label="Skipped"
              color="#aaa"
            />
            <StatBox
              Icon={Target}
              num={`${activeReport.overall_pct}%`}
              label="Overall"
              color="#0d1f3c"
            />
          </div>

          {/* ─── NOTIFICATION BANNER (Students only) ─── */}
          {!isAuthorized && (
            <div className="anim-fade-up anim-d-300 bg-white border-[1.5px] border-[#d4e4f7] rounded-2xl px-4 md:px-5 py-4 flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-3.5 mb-8 shadow-[0_4px_16px_rgba(24,95,165,0.05)] text-center md:text-left">
              <div className="w-10 h-10 rounded-xl bg-[#EEF4FF] flex items-center justify-center shrink-0 mx-auto md:mx-0">
                <Bell size={18} className="text-[#185FA5]" strokeWidth={2.25} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold text-[#0d1f3c] mb-0.5">
                  Deep Dive Analysis Available with Your Teacher
                </div>
                <div className="text-[11.5px] text-[#888] font-['Inter',sans-serif] leading-relaxed">
                  Your detailed SWOT Analysis, Bloom's Taxonomy report, and
                  Question-by-Question breakdown are available in the Teacher
                  Portal. Reach out to discuss your custom action plan.
                </div>
              </div>
              <div className="bg-[linear-gradient(135deg,#1D9E75,#185FA5)] text-white text-[10px] font-bold px-2.5 py-1 rounded-full font-['Inter',sans-serif] whitespace-nowrap shrink-0 mx-auto md:mx-0">
                Teacher Only
              </div>
            </div>
          )}

          {/* ─── BLURRED — CHAPTER ANALYSIS ─── */}
          <Eyebrow Icon={TrendingUp}>Chapter-wise Analysis</Eyebrow>
          {isAuthorized ? (
            <BlurredCard title="To view exact Chapter details, log in as a Teacher." />
          ) : (
            <LockedSection
              title="Chapter Performance Matrix"
              TitleIcon={TrendingUp}
              lockTitle="Teacher Only"
              lockText="Detailed Chapter SWOT Matrix (Strengths, Weaknesses, Opportunities, Threats) is locked. Contact your teacher.">
              {[...Array(5)].map((_, i) => (
                <FakeBarRow key={i} barColor="#e2edf8" />
              ))}
            </LockedSection>
          )}

          {/* ─── BLURRED — SKILL ANALYSIS ─── */}
          <Eyebrow Icon={Target}>Concept vs Procedure</Eyebrow>
          {isAuthorized ? (
            <BlurredCard title="To view exact Skill breakdown, log in as a Teacher." />
          ) : (
            <LockedSection
              title="P1 · P2 · P3 Skill Breakdown"
              TitleIcon={Target}
              lockTitle="Teacher Only"
              lockText="Skill analysis (P1 Conceptual Clarity, P2 Procedural Accuracy, P3 Application) is visible to your teacher only.">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 bg-[#f0f4fb] rounded-xl" />
                ))}
              </div>
            </LockedSection>
          )}

          {/* ─── BLURRED — BLOOM'S ANALYSIS ─── */}
          <Eyebrow Icon={Brain}>Bloom's Taxonomy</Eyebrow>
          {isAuthorized ? (
            <BlurredCard title="To view exact Bloom's levels, log in as a Teacher." />
          ) : (
            <LockedSection
              title="Bloom's Cognitive Levels"
              TitleIcon={Brain}
              lockTitle="Teacher Only"
              lockText="Bloom's cognitive level analysis (L1 Remember to L5 Evaluate) is available to your teacher only.">
              {BLOOM_LEVELS.map((level, i) => (
                <FakeBarRow
                  key={i}
                  barColor={`hsl(${160 + i * 15}, 50%, 75%)`}
                />
              ))}
            </LockedSection>
          )}

          {/* ─── BLURRED — SCORE ENTRY ─── */}
          <Eyebrow Icon={ClipboardList}>Question-wise Breakdown</Eyebrow>
          {isAuthorized ? (
            <BlurredCard title="To view the raw question data, log in as a Teacher." />
          ) : (
            <LockedSection
              title="Score Entry Sheet"
              TitleIcon={ClipboardList}
              lockTitle="Teacher Only"
              lockText="Detailed question-by-question breakdown, including correct/incorrect options, is locked.">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-20 bg-[#f0f4fb] rounded-xl" />
                ))}
              </div>
            </LockedSection>
          )}
        </div>
      </div>
    </>
  );
}

/* ─── small helpers used inside main component ─── */

function StatBox({ Icon, num, label, color }) {
  return (
    <div className="bg-white rounded-2xl p-4 md:p-5 text-center border border-[#e2edf8] shadow-[0_2px_10px_rgba(24,95,165,0.05)]">
      <div className="flex justify-center mb-1.5">
        <Icon size={18} style={{ color }} strokeWidth={2.25} />
      </div>
      <div
        className="text-[20px] md:text-[22px] font-extrabold mt-1.5"
        style={{ color }}>
        {num}
      </div>
      <div className="text-[10px] text-[#aaa] uppercase tracking-wide font-['DM_Sans',sans-serif] mt-0.5">
        {label}
      </div>
    </div>
  );
}

function BlurredCard({ title }) {
  return (
    <div className="anim-fade-up anim-d-350 bg-white rounded-[20px] p-7 md:p-8 mb-6 shadow-[0_4px_24px_rgba(24,95,165,0.06)] border border-[#e2edf8]">
      <div className="text-base font-extrabold text-[#0d1f3c] font-['Sora',sans-serif]">
        {title}
      </div>
    </div>
  );
}

function LockedSection({ title, TitleIcon, lockTitle, lockText, children }) {
  return (
    <div className="anim-fade-up anim-d-350 relative mb-6 rounded-[20px] overflow-hidden">
      <div className="filter blur-[6px] pointer-events-none select-none">
        <div className="bg-white rounded-[20px] p-6 md:p-8 shadow-[0_4px_24px_rgba(24,95,165,0.06)] border border-[#e2edf8]">
          <div className="flex items-center gap-2 text-base font-extrabold text-[#0d1f3c] mb-5 font-['Sora',sans-serif]">
            <TitleIcon size={16} />
            {title}
          </div>
          {children}
        </div>
      </div>
      <BlurMessage title={lockTitle} text={lockText} />
    </div>
  );
}

function FakeBarRow({ barColor }) {
  return (
    <div className="flex items-center gap-3 mb-3 last:mb-0">
      <div className="w-20 md:w-[140px] h-3.5 bg-[#e2edf8] rounded shrink-0" />
      <div className="flex-1 h-3.5 rounded" style={{ background: barColor }} />
      <div className="w-10 h-3.5 bg-[#e2edf8] rounded shrink-0" />
    </div>
  );
}
