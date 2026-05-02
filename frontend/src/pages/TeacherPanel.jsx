import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  X,
  Trophy,
  AlertTriangle,
  XCircle,
  Inbox,
  LogOut,
  GraduationCap,
  Menu,
} from "lucide-react";
import logo from "../assets/logo.jpeg";
import { getToken, removeToken } from "../utils/auth";
import { apiUrl, API_BASE } from "../utils/api";

function decodeJWT(t) {
  try {
    return JSON.parse(atob(t.split(".")[1]));
  } catch {
    return null;
  }
}

// ==========================================
// REPORT FORMATTING HELPERS
// ==========================================
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

const MATH_CHAPTER_KEYWORDS = [
  "integer",
  "rational",
  "real number",
  "fraction",
  "decimal",
  "exponent",
  "power",
  "ratio",
  "proportion",
  "percentage",
  "algebra",
  "linear equation",
  "quadratic",
  "polynomial",
  "equation",
  "arithmetic progression",
  "coordinate",
  "trigonometry",
  "circle",
  "construction",
  "factorisation",
  "geometry",
  "angle",
  "triangle",
  "mensuration",
  "perimeter",
  "area",
  "volume",
  "statistics",
  "probability",
  "heron",
];

const SCI_CHAPTER_KEYWORDS = [
  "crop production",
  "microorganism",
  "synthetic fibre",
  "plastic",
  "metal",
  "non-metal",
  "coal",
  "petroleum",
  "combustion",
  "conservation",
  "cell",
  "reproduction",
  "adolescence",
  "force",
  "pressure",
  "friction",
  "sound",
  "chemical effect",
  "electric current",
  "natural phenomena",
  "light",
  "matter",
  "atom",
  "molecule",
  "motion",
  "energy",
  "gravitation",
  "tissue",
  "life process",
  "control and coordination",
  "heredity",
  "evolution",
  "electricity",
  "magnetic effect",
  "carbon",
  "acid",
  "base",
  "salt",
  "periodic classification",
  "environment",
  "natural resource",
  "source of energy",
  "plant",
  "nutrition",
  "substance",
  "living",
  "water",
  "disease",
  "body movement",
];

const normalizeTag = (v) =>
  String(v || "")
    .trim()
    .toLowerCase();

function detectSubjectFromSection(sectionRaw, qTextRaw = "") {
  const section = normalizeTag(sectionRaw);
  if (
    section.includes("math") ||
    section.includes("mathematics") ||
    section.includes("algebra") ||
    section.includes("geometry")
  ) {
    return "math";
  }

  if (
    section.includes("sci") ||
    section.includes("science") ||
    section.includes("physics") ||
    section.includes("chemistry") ||
    section.includes("biology")
  ) {
    return "sci";
  }

  const text = normalizeTag(qTextRaw);
  if (text.includes("[math")) return "math";
  if (text.includes("[science") || text.includes("[sci")) return "sci";

  return null;
}

function detectSubjectFromChapter(chapterRaw) {
  const chapter = normalizeTag(chapterRaw);
  if (!chapter) return null;

  if (MATH_CHAPTER_KEYWORDS.some((k) => chapter.includes(k))) return "math";
  if (SCI_CHAPTER_KEYWORDS.some((k) => chapter.includes(k))) return "sci";

  return null;
}

function detectSkillBucket(skillRaw) {
  const skill = String(skillRaw || "")
    .trim()
    .toUpperCase();
  if (!skill) return null;

  if (
    skill.includes("P1") ||
    skill.includes("CONCEPT") ||
    skill.includes("LEVEL 1") ||
    skill.includes("SKILL 1")
  ) {
    return "P1";
  }

  if (
    skill.includes("P2") ||
    skill.includes("PROCED") ||
    skill.includes("LEVEL 2") ||
    skill.includes("SKILL 2")
  ) {
    return "P2";
  }

  if (
    skill.includes("P3") ||
    skill.includes("APPLIC") ||
    skill.includes("HOTS") ||
    skill.includes("LEVEL 3") ||
    skill.includes("SKILL 3")
  ) {
    return "P3";
  }

  return null;
}

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
  const strength = items.filter(
    (x) => x.category === "strength" || x.pct >= 70,
  );
  const opportunity = items.filter(
    (x) => x.category === "opportunity" || (x.pct >= 40 && x.pct < 70),
  );
  const weakness = items.filter((x) => x.category === "weakness" || x.pct < 40);
  const threats = weakness.map((x) => {
    const hint =
      THREAT_HINTS[x.chapter] ||
      `next-grade ${x.section.toLowerCase()} progression`;
    return `${x.chapter} weak -> ${hint} at risk`;
  });
  return { strength, opportunity, weakness, threats };
}

function buildSkillRows(reportObj) {
  const mathP1 = Number.isFinite(Number(reportObj.math_p1))
    ? Number(reportObj.math_p1)
    : 0;
  const sciP1 = Number.isFinite(Number(reportObj.sci_p1))
    ? Number(reportObj.sci_p1)
    : 0;
  const mathP2 = Number.isFinite(Number(reportObj.math_p2))
    ? Number(reportObj.math_p2)
    : 0;
  const sciP2 = Number.isFinite(Number(reportObj.sci_p2))
    ? Number(reportObj.sci_p2)
    : 0;
  const mathP3 = Number.isFinite(Number(reportObj.math_p3))
    ? Number(reportObj.math_p3)
    : 0;
  const sciP3 = Number.isFinite(Number(reportObj.sci_p3))
    ? Number(reportObj.sci_p3)
    : 0;

  return [
    {
      code: "P1",
      title: "Math - conceptual clarity",
      pct: mathP1,
      color: "#21a179",
    },
    {
      code: "P1",
      title: "Science - conceptual clarity",
      pct: sciP1,
      color: "#3b82f6",
    },
    {
      code: "P2",
      title: "Math - procedural accuracy",
      pct: mathP2,
      color: "#e07b2a",
    },
    {
      code: "P2",
      title: "Science - procedural accuracy",
      pct: sciP2,
      color: "#d65d33",
    },
    {
      code: "P3",
      title: "Math - application (HOTS)",
      pct: mathP3,
      color: "#7c83fd",
    },
    {
      code: "P3",
      title: "Science - application (HOTS)",
      pct: sciP3,
      color: "#5c6ac4",
    },
  ];
}

function buildSkillInsight(name, reportObj) {
  const mathP1 = Number.isFinite(Number(reportObj.math_p1))
    ? Number(reportObj.math_p1)
    : 0;
  const sciP1 = Number.isFinite(Number(reportObj.sci_p1))
    ? Number(reportObj.sci_p1)
    : 0;
  const mathP2 = Number.isFinite(Number(reportObj.math_p2))
    ? Number(reportObj.math_p2)
    : 0;
  const mathP3 = Number.isFinite(Number(reportObj.math_p3))
    ? Number(reportObj.math_p3)
    : 0;
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

function parseQLabel(qText = "") {
  const match = qText.match(/Q(\d+)\s*(?:\(\s*([a-zA-Z])\s*\))?/i);
  if (match)
    return { num: parseInt(match[1]), sub: match[2]?.toLowerCase() ?? null };
  return { num: null, sub: null };
}

function getPaperSection(num) {
  if (num == null) return "Other";
  if (num >= 1 && num <= 20) return "A";
  if (num >= 21 && num <= 28) return "B";
  if (num >= 29 && num <= 32) return "C";
  return "Other";
}

const PAPER_SECTIONS = [
  { key: "A", title: "Section A", subtitle: "Q1–Q20 · 1 mark each · 20 marks" },
  {
    key: "B",
    title: "Section B",
    subtitle: "Q21–Q28 · 3 parts each · 24 parts",
  },
  {
    key: "C",
    title: "Section C",
    subtitle: "Q29–Q32 · 4 parts each · 16 parts",
  },
  { key: "Other", title: "Other", subtitle: "Unrecognised question numbers" },
];

const keyframes = `
  @keyframes tp-fade-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes tp-blink   { 0%,100% { opacity: 1; } 50% { opacity: .3; } }
  .anim-fade-up   { animation: tp-fade-up 0.4s ease both; }
  .anim-d-50      { animation-delay: 0.05s; }
  .anim-d-80      { animation-delay: 0.08s; }
  .anim-d-100     { animation-delay: 0.10s; }
  .anim-d-120     { animation-delay: 0.12s; }
  .anim-d-160     { animation-delay: 0.16s; }
  .tp-scroll::-webkit-scrollbar { width: 6px; }
  .tp-scroll::-webkit-scrollbar-thumb { background: #d4e4f7; border-radius: 3px; }
  .tp-scroll-narrow::-webkit-scrollbar { width: 5px; }
  .tp-scroll-narrow::-webkit-scrollbar-thumb { background: #e2edf8; border-radius: 3px; }
`;

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

  // Default sidebar to true so it shows on load
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
    // Automatically close sidebar on mobile devices once selected
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
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

      {/* Backdrop for mobile sidebar - overlays everything behind the menu */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="md:h-screen min-h-screen bg-[#EEF4FF] font-['Sora',sans-serif] flex flex-col md:overflow-hidden">
        {/* ── TOP NAV ── */}
        <nav className="sticky top-0 md:top-2.5 z-50 mx-2.5 md:mx-4 mt-2.5 rounded-2xl bg-[linear-gradient(135deg,#1D9E75_0%,#185FA5_100%)] shadow-[0_6px_28px_rgba(24,95,165,0.22)] flex-shrink-0">
          <div className="flex items-center justify-between gap-2 px-3 md:px-6 h-14 md:h-16">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* UNIVERSAL HAMBURGER BUTTON (VISIBLE ON MOBILE AND DESKTOP) */}
              <button
                type="button"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="flex items-center justify-center text-white p-1.5 hover:bg-white/15 rounded-lg transition-colors cursor-pointer"
                aria-label="Toggle Menu">
                {isSidebarOpen ? (
                  <X size={22} strokeWidth={2.5} />
                ) : (
                  <Menu size={22} strokeWidth={2.5} />
                )}
              </button>

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
              {teacher?.role === "admin" && (
                <button
                  type="button"
                  onClick={() => navigate("/admin")}
                  className="hidden md:inline-flex items-center gap-1.5 bg-white/15 border border-white/30 text-white rounded-lg px-3.5 py-1.5 text-xs font-semibold cursor-pointer transition hover:bg-white/25">
                  Admin View
                </button>
              )}
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

        {/* ── LAYOUT ── */}
        <div className="flex flex-col md:flex-row flex-1 min-h-0 mt-2.5 md:mt-0 relative overflow-hidden">
          {/* ── LEFT: STUDENT LIST SIDEBAR ── */}
          <aside
            className={`${
              isSidebarOpen
                ? "flex absolute inset-y-2 left-2 z-50 w-[85%] max-w-[320px] shadow-[0_10px_40px_rgba(0,0,0,0.2)] md:relative md:inset-auto md:w-[360px] md:max-w-none md:shadow-none"
                : "hidden"
            } bg-white md:border-r md:border-[#d4e4f7] flex-col h-[calc(100%-16px)] md:h-full md:overflow-hidden mx-2.5 md:mx-0 rounded-2xl md:rounded-none border md:border-0 border-[#d4e4f7] transition-all shrink-0`}>
            {/* head */}
            <div className="px-5 md:px-6 pt-5 pb-4 border-b border-[#f0f4fb] flex-shrink-0">
              <div className="text-base font-extrabold text-[#0d1f3c] mb-0.5">
                Student Reports
              </div>
              <div className="text-xs text-[#888] font-['Inter',sans-serif]">
                Tap a student to view their full report
              </div>
            </div>

            {/* stats */}
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

            {/* filter chips */}
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
            <div className="flex-1 overflow-y-auto pb-6 tp-scroll-narrow">
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
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* ── RIGHT: REPORT ── */}
          <div className="flex-col flex-1 h-full overflow-y-auto bg-[#EEF4FF] tp-scroll min-w-0 flex">
            <div className="px-4 md:px-10 py-5 md:py-8 pb-16">
              {!activeStudent ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-center">
                  <div className="text-4xl">📊</div>
                  <h2 className="text-lg font-bold text-[#0d1f3c]">
                    Select a Student
                  </h2>
                  <p className="text-[#888] text-sm font-['Inter',sans-serif] max-w-[280px]">
                    Open the sidebar and tap any student to view their full
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

                  {report && (
                    <FormatReport report={report} student={activeStudent} />
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

// ==========================================
// BEAUTIFUL REPORT FORMATTER
// ==========================================
function FormatReport({ report, student, teacherName }) {
  // DYNAMIC RECALCULATION ENGINE (mark-based: each stored row = 1 mark)
  let activeReport = { ...report };

  if (report.questions && report.questions.length > 0) {
    const qs = report.questions;
    const totalMax =
      Number(report.max_score) > 0 ? Number(report.max_score) : qs.length;
    let totalScore = 0;
    let mathMax = 0,
      mathScore = 0;
    let sciMax = 0,
      sciScore = 0;
    let answeredCount = 0;

    const bMap = {};
    const cMap = {};
    let p1m = 0,
      p1s = 0,
      p2m = 0,
      p2s = 0,
      p3m = 0,
      p3s = 0;
    let mathP1m = 0,
      mathP1s = 0,
      mathP2m = 0,
      mathP2s = 0,
      mathP3m = 0,
      mathP3s = 0;
    let sciP1m = 0,
      sciP1s = 0,
      sciP2m = 0,
      sciP2s = 0,
      sciP3m = 0,
      sciP3s = 0;

    qs.forEach((q) => {
      const selected = String(q.selected_option ?? "")
        .trim()
        .toLowerCase();
      const correctAns = String(q.correct ?? "")
        .trim()
        .toLowerCase();
      const ok = selected !== "" && selected === correctAns;
      if (ok) totalScore++;
      if (selected !== "") answeredCount++;

      // Subjects
      const subject =
        detectSubjectFromSection(q.section, q.q_text) ||
        detectSubjectFromChapter(q.chapter);
      if (subject === "math") {
        mathMax++;
        if (ok) mathScore++;
      } else if (subject === "sci") {
        sciMax++;
        if (ok) sciScore++;
      }

      // Bloom
      const lvl = q.bloom_level;
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
      const skillBucket = detectSkillBucket(q.skill_type);
      const isMath = subject === "math";
      const isSci = subject === "sci";

      if (skillBucket === "P1") {
        p1m++;
        if (ok) p1s++;
        if (isMath) {
          mathP1m++;
          if (ok) mathP1s++;
        } else if (isSci) {
          sciP1m++;
          if (ok) sciP1s++;
        }
      } else if (skillBucket === "P2") {
        p2m++;
        if (ok) p2s++;
        if (isMath) {
          mathP2m++;
          if (ok) mathP2s++;
        } else if (isSci) {
          sciP2m++;
          if (ok) sciP2s++;
        }
      } else if (skillBucket === "P3") {
        p3m++;
        if (ok) p3s++;
        if (isMath) {
          mathP3m++;
          if (ok) mathP3s++;
        } else if (isSci) {
          sciP3m++;
          if (ok) sciP3s++;
        }
      }
    });

    const bloom_scores = Object.keys(bMap).map((k) => ({
      bloom_level: k,
      score: bMap[k].score,
      max_score: bMap[k].max_score,
      pct:
        bMap[k].max_score > 0
          ? ((bMap[k].score / bMap[k].max_score) * 100).toFixed(2)
          : 0,
    }));

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
      math_p1: mathP1m > 0 ? Math.round((mathP1s / mathP1m) * 100) : 0,
      math_p2: mathP2m > 0 ? Math.round((mathP2s / mathP2m) * 100) : 0,
      math_p3: mathP3m > 0 ? Math.round((mathP3s / mathP3m) * 100) : 0,
      sci_p1: sciP1m > 0 ? Math.round((sciP1s / sciP1m) * 100) : 0,
      sci_p2: sciP2m > 0 ? Math.round((sciP2s / sciP2m) * 100) : 0,
      sci_p3: sciP3m > 0 ? Math.round((sciP3s / sciP3m) * 100) : 0,
      correct: totalScore,
      unanswered: Math.max(0, totalMax - answeredCount),
      wrong: Math.max(0, answeredCount - totalScore),
    };
  }
  // ========================================================

  const perf = getPerf(activeReport.overall_pct);
  const mathSt = getStatus(activeReport.math_pct);
  const sciSt = getStatus(activeReport.sci_pct);
  const sName = student.name.split(" ")[0];
  const tClass = activeReport.test_class || student.class || "10";

  const chapterSectionMap = buildChapterSectionMap(
    activeReport.questions || [],
  );
  const swot = buildSwotBuckets(
    activeReport.chapter_scores || [],
    chapterSectionMap,
  );
  const skillRows = buildSkillRows(activeReport);
  const skillInsight = buildSkillInsight(sName, activeReport);

  const classNum = Number(student.class);
  const hasClassNum = Number.isFinite(classNum) && classNum > 0;
  const currentClass = hasClassNum ? `Class ${classNum}` : "current class";
  const nextClass = hasClassNum ? `Class ${classNum + 1}` : "next class";

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
    <div className="pb-10">
      <div className="flex items-center gap-2 mt-2 mb-5 text-[15px] md:text-base font-extrabold text-[#185FA5]">
        <span>👤</span>
        <span>Student Profile</span>
      </div>

      {/* Student Header */}
      <div className="bg-white rounded-[18px] px-5 py-5 mb-6 shadow-[0_4px_16px_rgba(24,95,165,0.05)] border border-[#e2edf8] flex items-center gap-4">
        <div className="w-[54px] h-[54px] rounded-full bg-[linear-gradient(135deg,#1D9E75,#185FA5)] flex items-center justify-center text-white text-xl font-extrabold shrink-0">
          {student.name[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[17px] font-bold text-[#0d1f3c] mb-0.5 truncate">
            {student.name}
          </div>
          <div className="text-[12.5px] text-[#666] font-['Inter',sans-serif] truncate mb-1.5">
            {student.email}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-[#EEF4FF] border border-[#d4e4f7] rounded-full px-3 py-1 text-[11px] text-[#185FA5] font-semibold">
              Class {student.class || "10"}
            </span>
            {teacherName && (
              <span className="bg-[#f0f4fb] border border-[#e2edf8] rounded-full px-3 py-1 text-[11px] text-[#555] font-semibold">
                Assigned to: {teacherName}
              </span>
            )}
          </div>
        </div>
      </div>

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
            <div className="text-sm font-bold text-white">{perf.label}</div>
            <div className="text-xs text-white/70">Performance</div>
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

      {/* Uploaded File View */}
      {activeReport.uploaded_file && (
        <>
          <div className="flex items-center gap-2 mt-9 mb-5 text-[15px] md:text-base font-extrabold text-[#185FA5]">
            <span>📝</span>
            <span>Working Sheet</span>
          </div>
          <div className="bg-white rounded-[18px] p-6 shadow-[0_4px_16px_rgba(24,95,165,0.05)] border border-[#e2edf8] mb-6">
            <div className="text-[13px] text-[#666] font-['Inter',sans-serif] mb-4">
              The student attached a working sheet for this test.
            </div>
            <div className="flex justify-center bg-[#f8fbff] p-4 rounded-xl border border-[#e2edf8]">
              <a 
                href={`${API_BASE.replace(/\/routes\/?$/, "/uploads/working_sheets")}/${activeReport.uploaded_file}`} 
                target="_blank" 
                rel="noreferrer"
                className="cursor-pointer"
              >
                <img 
                  src={`${API_BASE.replace(/\/routes\/?$/, "/uploads/working_sheets")}/${activeReport.uploaded_file}`}
                  alt="Working Sheet" 
                  className="max-w-full max-h-[500px] rounded object-contain border border-[#d4e4f7] hover:opacity-95 transition-opacity"
                />
              </a>
            </div>
          </div>
        </>
      )}

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
              {activeReport.math_score} / {activeReport.math_max} marks
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
              {activeReport.sci_score} / {activeReport.sci_max} marks
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
          This section explains chapter-wise placement in four zones so parents
          clearly understand transition readiness.
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
          This section shows why errors happened, not just how many. The same
          score can come from very different skill gaps.
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

        <div className="bg-[#f2f1ff] border-l-4 border-[#7c83fd] text-[#4a4f8a] rounded-r-lg px-5 py-4 italic text-[13px] font-['Inter',sans-serif] leading-relaxed mt-3">
          {`"${skillInsight}"`}
        </div>
      </div>

      {/* BLOOM */}
      <div className="flex items-center gap-2 mt-9 mb-5 text-[15px] md:text-base font-extrabold text-[#185FA5]">
        <span>🌸</span>
        <span>Bloom's Taxonomy — Cognitive Level Analysis</span>
      </div>
      {activeReport.bloom_scores?.length > 0 ? (
        <div className="anim-fade-up anim-d-160 bg-white rounded-[20px] p-5 md:p-10 shadow-[0_4px_24px_rgba(24,95,165,0.06)] border border-[#e2edf8] mb-8">
          <div className="text-[16px] md:text-xl font-extrabold text-[#0d1f3c] mb-3 uppercase">
            BLOOM'S TAXONOMY — COGNITIVE LEVEL ANALYSIS
          </div>
          <div className="text-[13px] md:text-sm text-[#444] mb-6 leading-relaxed font-['Inter',sans-serif]">
            Bloom's Taxonomy measures HOW DEEPLY a student understands — not
            just WHAT they know. 6 levels from simple recall to creative
            thinking. This report shows cognitive gaps.
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
                  const dbScore = activeReport.bloom_scores?.find((b) =>
                    b.bloom_level.toUpperCase().includes(levelObj.level),
                  );
                  const maxMarks = dbScore ? dbScore.max_score : 0;
                  const scored = dbScore ? dbScore.score : 0;
                  const pct = dbScore ? dbScore.pct : 0;
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
                          color: pct >= 50 ? "#1D9E75" : "#e24b4a",
                        }}>
                        {pct}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="font-extrabold text-[15px] md:text-base mb-5 mt-10 text-[#0d1f3c]">
            ▌ VISUAL: Marks Scored vs Maximum at Each Cognitive Level
          </div>

          {/* Bloom graph */}
          <div className="relative mt-10 mb-10 ml-[90px] md:ml-[140px] pb-8 border-l-2 border-b-2 border-[#cbd5e1]">
            <div className="absolute inset-0 flex justify-between z-0 pointer-events-none">
              {[0, 20, 40, 60, 80, 100].map((val) => (
                <div key={val} className="w-px h-full bg-[#e2edf8] relative">
                  <span className="absolute -bottom-6 -translate-x-1/2 text-xs text-[#64748b] font-['Inter',sans-serif]">
                    {val}%
                  </span>
                </div>
              ))}
            </div>
            {BLOOM_LEVELS.slice(0, 5).map((levelObj, i) => {
              const dbScore = activeReport.bloom_scores?.find((b) =>
                b.bloom_level.toUpperCase().includes(levelObj.level),
              );
              const pct = dbScore ? parseFloat(dbScore.pct) : 0;
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

          <div className="bg-[#F6F3FA] border-l-4 border-[#8E62B6] px-5 py-4 my-6 italic text-[#49335E] text-[13px] md:text-sm font-['Inter',sans-serif] leading-relaxed rounded-r-lg">
            "{sName} currently struggles at every level — including basic recall
            (L1 at {l1Pct}%). The most urgent fix is L2 — they scored {l2Score}{" "}
            here, which means they are memorising facts without truly
            understanding them. This explains why they know a concept but cannot
            solve a problem with it. Fixing L2 will automatically lift L3, L4
            and L5 over time."
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
            Chapter-wise Analysis — All {activeReport.chapter_scores.length}{" "}
            Chapters
          </div>
          <div className="text-[13px] md:text-sm text-[#444] mb-5 leading-relaxed font-['Inter',sans-serif]">
            Walk through the full chapter breakdown so the parent can see
            exactly where {sName} stands in every topic.
          </div>

          <div className="bg-[#F6F3FA] border-l-4 border-[#8E62B6] px-5 py-4 my-6 italic text-[#49335E] text-[13px] md:text-sm font-['Inter',sans-serif] leading-relaxed rounded-r-lg">
            "We tested {activeReport.chapter_scores.length} chapters from the
            Class {tClass} syllabus. Each chapter is scored and placed in one of
            three bands. Let me walk you through all of them so you have the
            complete picture."
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
                {activeReport.chapter_scores.map((ch, i) => {
                  const status = getChapterStatus(ch.pct);
                  let subject = ch.subject;
                  let risk = ch.risk_if_weak;
                  if (!subject || !risk) {
                    const qMatch = activeReport.questions?.find(
                      (q) => q.chapter === ch.chapter,
                    );
                    if (qMatch) {
                      if (!subject) subject = qMatch.section;
                      if (!risk) risk = qMatch.risk_if_weak;
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
                        {risk || `Class ${tClass} foundations`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="bg-[#F6F3FA] border-l-4 border-[#8E62B6] px-5 py-4 my-6 italic text-[#49335E] text-[13px] md:text-sm font-['Inter',sans-serif] leading-relaxed rounded-r-lg mb-6">
            "{swot.weakness.length} out of {activeReport.chapter_scores.length}{" "}
            chapters are in the Priority zone. This tells us {sName} needs
            structured support before Class {tClass} begins, not after. The good
            news is that {swot.opportunity.length} chapters are Gap chapters —{" "}
            {swot.opportunity.map((o) => o.chapter).join(", ") || "none"}. Just
            2-3 focused sessions each can convert these into Strengths. These
            are our biggest quick wins."
          </div>

          <div className="bg-[#e6f7f1] border-2 border-[#a3e6cd] px-5 py-4 rounded-xl text-[13px] md:text-sm text-[#1a4f3e] font-['Inter',sans-serif] leading-relaxed">
            <strong>Important note for parents:</strong> This report is not a
            judgment — it is a map. It tells us exactly where to go next.{" "}
            {sName} has shown they understand Math concepts (P1 at{" "}
            {activeReport.p1 || 0}%) — that is a real strength we can build on.
            With focused effort and the right plan, they will enter Class{" "}
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
          Question-by-question breakdown
        </div>
        <div className="text-[13px] md:text-sm text-[#444] mb-6 leading-relaxed font-['Inter',sans-serif]">
          Each section follows the same structure as the test paper — Section A
          (single questions), Section B (3-part questions), Section C (4-part
          questions).
        </div>

        {(() => {
          // Bucket questions into A / B / C / Other based on parsed Q-number,
          // sort within each bucket by parent num then sub-letter so output matches paper order.
          const buckets = { A: [], B: [], C: [], Other: [] };
          (activeReport.questions || []).forEach((q, i) => {
            const { num, sub } = parseQLabel(q.q_text);
            const sectionKey = getPaperSection(num);
            buckets[sectionKey].push({
              raw: q,
              originalIndex: i,
              num,
              sub,
              qLabel: num ? `Q${num}${sub ? `(${sub})` : ""}` : `Q${i + 1}`,
            });
          });
          Object.keys(buckets).forEach((k) => {
            buckets[k].sort((a, b) => {
              if (a.num !== b.num) return (a.num || 999) - (b.num || 999);
              return (a.sub || "").localeCompare(b.sub || "");
            });
          });

          // Render only sections that actually have questions
          return PAPER_SECTIONS.filter(
            (sec) => buckets[sec.key].length > 0,
          ).map((sec, idx) => {
            const items = buckets[sec.key];
            // Stats only count among answered parts
            const answered = items.filter(
              (x) =>
                x.raw.selected_option &&
                String(x.raw.selected_option).trim() !== "",
            );
            const correctCount = answered.filter(
              (x) => parseInt(x.raw.is_correct) === 1,
            ).length;
            const wrongCount = answered.length - correctCount;
            const skippedCount = items.length - answered.length;

            return (
              <div key={sec.key} className={idx > 0 ? "mt-8" : ""}>
                {/* Section header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4 pb-3 mb-4 border-b-2 border-[#e2edf8]">
                  <div>
                    <div className="text-[15px] md:text-[17px] font-extrabold text-[#0d1f3c] flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-[#185FA5] text-white text-xs font-bold">
                        {sec.key}
                      </span>
                      {sec.title}
                    </div>
                    <div className="text-[11.5px] md:text-[12px] text-[#666] font-['Inter',sans-serif] mt-1 ml-9">
                      {sec.subtitle}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 md:gap-2 flex-wrap text-[10.5px] md:text-[11.5px] font-['Inter',sans-serif] ml-9 md:ml-0">
                    <span className="inline-flex items-center gap-1 bg-[#e6f7f1] text-[#1D9E75] font-semibold px-2.5 py-1 rounded-full">
                      ✓ {correctCount} correct
                    </span>
                    <span className="inline-flex items-center gap-1 bg-[#fff0f0] text-[#e24b4a] font-semibold px-2.5 py-1 rounded-full">
                      ✗ {wrongCount} wrong
                    </span>
                    <span className="inline-flex items-center gap-1 bg-[#f0f4fb] text-[#888] font-semibold px-2.5 py-1 rounded-full">
                      — {skippedCount} skipped
                    </span>
                  </div>
                </div>

                {/* DESKTOP: table */}
                <div className="hidden md:block overflow-x-auto -mx-2 px-2 mb-2">
                  <table className="w-full border-collapse font-['Inter',sans-serif] text-[13px]">
                    <thead>
                      <tr>
                        <th className="bg-[#234674] text-white font-semibold px-3 py-3 text-center border border-[#234674] w-[90px]">
                          Q No.
                        </th>
                        <th className="bg-[#234674] text-white font-semibold px-3 py-3 text-center border border-[#234674] w-[80px]">
                          Subject
                        </th>
                        <th className="bg-[#234674] text-white font-semibold px-3 py-3 text-left border border-[#234674]">
                          Chapter
                        </th>
                        <th className="bg-[#234674] text-white font-semibold px-3 py-3 text-center border border-[#234674] w-[60px]">
                          Skill
                        </th>
                        <th className="bg-[#234674] text-white font-semibold px-3 py-3 text-center border border-[#234674] w-[60px]">
                          Bloom's
                        </th>
                        <th className="bg-[#234674] text-white font-semibold px-3 py-3 text-center border border-[#234674] w-[80px]">
                          Correct
                        </th>
                        <th className="bg-[#234674] text-white font-semibold px-3 py-3 text-center border border-[#234674] w-[100px]">
                          Student
                        </th>
                        <th className="bg-[#234674] text-white font-semibold px-3 py-3 text-center border border-[#234674] w-[80px]">
                          Result
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => {
                        const q = item.raw;
                        const ok = parseInt(q.is_correct) === 1;
                        const sk = !q.selected_option;
                        return (
                          <tr key={q.question_id || item.originalIndex}>
                            <td className="px-3 py-3 border border-[#e2edf8] text-center font-extrabold text-[#185FA5]">
                              {item.qLabel}
                            </td>
                            <td className="px-3 py-3 border border-[#e2edf8] text-center font-semibold text-[#444]">
                              {q.section}
                            </td>
                            <td className="px-3 py-3 border border-[#e2edf8] text-left font-semibold text-[#555]">
                              {q.chapter}
                            </td>
                            <td className="px-3 py-3 border border-[#e2edf8] text-center text-[#555]">
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
                              style={{
                                color: sk ? "#aaa" : ok ? "#1D9E75" : "#e24b4a",
                              }}>
                              {sk
                                ? "Skipped"
                                : q.selected_option?.toUpperCase()}
                            </td>
                            <td
                              className="px-3 py-3 border border-[#e2edf8] text-center font-extrabold"
                              style={{
                                color: sk ? "#aaa" : ok ? "#1D9E75" : "#e24b4a",
                              }}>
                              {sk ? "—" : ok ? "1" : "0"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* MOBILE: cards */}
                <div className="md:hidden space-y-2.5">
                  {items.map((item) => {
                    const q = item.raw;
                    const ok = parseInt(q.is_correct) === 1;
                    const sk = !q.selected_option;
                    const stateColor = sk ? "#aaa" : ok ? "#1D9E75" : "#e24b4a";
                    const stateBg = sk ? "#f0f4fb" : ok ? "#e6f7f1" : "#fff0f0";
                    const stateLabel = sk
                      ? "Skipped"
                      : ok
                        ? "Correct"
                        : "Wrong";
                    return (
                      <div
                        key={q.question_id || item.originalIndex}
                        className="border border-[#e2edf8] rounded-xl p-3.5 bg-white"
                        style={{ borderLeft: `4px solid ${stateColor}` }}>
                        {/* Top row: Q label + subject + result pill */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-[14px] font-extrabold text-[#185FA5] shrink-0">
                              {item.qLabel}
                            </span>
                            <span className="text-[10.5px] font-semibold text-[#666] bg-[#f0f4fb] px-2 py-0.5 rounded-full shrink-0">
                              {q.section}
                            </span>
                          </div>
                          <span
                            className="text-[10.5px] font-bold px-2.5 py-1 rounded-full shrink-0"
                            style={{ background: stateBg, color: stateColor }}>
                            {stateLabel}
                          </span>
                        </div>

                        {/* Chapter */}
                        <div className="text-[12.5px] font-semibold text-[#0d1f3c] mb-2 leading-snug">
                          {q.chapter}
                        </div>

                        {/* Skill + Bloom tags */}
                        <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
                          <span className="text-[10px] font-bold text-[#566074] bg-[#eef2f7] px-2 py-0.5 rounded font-['DM_Sans',sans-serif]">
                            {q.skill_type}
                          </span>
                          <span className="text-[10px] font-bold text-[#566074] bg-[#eef2f7] px-2 py-0.5 rounded font-['DM_Sans',sans-serif]">
                            {q.bloom_level}
                          </span>
                        </div>

                        {/* Answers */}
                        <div className="grid grid-cols-2 gap-2 text-[11.5px] font-['Inter',sans-serif]">
                          <div className="bg-[#f8fbff] rounded-md px-2.5 py-1.5">
                            <div className="text-[9.5px] text-[#888] uppercase tracking-wide font-semibold mb-0.5">
                              Correct
                            </div>
                            <div className="text-[#1D9E75] font-bold">
                              {q.correct?.toUpperCase() || "—"}
                            </div>
                          </div>
                          <div className="bg-[#f8fbff] rounded-md px-2.5 py-1.5">
                            <div className="text-[9.5px] text-[#888] uppercase tracking-wide font-semibold mb-0.5">
                              Student
                            </div>
                            <div
                              className="font-bold"
                              style={{ color: stateColor }}>
                              {sk ? "—" : q.selected_option?.toUpperCase()}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          });
        })()}
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
              Based on the data above, here is the exact roadmap to get {sName}{" "}
              ready for Class {tClass}.
            </div>

            {(() => {
              let plan = null;
              try {
                plan =
                  typeof activeReport.action_plan === "string"
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
                        {Object.entries(plan).map(([key, value], idx) => {
                          const label = key
                            .replace(/([a-zA-Z]+)(\d+)/, "$1 $2")
                            .replace(/^./, (c) => c.toUpperCase());
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
                        })}
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
    </div>
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
