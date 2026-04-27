import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  GraduationCap,
  Link2,
  FileBarChart,
  LogOut,
  Plus,
  Trash2,
  Search,
  X,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Eye,
  EyeOff,
  Loader2,
  UserPlus,
  Crown,
  ArrowLeft,
  Trophy,
  Inbox,
} from "lucide-react";
import logo from "../assets/logo.jpeg";
import { getToken, removeToken } from "../utils/auth";
import { apiUrl } from "../utils/api";

const keyframes = `
  @keyframes ap-fade-up { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes ap-pop     { from { opacity: 0; transform: scale(.95); }       to { opacity: 1; transform: scale(1); } }
  @keyframes ap-shake   { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
  @keyframes ap-spin    { to { transform: rotate(360deg); } }
  .anim-fade-up { animation: ap-fade-up 0.35s ease both; }
  .anim-pop     { animation: ap-pop 0.25s ease both; }
  .anim-shake   { animation: ap-shake 0.3s ease; }
  .anim-spin    { animation: ap-spin 1s linear infinite; }
`;

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
  if (pct >= 50) return { label: "⚠️ Average", bg: "#fff4e0", color: "#d97706" };
  return { label: "❌ Needs Work", bg: "#fff0f0", color: "#e24b4a" };
}

function getChapterStatus(pct) {
  const p = parseFloat(pct);
  if (p >= 70) return { label: "Strength", bg: "#e6f7f1", color: "#1D9E75" };
  if (p >= 40) return { label: "Gap area", bg: "#fcebc5", color: "#a06a1b" };
  return { label: "Priority", bg: "#fbeae9", color: "#c94a4a" };
}

const BLOOM_LEVELS = [
  { level: "L1", name: "Remember", meaning: "Recall facts & formulas", example: "What is the area formula for a trapezium?", action: "Use flashcards. Memorise formulas, definitions, key facts. 10-min daily recall drill.", barColor: "#185FA5" },
  { level: "L2", name: "Understand", meaning: "Explain or classify", example: "Why does a candle go out when covered?", action: "Ask 'why'. Use real-life examples. Connect concepts to things the student already knows.", barColor: "#2563a8" },
  { level: "L3", name: "Apply", meaning: "Solve using formulas", example: '"Find pressure if F=200N, A=0.4m²."', action: "Walk through NCERT solved examples step by step. Identify WHICH step fails — formula, substitution, or arithmetic.", barColor: "#3a7bd5" },
  { level: "L4", name: "Analyze", meaning: "Compare & reason", example: "How does increasing area reduce pressure? Give example.", action: "Cannot think through multi-step problems. Introduce analysis questions: 'What if...?', 'Compare A and B'.", barColor: "#1D9E75" },
  { level: "L5", name: "Evaluate", meaning: "Judge & justify", example: "Which method of food preservation is better and why?", action: "No higher-order thinking yet. Practice HOTS and competency-based questions from CBSE banks.", barColor: "#e07b2a" },
  { level: "L6", name: "Create", meaning: "Design & invent", example: "Design an experiment to show microorganism growth.", action: "N/A", barColor: "#aaa" },
];

const THREAT_HINTS = {
  Fractions: "Class 6 fractions", Decimals: "Class 6 decimals", Percentages: "Ratio and proportion",
  Geometry: "Class 6 geometry", "Geometry & symmetry": "Class 6 geometry", "Area & perimeter": "Mensuration",
  Average: "Data handling", "Food - sources & nutrition": "Class 6 food and nutrition",
  "Separation of substances": "Class 6 separation methods", "Changes around us": "Class 6 changes around us",
  "Getting to know plants": "Class 6 plants", "Body movements": "Class 6 skeletal system",
  "Living & non-living things": "Class 6 living world", Water: "Class 7 water chapter",
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
    return { chapter: ch.chapter, pct, section, category, label: `${ch.chapter} (${section} - ${pct}%)` };
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

  const conceptText = mathP1 >= 70 ? "understands concepts reasonably well" : mathP1 >= 45 ? "concept clarity in Math is moderate" : "concept layer in Math needs rebuilding";
  const mathExecText = mathDrop >= 20 ? `But as soon as they execute a calculation (P2) or apply it to a word problem (P3), the score drops sharply.` : `Their transition from concept (P1) to execution and application (P2/P3) is comparatively stable.`;
  const scienceText = sciP1 < 35 ? `In Science, even the concept layer is weak at ${sciP1}%.` : `In Science, the concept layer is ${sciP1}%, with further gains needed in P2 and P3.`;
  const closeText = sciP1 < 35 && mathDrop >= 20 ? "We have two different problems to fix." : "This gives us a clear focus for revision planning.";

  return `Notice: ${person}'s P1 in Math is ${mathP1}% - ${conceptText}. ${mathExecText} ${scienceText} ${closeText}`;
}

const TABS = [
  { key: "teachers", label: "Teachers", Icon: Users, mobileLabel: "Teachers" },
  { key: "students", label: "Students", Icon: GraduationCap, mobileLabel: "Students" },
  { key: "assignments", label: "Assignments", Icon: Link2, mobileLabel: "Assign" },
  { key: "reports", label: "Reports", Icon: FileBarChart, mobileLabel: "Reports" },
];

const fieldCls =
  "w-full h-[44px] border-[1.5px] border-[#e2edf8] rounded-xl px-3.5 text-[13px] " +
  "font-['Inter',sans-serif] text-[#1a1a1a] bg-[#f8fbff] outline-none transition-all " +
  "placeholder:text-[#b8cce0] hover:border-[#a8c4e8] " +
  "focus:border-[#185FA5] focus:bg-white focus:ring-[3px] focus:ring-[#185FA5]/10";

const labelCls = "block text-[10px] font-bold text-[#185FA5] mb-1.5 tracking-wider uppercase";

export default function AdminPanel() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [activeTab, setActiveTab] = useState("teachers");

  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachersLoading, setTeachersLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(true);

  const [delTarget, setDelTarget] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const token = getToken();
    if (!token) return navigate("/");
    const dec = decodeJWT(token);
    if (!dec || dec.role !== "admin") return navigate("/");
    setAdmin(dec);
    loadTeachers();
    loadStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

  const loadTeachers = async () => {
    setTeachersLoading(true);
    try {
      const res = await fetch(apiUrl("manage-teachers.php"), {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) setTeachers(data.teachers || []);
    } catch {
      /* keep empty */
    } finally {
      setTeachersLoading(false);
    }
  };

  const loadStudents = async () => {
    setStudentsLoading(true);
    try {
      const res = await fetch(apiUrl("manage-students.php"), {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) setStudents(data.students || []);
    } catch {
      /* keep empty */
    } finally {
      setStudentsLoading(false);
    }
  };

  const performDelete = async () => {
    if (!delTarget) return;
    const { kind, id, name } = delTarget;
    const url =
      kind === "teacher"
        ? apiUrl("manage-teachers.php")
        : apiUrl("manage-students.php");
    const body = kind === "teacher" ? { teacher_id: id } : { student_id: id };
    try {
      const res = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        showToast("ok", `${kind === "teacher" ? "Teacher" : "Student"} "${name}" removed.`);
        if (kind === "teacher") {
          setTeachers((prev) => prev.filter((t) => t.id !== id));
        } else {
          setStudents((prev) => prev.filter((s) => s.id !== id));
        }
      } else {
        showToast("err", data.message || "Failed to remove.");
      }
    } catch {
      showToast("err", "Network error. Please try again.");
    } finally {
      setDelTarget(null);
    }
  };

  return (
    <>
      <style>{keyframes}</style>

      <div className="min-h-screen bg-[#EEF4FF] font-['Sora',sans-serif] pb-[80px] md:pb-8">
        {/* TOP NAV */}
        <nav className="sticky top-0 md:top-2.5 z-40 mx-2.5 md:mx-4 mt-2.5 rounded-2xl bg-[linear-gradient(135deg,#1D9E75_0%,#185FA5_100%)] shadow-[0_6px_28px_rgba(24,95,165,0.22)]">
          <div className="flex items-center justify-between gap-2 px-3 md:px-6 h-14 md:h-16">
            <div className="flex items-center gap-2.5 min-w-0">
              <img src={logo} alt="logo" className="h-7 md:h-8 rounded-md bg-white p-0.5 shrink-0" />
              <span className="hidden md:inline text-sm font-bold text-white">Pramyan</span>
              <span className="bg-white/20 border border-white/30 rounded-full px-2.5 py-0.5 text-[9px] md:text-[10px] font-bold text-white tracking-wider font-['Inter',sans-serif] flex items-center gap-1">
                <Crown size={10} strokeWidth={2.5} />
                ADMIN
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate("/teacher")}
                className="hidden md:inline-flex items-center gap-1.5 bg-white/15 border border-white/30 text-white rounded-lg px-3.5 py-1.5 text-xs font-semibold cursor-pointer transition hover:bg-white/25">
                Teacher View
              </button>
              <button
                type="button"
                onClick={() => { removeToken(); navigate("/"); }}
                className="bg-white text-[#185FA5] rounded-lg px-3 md:px-4 py-1.5 text-xs font-bold cursor-pointer flex items-center gap-1.5 transition hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
                <LogOut size={12} strokeWidth={2.5} />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </div>
        </nav>

        {/* DESKTOP TABS */}
        <div className="hidden md:block max-w-[1080px] mx-auto px-4 mt-4">
          <div className="bg-white rounded-2xl p-1.5 shadow-[0_2px_14px_rgba(24,95,165,0.06)] flex gap-1">
            {TABS.map(({ key, label, Icon }) => (
              <button
                type="button"
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex-1 flex items-center justify-center gap-2 h-11 rounded-xl text-[13px] font-semibold transition-all ${
                  activeTab === key
                    ? "bg-[linear-gradient(135deg,#1D9E75,#185FA5)] text-white shadow-[0_4px_14px_rgba(24,95,165,0.25)]"
                    : "text-[#666] hover:bg-[#f0f4fb]"
                }`}>
                <Icon size={14} strokeWidth={2.25} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* MAIN */}
        <main className="max-w-[1080px] mx-auto px-3 md:px-4 py-4 md:py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-3 mb-4 md:mb-5 anim-fade-up">
            <StatCard Icon={Users} num={teachers.length} label="Teachers" tone="blue" />
            <StatCard Icon={GraduationCap} num={students.length} label="Students" tone="green" />
            <StatCard Icon={Link2} num={students.filter((s) => s.assigned_teacher_id).length} label="Assigned" tone="purple" />
            <StatCard Icon={FileBarChart} num={students.filter((s) => s.test_id).length} label="Tested" tone="amber" />
          </div>

          {activeTab === "teachers" && (
            <TeachersTab teachers={teachers} loading={teachersLoading} onAdded={loadTeachers} onDelete={(t) => setDelTarget({ kind: "teacher", id: t.id, name: t.name })} showToast={showToast} />
          )}
          {activeTab === "students" && (
            <StudentsTab students={students} loading={studentsLoading} onAdded={loadStudents} onDelete={(s) => setDelTarget({ kind: "student", id: s.id, name: s.name })} showToast={showToast} />
          )}
          {activeTab === "assignments" && (
            <AssignmentsTab teachers={teachers} students={students} loading={teachersLoading || studentsLoading} onChanged={() => { loadTeachers(); loadStudents(); }} showToast={showToast} />
          )}
          {activeTab === "reports" && (
            <ReportsTab students={students} teachers={teachers} loading={studentsLoading} />
          )}
        </main>

        {/* MOBILE BOTTOM TABS */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-[#e2edf8] shadow-[0_-4px_16px_rgba(24,95,165,0.08)] pt-1.5 pb-[max(8px,env(safe-area-inset-bottom))]">
          <div className="flex relative">
            {TABS.map(({ key, mobileLabel, Icon }) => {
              const active = activeTab === key;
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`relative flex-1 flex flex-col items-center justify-center gap-0.5 py-1.5 transition-colors ${active ? "text-[#185FA5]" : "text-[#888]"}`}>
                  {active && <span className="absolute top-0 w-8 h-0.5 rounded-b-full bg-[#185FA5]" />}
                  <Icon size={18} strokeWidth={active ? 2.5 : 2} />
                  <span className={`text-[10px] font-['Inter',sans-serif] ${active ? "font-bold" : "font-medium"}`}>
                    {mobileLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* DELETE MODAL */}
        {delTarget && (
          <Modal onClose={() => setDelTarget(null)}>
            <div className="flex justify-center mb-3">
              <div className="w-14 h-14 rounded-full bg-[#fcebeb] flex items-center justify-center">
                <AlertTriangle size={28} className="text-[#e24b4a]" strokeWidth={2.25} />
              </div>
            </div>
            <div className="text-lg font-bold text-[#0d1f3c] text-center mb-2">
              Remove {delTarget.kind === "teacher" ? "Teacher" : "Student"}?
            </div>
            <div className="text-[13px] text-[#666] text-center leading-relaxed mb-5 font-['Inter',sans-serif]">
              Remove <strong className="text-[#0d1f3c]">{delTarget.name}</strong>? They will lose access immediately and any associated data may be affected.
            </div>
            <div className="flex flex-col-reverse md:flex-row gap-2.5">
              <button type="button" onClick={() => setDelTarget(null)} className="flex-1 h-11 border-[1.5px] border-[#e2edf8] rounded-xl bg-white text-[13px] font-semibold text-[#888] cursor-pointer transition-colors hover:border-[#aaa] hover:text-[#555]">
                Cancel
              </button>
              <button type="button" onClick={performDelete} className="flex-1 h-11 rounded-xl bg-[linear-gradient(135deg,#e24b4a,#c43a39)] text-white text-[13px] font-bold cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_14px_rgba(226,75,74,0.3)]">
                Yes, Remove
              </button>
            </div>
          </Modal>
        )}

        {/* TOAST */}
        {toast && (
          <div className={`fixed top-20 md:top-24 right-3 md:right-6 z-50 anim-pop max-w-[340px] flex items-start gap-2.5 px-4 py-3 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] ${toast.type === "ok" ? "bg-[#e6f7f1] border-[1.5px] border-[#a7e6cc] text-[#1D9E75]" : "bg-[#fff0f0] border-[1.5px] border-[#ffd4d4] text-[#e24b4a]"}`}>
            {toast.type === "ok" ? <CheckCircle2 size={16} strokeWidth={2.25} className="shrink-0 mt-0.5" /> : <XCircle size={16} strokeWidth={2.25} className="shrink-0 mt-0.5" />}
            <span className="text-[13px] font-semibold font-['Inter',sans-serif]">{toast.text}</span>
          </div>
        )}
      </div>
    </>
  );
}

/* TEACHERS TAB */
function TeachersTab({ teachers, loading, onAdded, onDelete, showToast }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errs, setErrs] = useState({});
  const [busy, setBusy] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [search, setSearch] = useState("");

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = true;
    if (!form.email.includes("@")) e.email = true;
    if (form.password.length < 6) e.password = true;
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setBusy(true);
    try {
      const res = await fetch(apiUrl("add-teacher.php"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        showToast("ok", `Teacher "${form.name}" added successfully.`);
        setForm({ name: "", email: "", password: "" });
        onAdded();
      } else {
        showToast("err", data.message || "Failed to add teacher.");
      }
    } catch {
      showToast("err", "Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return teachers;
    const q = search.toLowerCase();
    return teachers.filter((t) => t.name?.toLowerCase().includes(q) || t.email?.toLowerCase().includes(q));
  }, [teachers, search]);

  return (
    <div className="anim-fade-up space-y-4">
      <Card>
        <CardHeader Icon={UserPlus} title="Add New Teacher" subtitle="Teachers can view diagnostic reports for assigned students." />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-1">
          <Field label="Full Name *" error={errs.name}>
            <input className={fieldCls} placeholder="e.g. Priya Sharma" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          </Field>
          <Field label="Email Address *" error={errs.email}>
            <input type="email" className={fieldCls} placeholder="teacher@pramyan.com" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
          </Field>
          <Field label="Password * (min 6)" error={errs.password}>
            <div className="relative">
              <input type={showPwd ? "text" : "password"} className={`${fieldCls} pr-11`} placeholder="Set a password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} />
              <button type="button" onClick={() => setShowPwd((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a8c4e8] hover:text-[#185FA5] p-1">
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </Field>
        </div>
        <button type="button" onClick={submit} disabled={busy} className="mt-4 w-full md:w-auto md:px-7 h-12 rounded-xl bg-[linear-gradient(135deg,#1D9E75,#185FA5)] text-white text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_22px_rgba(24,95,165,0.25)] disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 disabled:hover:shadow-none">
          {busy ? <Loader2 size={14} className="anim-spin" /> : <Plus size={14} strokeWidth={2.5} />}
          {busy ? "Adding..." : "Add Teacher"}
        </button>
      </Card>

      <Card>
        <ListHeader title="All Teachers" count={teachers.length} search={search} setSearch={setSearch} searchPlaceholder="Search by name or email…" />
        {loading ? <LoadingDots /> : filtered.length === 0 ? <Empty Icon={Users} title={teachers.length === 0 ? "No teachers yet" : "No matches"} text={teachers.length === 0 ? "Add your first teacher using the form above." : "Try a different search term."} /> : (
          <div className="divide-y divide-[#f0f4fb]">
            {filtered.map((t) => (
              <PersonRow key={t.id} name={t.name} email={t.email} meta={t.created_at ? `Added ${new Date(t.created_at).toLocaleDateString("en-IN")}` : null} badge={{ label: "Teacher", tone: "blue" }} onDelete={() => onDelete(t)} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

/* STUDENTS TAB */
function StudentsTab({ students, loading, onAdded, onDelete, showToast }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", class: "", board: "" });
  const [errs, setErrs] = useState({});
  const [busy, setBusy] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [search, setSearch] = useState("");

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = true;
    if (!form.email.includes("@")) e.email = true;
    if (form.password.length < 6) e.password = true;
    if (!form.class) e.class = true;
    if (!form.board) e.board = true;
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setBusy(true);
    try {
      const res = await fetch(apiUrl("manage-students.php"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        showToast("ok", `Student "${form.name}" added successfully.`);
        setForm({ name: "", email: "", password: "", class: "", board: "" });
        onAdded();
      } else {
        showToast("err", data.message || "Failed to add student.");
      }
    } catch {
      showToast("err", "Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return students;
    const q = search.toLowerCase();
    return students.filter((s) => s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q) || String(s.class).includes(q));
  }, [students, search]);

  return (
    <div className="anim-fade-up space-y-4">
      <Card>
        <CardHeader Icon={UserPlus} title="Add New Student" subtitle="Manually create a student account. They can also self-register." />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
          <Field label="Full Name *" error={errs.name}>
            <input className={fieldCls} placeholder="e.g. Aarav Mehta" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          </Field>
          <Field label="Email Address *" error={errs.email}>
            <input type="email" className={fieldCls} placeholder="student@example.com" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
          </Field>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
          <Field label="Password *" error={errs.password}>
            <div className="relative">
              <input type={showPwd ? "text" : "password"} className={`${fieldCls} pr-11`} placeholder="min 6 characters" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} />
              <button type="button" onClick={() => setShowPwd((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a8c4e8] hover:text-[#185FA5] p-1">
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </Field>
          <Field label="Class *" error={errs.class}>
            <select className={`${fieldCls} cursor-pointer appearance-none`} value={form.class} onChange={(e) => setForm((p) => ({ ...p, class: e.target.value }))}>
              <option value="">Select Class</option>
              <option value="8">Class 8</option>
              <option value="9">Class 9</option>
              <option value="10">Class 10</option>
            </select>
          </Field>
          <Field label="Board *" error={errs.board}>
            <select className={`${fieldCls} cursor-pointer appearance-none`} value={form.board} onChange={(e) => setForm((p) => ({ ...p, board: e.target.value }))}>
              <option value="">Select Board</option>
              <option value="CBSE">CBSE</option>
              <option value="ICSE">ICSE</option>
              <option value="State Board">State Board</option>
            </select>
          </Field>
        </div>
        <button type="button" onClick={submit} disabled={busy} className="mt-4 w-full md:w-auto md:px-7 h-12 rounded-xl bg-[linear-gradient(135deg,#1D9E75,#185FA5)] text-white text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_22px_rgba(24,95,165,0.25)] disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 disabled:hover:shadow-none">
          {busy ? <Loader2 size={14} className="anim-spin" /> : <Plus size={14} strokeWidth={2.5} />}
          {busy ? "Adding..." : "Add Student"}
        </button>
      </Card>

      <Card>
        <ListHeader title="All Students" count={students.length} search={search} setSearch={setSearch} searchPlaceholder="Search by name, email or class…" />
        {loading ? <LoadingDots /> : filtered.length === 0 ? <Empty Icon={GraduationCap} title={students.length === 0 ? "No students yet" : "No matches"} text={students.length === 0 ? "Students will appear here once added or self-registered." : "Try a different search term."} /> : (
          <div className="divide-y divide-[#f0f4fb]">
            {filtered.map((s) => (
              <PersonRow key={s.id} name={s.name} email={s.email} meta={s.class ? `Class ${s.class} • ${s.board || "—"}` : null} badge={{ label: s.test_id ? "Tested" : "Pending", tone: s.test_id ? "green" : "gray" }} onDelete={() => onDelete(s)} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ASSIGNMENTS TAB */
function AssignmentsTab({ teachers, students, loading, onChanged, showToast }) {
  const [pickedTeacherId, setPickedTeacherId] = useState(null);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);

  const pickedTeacher = teachers.find((t) => t.id === pickedTeacherId) || null;
  const assignedStudents = useMemo(() => students.filter((s) => s.assigned_teacher_id === pickedTeacherId), [students, pickedTeacherId]);
  const unassignedStudents = useMemo(() => {
    const list = students.filter((s) => !s.assigned_teacher_id);
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter((s) => s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q));
  }, [students, search]);

  const callAssign = async (studentIds, teacherId) => {
    setBusy(true);
    try {
      const res = await fetch(apiUrl("assign-students.php"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ teacher_id: teacherId, student_ids: studentIds }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("ok", `Assigned ${studentIds.length} student(s).`);
        onChanged();
      } else showToast("err", data.message || "Failed to assign.");
    } catch {
      showToast("err", "Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const callUnassign = async (studentId) => {
    setBusy(true);
    try {
      const res = await fetch(apiUrl("assign-students.php"), {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ student_id: studentId }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("ok", "Student unassigned.");
        onChanged();
      } else showToast("err", data.message || "Failed to unassign.");
    } catch {
      showToast("err", "Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Card><LoadingDots /></Card>;
  if (teachers.length === 0) return <Card><Empty Icon={Users} title="No teachers yet" text="Add a teacher first, then come back here to assign students." /></Card>;

  return (
    <div className="anim-fade-up space-y-4">
      <Card>
        <CardHeader Icon={Link2} title="Assign Students to Teachers" subtitle="Select a teacher to view and manage their student roster." />
        <div className="mt-2">
          <div className="text-[10px] font-bold text-[#185FA5] mb-2 tracking-wider uppercase">Pick a teacher</div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {teachers.map((t) => {
              const active = pickedTeacherId === t.id;
              const count = students.filter((s) => s.assigned_teacher_id === t.id).length;
              return (
                <button type="button" key={t.id} onClick={() => setPickedTeacherId(t.id)} className={`flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all text-left ${active ? "border-[#185FA5] bg-[#EEF4FF]" : "border-[#e2edf8] bg-[#f8fbff] hover:border-[#a8c4e8]"}`}>
                  <div className="w-9 h-9 rounded-full bg-[linear-gradient(135deg,#185FA5,#1D9E75)] flex items-center justify-center text-white text-sm font-bold shrink-0">{t.name?.[0]?.toUpperCase() || "?"}</div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[12.5px] font-semibold text-[#0d1f3c] truncate">{t.name}</div>
                    <div className="text-[11px] text-[#888] font-['Inter',sans-serif]">{count} {count === 1 ? "student" : "students"}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {pickedTeacher && (
        <>
          <Card>
            <CardHeader Icon={Users} title={`Currently assigned to ${pickedTeacher.name}`} subtitle={assignedStudents.length === 0 ? "No students are assigned yet." : `${assignedStudents.length} student(s) assigned.`} />
            {assignedStudents.length > 0 && (
              <div className="divide-y divide-[#f0f4fb] mt-2">
                {assignedStudents.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 py-3">
                    <div className="w-9 h-9 rounded-full bg-[#E1F5EE] flex items-center justify-center text-[#1D9E75] text-sm font-bold shrink-0">{s.name?.[0]?.toUpperCase() || "?"}</div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-semibold text-[#0d1f3c] truncate">{s.name}</div>
                      <div className="text-[11px] text-[#888] font-['Inter',sans-serif] truncate">Class {s.class || "—"} • {s.email}</div>
                    </div>
                    <button type="button" onClick={() => callUnassign(s.id)} disabled={busy} className="shrink-0 text-[#e24b4a] bg-[#fff0f0] border-[1.5px] border-[#ffd4d4] rounded-lg px-3 h-9 text-xs font-semibold cursor-pointer transition hover:bg-[#e24b4a] hover:text-white disabled:opacity-60">Unassign</button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <CardHeader Icon={Plus} title="Assign more students" subtitle="Tap a student to assign them to this teacher." />
            <div className="relative mt-2 mb-3">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a8c4e8]" />
              <input className={`${fieldCls} pl-10`} placeholder="Search unassigned students…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            {unassignedStudents.length === 0 ? (
              <Empty Icon={GraduationCap} title="No unassigned students" text={search ? "Try a different search term." : "All students are already assigned."} />
            ) : (
              <div className="divide-y divide-[#f0f4fb]">
                {unassignedStudents.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 py-3">
                    <div className="w-9 h-9 rounded-full bg-[#EEF4FF] flex items-center justify-center text-[#185FA5] text-sm font-bold shrink-0">{s.name?.[0]?.toUpperCase() || "?"}</div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-semibold text-[#0d1f3c] truncate">{s.name}</div>
                      <div className="text-[11px] text-[#888] font-['Inter',sans-serif] truncate">Class {s.class || "—"} • {s.email}</div>
                    </div>
                    <button type="button" onClick={() => callAssign([s.id], pickedTeacher.id)} disabled={busy} className="shrink-0 bg-[linear-gradient(135deg,#1D9E75,#185FA5)] text-white rounded-lg px-3 h-9 text-xs font-bold cursor-pointer transition hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(24,95,165,0.25)] disabled:opacity-60">Assign</button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}

/* REPORTS TAB WITH INLINE FORMATTING */
function ReportsTab({ students, teachers, loading }) {
  const [search, setSearch] = useState("");
  const [filterTeacher, setFilterTeacher] = useState("all");

  const [activeStudent, setActiveStudent] = useState(null);
  const [report, setReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState("");

  const teacherById = useMemo(() => {
    const map = {};
    teachers.forEach((t) => (map[t.id] = t));
    return map;
  }, [teachers]);

  const filtered = useMemo(() => {
    let list = students.filter((s) => s.test_id);
    if (filterTeacher === "unassigned") {
      list = list.filter((s) => !s.assigned_teacher_id);
    } else if (filterTeacher !== "all") {
      list = list.filter((s) => s.assigned_teacher_id === Number(filterTeacher));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q));
    }
    return list;
  }, [students, search, filterTeacher]);

  const openReport = async (s) => {
    if (!s.test_id) return;
    setActiveStudent(s);
    setReportLoading(true);
    setReportError("");
    try {
      const res = await fetch(apiUrl(`get-student-report.php?student_id=${s.id}&test_id=${s.test_id}`), {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) {
        setReport(data);
      } else {
        setReportError(data.message || "Failed to load report data.");
      }
    } catch (err) {
      setReportError("Network error. Please try again.");
    } finally {
      setReportLoading(false);
    }
  };

  if (activeStudent) {
    return (
      <div className="anim-fade-up">
        <button onClick={() => { setActiveStudent(null); setReport(null); }} className="flex items-center gap-1.5 text-[#185FA5] text-[13px] font-semibold cursor-pointer active:scale-95 transition mb-5 bg-white px-4 py-2 rounded-xl border border-[#d4e4f7] shadow-sm w-fit hover:bg-[#f8fbff]">
          <ArrowLeft size={16} strokeWidth={2.5} />
          Back to Reports List
        </button>

        {reportLoading ? (
          <Card><LoadingDots /></Card>
        ) : reportError ? (
          <Card>
             <div className="bg-[#fff0f0] px-4 py-4 rounded-xl text-[#e24b4a] flex items-center gap-2 text-[14px] font-semibold border border-[#ffd4d4]">
               <AlertTriangle size={18} /> {reportError}
             </div>
          </Card>
        ) : report && (
          <FormatReport report={report} student={activeStudent} teacherName={teacherById[activeStudent.assigned_teacher_id]?.name} />
        )}
      </div>
    );
  }

  return (
    <div className="anim-fade-up space-y-4">
      <Card>
        <CardHeader Icon={FileBarChart} title="Student Reports" subtitle="View any student's diagnostic report. Filter by their assigned teacher." />
        <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-2.5 mt-2">
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a8c4e8]" />
            <input className={`${fieldCls} pl-10`} placeholder="Search students…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className={`${fieldCls} cursor-pointer appearance-none`} value={filterTeacher} onChange={(e) => setFilterTeacher(e.target.value)}>
            <option value="all">All teachers</option>
            <option value="unassigned">Unassigned</option>
            {teachers.map((t) => <option key={t.id} value={t.id}>Under {t.name}</option>)}
          </select>
        </div>
      </Card>

      <Card>
        {loading ? <LoadingDots /> : filtered.length === 0 ? <Empty Icon={FileBarChart} title="No reports to show" text={students.length === 0 ? "Students with completed tests will appear here." : "No students match your filters or have completed tests yet."} /> : (
          <div className="divide-y divide-[#f0f4fb]">
            {filtered.map((s) => {
              const pct = Math.round(s.overall_pct ?? 0);
              const tone = pct >= 75 ? "green" : pct >= 50 ? "amber" : "red";
              const teacherName = s.assigned_teacher_id ? teacherById[s.assigned_teacher_id]?.name : null;
              return (
                <button type="button" key={s.id} onClick={() => openReport(s)} className="w-full flex items-center gap-3 py-3 px-1 text-left transition-colors hover:bg-[#fafcff] group">
                  <div className="w-10 h-10 rounded-full bg-[linear-gradient(135deg,#185FA5,#1D9E75)] flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {s.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13.5px] font-semibold text-[#0d1f3c] truncate">{s.name}</div>
                    <div className="text-[11px] text-[#888] font-['Inter',sans-serif] truncate">
                      Class {s.class || "—"}
                      {teacherName && <><span className="mx-1.5">•</span>Under {teacherName}</>}
                    </div>
                  </div>
                  <ScorePill pct={pct} tone={tone} />
                  <ChevronRight size={16} className="hidden md:block text-[#aaa] group-hover:text-[#185FA5] transition-colors shrink-0" strokeWidth={2.25} />
                </button>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

// ==========================================
// BEAUTIFUL REPORT FORMATTER
// ==========================================
function FormatReport({ report, student, teacherName }) {
  // DYNAMIC RECALCULATION ENGINE 
  let activeReport = { ...report };

  if (report.questions && report.questions.length > 0) {
    const qs = report.questions;

    const parseQLabel = (qText = '') => {
      const match = qText.match(/Q(\d+)(?:\(([a-zA-Z])\))?/i);
      if (match) return { num: parseInt(match[1]), sub: match[2]?.toLowerCase() ?? null };
      return { num: null, sub: null };
    };

    const grouped = {};
    qs.forEach((q, i) => {
      const { num } = parseQLabel(q.q_text);
      const qKey = num !== null ? `Q${num}` : `RAW_${i}`; // Group key

      if (!grouped[qKey]) {
        grouped[qKey] = {
          chapter: q.chapter || "Unknown",
          section: (q.section || "").toLowerCase(),
          bloom_level: (q.bloom_level || "UNKNOWN").toUpperCase(),
          skill_type: (q.skill_type || "").toUpperCase(),
          risk_if_weak: q.risk_if_weak || "",
          all_correct: true,
          was_answered: false,
        };
      }

      if (parseInt(q.is_correct) !== 1) {
        grouped[qKey].all_correct = false; 
      }

      if (q.selected_option && String(q.selected_option).trim() !== "") {
        grouped[qKey].was_answered = true;
      }
    });

    const parentQs = Object.values(grouped);
    const totalMax = parentQs.length;

    let totalScore = 0;
    let mathMax = 0, mathScore = 0;
    let sciMax = 0, sciScore = 0;
    let skipped = 0;

    const bMap = {}; 
    const cMap = {};
    let p1m = 0, p1s = 0, p2m = 0, p2s = 0, p3m = 0, p3s = 0;

    parentQs.forEach((q) => {
      const ok = q.all_correct;
      if (ok) totalScore++;
      if (!q.was_answered) skipped++;

      // Subjects
      if (q.section.includes("math")) {
        mathMax++;
        if (ok) mathScore++;
      } else if (q.section.includes("sci")) {
        sciMax++;
        if (ok) sciScore++;
      }

      // Bloom
      const lvl = q.bloom_level;
      if (!bMap[lvl]) bMap[lvl] = { max_score: 0, score: 0 };
      bMap[lvl].max_score++;
      if (ok) bMap[lvl].score++;

      // Chapters
      const ch = q.chapter;
      if (!cMap[ch]) cMap[ch] = {
          chapter: ch,
          subject: q.section === "math" ? "Mathematics" : q.section === "sci" ? "Science" : q.section,
          swot_category: "",
          max_score: 0,
          score: 0,
          risk_if_weak: q.risk_if_weak || "",
      };
      cMap[ch].max_score++;
      if (ok) cMap[ch].score++;

      // Skills
      const sk = q.skill_type;
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

    const bloom_scores = Object.keys(bMap).map((k) => ({
      bloom_level: k,
      score: bMap[k].score,
      max_score: bMap[k].max_score,
      pct: bMap[k].max_score > 0 ? ((bMap[k].score / bMap[k].max_score) * 100).toFixed(2) : 0,
    }));

    const chapter_scores = Object.values(cMap).map((c) => {
        const calcPct = c.max_score > 0 ? ((c.score / c.max_score) * 100).toFixed(2) : 0;
        let swotCat = "weakness";
        if (calcPct >= 70) swotCat = "strength";
        else if (calcPct >= 40) swotCat = "opportunity";

        return {
          ...c,
          pct: calcPct,
          swot_category: swotCat,
        };
      }).sort((a, b) => b.pct - a.pct);

    activeReport = {
      ...activeReport,
      total_score: totalScore,
      max_score: totalMax,
      overall_pct: totalMax > 0 ? ((totalScore / totalMax) * 100).toFixed(2) : 0,
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

  const perf = getPerf(activeReport.overall_pct);
  const mathSt = getStatus(activeReport.math_pct);
  const sciSt = getStatus(activeReport.sci_pct);
  const sName = student.name.split(" ")[0];
  const tClass = activeReport.test_class || student.class || "10";

  const chapterSectionMap = buildChapterSectionMap(activeReport.questions || []);
  const swot = buildSwotBuckets(activeReport.chapter_scores || [], chapterSectionMap);
  const skillRows = buildSkillRows(activeReport);
  const skillInsight = buildSkillInsight(sName, activeReport);

  const classNum = Number(student.class);
  const hasClassNum = Number.isFinite(classNum) && classNum > 0;
  const currentClass = hasClassNum ? `Class ${classNum}` : "current class";
  const nextClass = hasClassNum ? `Class ${classNum + 1}` : "next class";
  const strengthCount = swot.strength.length;
  const priorityCount = swot.weakness.length;

  const l1Pct = activeReport.bloom_scores?.find((b) => b.bloom_level.toUpperCase().includes("L1"))?.pct || 0;
  const l2Score = activeReport.bloom_scores?.find((b) => b.bloom_level.toUpperCase().includes("L2"))?.score || 0;

  return (
    <div className="pb-10">
      {/* Student Header */}
      <div className="bg-white rounded-[18px] px-5 py-5 mb-6 shadow-[0_4px_16px_rgba(24,95,165,0.05)] border border-[#e2edf8] flex items-center gap-4">
        <div className="w-[54px] h-[54px] rounded-full bg-[linear-gradient(135deg,#1D9E75,#185FA5)] flex items-center justify-center text-white text-xl font-extrabold shrink-0">
          {student.name[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[17px] font-bold text-[#0d1f3c] mb-0.5 truncate">{student.name}</div>
          <div className="text-[12.5px] text-[#666] font-['Inter',sans-serif] truncate mb-1.5">{student.email}</div>
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

      <div className="flex items-center gap-2 mt-4 mb-5 text-[15px] md:text-base font-extrabold text-[#185FA5]">
        <span>📊</span><span>Overall Score</span>
      </div>

      {/* Hero */}
      <div className="bg-[linear-gradient(135deg,#1D9E75_0%,#185FA5_100%)] rounded-3xl p-6 md:p-8 mb-6 shadow-[0_8px_32px_rgba(24,95,165,0.2)] flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-white/80 font-['Inter',sans-serif]">Diagnostic Assessment Result</span>
          <span className="text-[20px] md:text-[22px] font-extrabold text-white">{sName}'s Full Report</span>
          <span className="text-xs text-white/70 font-['Inter',sans-serif]">Admin View — All Sections Unlocked</span>
        </div>
        <div className="flex items-center justify-between md:justify-end gap-5 md:flex-shrink-0">
          <div className="text-left md:text-right">
            <div className="text-sm font-bold text-white">{perf.label}</div>
            <div className="text-xs text-white/70">Performance</div>
          </div>
          <div className="w-24 h-24 rounded-full bg-white/15 border-[3px] border-white/40 flex flex-col items-center justify-center shrink-0">
            <span className="text-[28px] font-extrabold text-white leading-none">{activeReport.total_score}</span>
            <span className="text-xs text-white/70 font-['DM_Sans',sans-serif]">/ {activeReport.max_score}</span>
          </div>
        </div>
      </div>

      {/* Subjects */}
      <div className="flex items-center gap-2 mt-9 mb-5 text-[15px] md:text-base font-extrabold text-[#185FA5]">
        <span>📚</span><span>Subject-wise Score</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-[18px] p-6 shadow-[0_4px_16px_rgba(24,95,165,0.05)] border border-[#e2edf8]">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-[15px] font-bold text-[#0d1f3c]">
              <div className="w-7 h-7 rounded-[7px] bg-[#EEF4FF] flex items-center justify-center text-sm">📐</div>Mathematics
            </div>
            <span className="text-xl font-extrabold text-[#185FA5]">{activeReport.math_pct}%</span>
          </div>
          <div className="h-2 bg-[#f0f4fb] rounded-full my-3 overflow-hidden">
            <div className="h-full rounded-full transition-[width] duration-1000 ease-out bg-[linear-gradient(90deg,#185FA5,#1D9E75)]" style={{ width: `${activeReport.math_pct}%` }} />
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#aaa] font-['DM_Sans',sans-serif]">
            <span>{activeReport.math_score} / {activeReport.math_max} marks</span>
            <span className="text-[11px] font-semibold px-2.5 py-[3px] rounded-full" style={{ background: mathSt.bg, color: mathSt.color }}>{mathSt.label}</span>
          </div>
        </div>
        <div className="bg-white rounded-[18px] p-6 shadow-[0_4px_16px_rgba(24,95,165,0.05)] border border-[#e2edf8]">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-[15px] font-bold text-[#0d1f3c]">
              <div className="w-7 h-7 rounded-[7px] bg-[#e6f7f1] flex items-center justify-center text-sm">🔬</div>Science
            </div>
            <span className="text-xl font-extrabold text-[#1D9E75]">{activeReport.sci_pct}%</span>
          </div>
          <div className="h-2 bg-[#f0f4fb] rounded-full my-3 overflow-hidden">
            <div className="h-full rounded-full transition-[width] duration-1000 ease-out bg-[linear-gradient(90deg,#1D9E75,#185FA5)]" style={{ width: `${activeReport.sci_pct}%` }} />
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#aaa] font-['DM_Sans',sans-serif]">
            <span>{activeReport.sci_score} / {activeReport.sci_max} marks</span>
            <span className="text-[11px] font-semibold px-2.5 py-[3px] rounded-full" style={{ background: sciSt.bg, color: sciSt.color }}>{sciSt.label}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { i: "✅", v: activeReport.correct, l: "Correct", c: "#1D9E75" },
          { i: "❌", v: activeReport.wrong, l: "Wrong", c: "#e24b4a" },
          { i: "⬜", v: activeReport.unanswered, l: "Skipped", c: "#aaa" },
          { i: "🎯", v: `${activeReport.overall_pct}%`, l: "Overall", c: "#185FA5" },
        ].map((st, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 md:p-5 text-center border border-[#e2edf8]">
            <div className="text-lg mb-1">{st.i}</div>
            <div className="text-[20px] md:text-[22px] font-extrabold mt-1.5" style={{ color: st.c }}>{st.v}</div>
            <div className="text-[10px] text-[#aaa] uppercase tracking-wide font-['DM_Sans',sans-serif] mt-0.5">{st.l}</div>
          </div>
        ))}
      </div>

      {/* SWOT Block */}
      <div className="bg-white border border-[#e2edf8] rounded-[20px] p-5 md:p-10 mb-6 shadow-[0_4px_24px_rgba(24,95,165,0.06)]">
        <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-white bg-[#1D9E75] px-2.5 py-1 rounded-full uppercase tracking-wider mb-3 font-['DM_Sans',sans-serif]">
          BLOCK 1 - SWOT
        </div>
        <div className="text-[20px] md:text-2xl font-extrabold text-[#0d1f3c] mb-2 leading-tight">What is SWOT Analysis?</div>
        <div className="text-[13px] md:text-sm text-[#444] leading-relaxed font-['Inter',sans-serif] mb-5">
          This section explains chapter-wise placement in four zones so parents clearly understand transition readiness.
        </div>
        <div className="bg-[#f2f1ff] border-l-4 border-[#7c83fd] text-[#4a4f8a] rounded-r-lg px-5 py-4 italic text-[13px] font-['Inter',sans-serif] leading-relaxed mb-6">
          {`We don't just give a pass or fail mark. We use a SWOT analysis - a 360 degrees framework to show exactly where ${sName} stands today. SWOT stands for four things - let me explain each one.`}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SwotBox tone="strength" title="S - Strength" desc="Chapters scoring 70% or above." items={swot.strength} />
          <SwotBox tone="opportunity" title="O - Opportunity" desc="Chapters scoring 40% to 69%." items={swot.opportunity} />
          <SwotBox tone="weakness" title="W - Weakness" desc="Chapters scoring below 40%." items={swot.weakness} emptyMsg="No priority chapters!" emptyTone="green" />
          <SwotBox tone="threat" title="T - Threat" desc="Higher-grade concepts directly at risk from weak areas." items={swot.threats.map((t) => ({ chapter: t, label: t }))} zoneTitle="Likely consequences:" emptyMsg="No immediate threat pattern detected" emptyTone="green" />
        </div>
        <div className="bg-[#f2f1ff] border-l-4 border-[#7c83fd] text-[#4a4f8a] rounded-r-lg px-5 py-4 italic text-[13px] font-['Inter',sans-serif] leading-relaxed mt-3">
          {`Think of it like a building. If the foundation (${currentClass}) has cracks, we cannot safely build the first floor (${nextClass}) on top of it. Right now ${sName} has ${strengthCount} Strength chapters and ${priorityCount} Priority chapters. That is why we are having this conversation today.`}
        </div>
      </div>

      {/* SKILL Block */}
      <div className="bg-white border border-[#e2edf8] rounded-[20px] p-5 md:p-10 mb-6 shadow-[0_4px_24px_rgba(24,95,165,0.06)]">
        <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-white bg-[#1D9E75] px-2.5 py-1 rounded-full uppercase tracking-wider mb-3 font-['DM_Sans',sans-serif]">
          BLOCK 2 - SKILL
        </div>
        <div className="text-[20px] md:text-2xl font-extrabold text-[#0d1f3c] mb-2 leading-tight">What is Skill Analysis? (P1 / P2 / P3)</div>
        <div className="text-[13px] md:text-sm text-[#444] leading-relaxed font-['Inter',sans-serif] mb-5">
          This section shows why errors happened, not just how many. The same score can come from very different skill gaps.
        </div>
        <div className="bg-[#f2f1ff] border-l-4 border-[#7c83fd] text-[#4a4f8a] rounded-r-lg px-5 py-4 italic text-[13px] font-['Inter',sans-serif] leading-relaxed mb-6">
          {`Every question was tagged with one of three skill levels - P1, P2 or P3. This tells us not just what ${sName} got wrong, but why. That is far more useful for planning ${sName}'s revision.`}
        </div>
        <div className="grid gap-3">
          <SkillCard tone="c1" code="P1" title="Conceptual clarity - understanding why" desc="Can the child recall concepts, classify, and identify core ideas before solving?" />
          <SkillCard tone="c2" code="P2" title="Procedural accuracy - executing steps correctly" desc="Can the child apply methods in sequence without missing required steps?" />
          <SkillCard tone="c3" code="P3" title="Application - solving new, real-world problems" desc="Can the child transfer concepts to unfamiliar situations and HOTS-style questions?" />
        </div>
        <div className="mt-6 bg-white border border-[#e2edf8] rounded-xl p-5 md:p-6">
          <h5 className="text-[15px] text-[#0d1f3c] mb-4 font-extrabold">{`${sName}'s skill breakdown - Mathematics and Science`}</h5>
          {skillRows.map((row, idx) => (
            <div key={`sr-${idx}`} className="grid grid-cols-[44px_1fr_44px] md:grid-cols-[48px_1fr_48px] gap-3 items-center mb-3">
              <div className="bg-[#eef2f7] text-[#566074] rounded-full text-[10px] md:text-[11px] font-extrabold text-center py-1 font-['DM_Sans',sans-serif]">{row.code}</div>
              <div className="min-w-0">
                <div className="text-[11.5px] md:text-xs font-semibold text-[#333] mb-1.5 font-['Inter',sans-serif] truncate">{row.title}</div>
                <div className="h-3 rounded-full bg-[#eef2f7] overflow-hidden">
                  <div className="h-full rounded-full transition-[width] duration-1000" style={{ width: `${row.pct}%`, background: row.color }} />
                </div>
              </div>
              <div className="text-right text-[12px] md:text-[13px] font-bold text-[#333]">{row.pct}%</div>
            </div>
          ))}
        </div>
        <div className="bg-[#f2f1ff] border-l-4 border-[#7c83fd] text-[#4a4f8a] rounded-r-lg px-5 py-4 italic text-[13px] font-['Inter',sans-serif] leading-relaxed mt-3">
          {`"${skillInsight}"`}
        </div>
      </div>

      {/* BLOOM Block */}
      <div className="flex items-center gap-2 mt-9 mb-5 text-[15px] md:text-base font-extrabold text-[#185FA5]">
        <span>🌸</span><span>Bloom's Taxonomy — Cognitive Level Analysis</span>
      </div>
      {activeReport.bloom_scores?.length > 0 ? (
        <div className="bg-white rounded-[20px] p-5 md:p-10 shadow-[0_4px_24px_rgba(24,95,165,0.06)] border border-[#e2edf8] mb-8">
          <div className="text-[16px] md:text-xl font-extrabold text-[#0d1f3c] mb-3 uppercase">BLOOM'S TAXONOMY — COGNITIVE LEVEL ANALYSIS</div>
          <div className="text-[13px] md:text-sm text-[#444] mb-6 leading-relaxed font-['Inter',sans-serif]">
            Bloom's Taxonomy measures HOW DEEPLY a student understands — not just WHAT they know. 6 levels from simple recall to creative thinking.
          </div>
          <div className="font-extrabold text-[15px] md:text-base mb-5 text-[#0d1f3c]">▌ THE SIX LEVELS — Explained for Parents</div>
          <div className="overflow-x-auto -mx-2 px-2">
            <table className="w-full border-collapse font-['Inter',sans-serif] text-[12px] md:text-[13.5px] mb-8 min-w-[700px]">
              <thead>
                <tr>
                  <th className="bg-[#234674] text-white font-semibold px-3 py-3 text-center border border-[#234674] w-[10%]">Level</th>
                  <th className="bg-[#234674] text-white font-semibold px-3 py-3 text-center border border-[#234674] w-[15%]">Name</th>
                  <th className="bg-[#234674] text-white font-semibold px-3 py-3 text-center border border-[#234674] w-[30%]">Meaning</th>
                  <th className="bg-[#234674] text-white font-semibold px-3 py-3 text-center border border-[#234674] w-[25%]">Example Q</th>
                  <th className="bg-[#234674] text-white font-semibold px-3 py-3 text-center border border-[#234674] w-[5%]">Max Marks</th>
                  <th className="bg-[#234674] text-white font-semibold px-3 py-3 text-center border border-[#234674] w-[5%]">Scored</th>
                  <th className="bg-[#234674] text-white font-semibold px-3 py-3 text-center border border-[#234674] w-[10%]">Score %</th>
                </tr>
              </thead>
              <tbody>
                {BLOOM_LEVELS.map((levelObj, i) => {
                  const dbScore = activeReport.bloom_scores?.find((b) => b.bloom_level.toUpperCase().includes(levelObj.level));
                  const maxMarks = dbScore ? dbScore.max_score : levelObj.level === "L6" ? "-" : 0;
                  const scored = dbScore ? dbScore.score : levelObj.level === "L6" ? "N/A" : 0;
                  const pct = dbScore ? dbScore.pct : levelObj.level === "L6" ? "N/A" : 0;
                  return (
                    <tr key={i}>
                      <td className="px-3 py-3 border border-[#e2edf8] text-center font-bold">{levelObj.level}</td>
                      <td className="px-3 py-3 border border-[#e2edf8] text-left font-semibold text-[#185FA5]">{levelObj.name}</td>
                      <td className="px-3 py-3 border border-[#e2edf8] text-left text-[#555]">{levelObj.meaning}</td>
                      <td className="px-3 py-3 border border-[#e2edf8] text-left text-[#555] italic text-[12px]">{levelObj.example}</td>
                      <td className="px-3 py-3 border border-[#e2edf8] text-center font-semibold">{maxMarks}</td>
                      <td className="px-3 py-3 border border-[#e2edf8] text-center font-semibold">{scored}</td>
                      <td className="px-3 py-3 border border-[#e2edf8] text-center font-extrabold" style={{ color: pct !== "N/A" && pct >= 50 ? "#1D9E75" : "#e24b4a" }}>
                        {pct !== "N/A" ? `${pct}%` : pct}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="font-extrabold text-[15px] md:text-base mb-5 mt-10 text-[#0d1f3c]">▌ VISUAL: Marks Scored vs Maximum at Each Cognitive Level</div>
          <div className="relative mt-10 mb-10 ml-[90px] md:ml-[140px] pb-8 border-l-2 border-b-2 border-[#cbd5e1]">
            <div className="absolute inset-0 flex justify-between z-0 pointer-events-none">
              {[0, 20, 40, 60, 80, 100].map((val) => (
                <div key={val} className="w-px h-full bg-[#e2edf8] relative">
                  <span className="absolute -bottom-6 -translate-x-1/2 text-xs text-[#64748b] font-['Inter',sans-serif]">{val}%</span>
                </div>
              ))}
            </div>
            {BLOOM_LEVELS.slice(0, 5).map((levelObj, i) => {
              const dbScore = activeReport.bloom_scores?.find((b) => b.bloom_level.toUpperCase().includes(levelObj.level));
              const pct = dbScore ? parseFloat(dbScore.pct) : 0;
              return (
                <div key={i} className="relative z-[1] flex items-center h-10 mb-4">
                  <div className="absolute -left-[100px] md:-left-[150px] w-[90px] md:w-[140px] text-[11px] md:text-[13px] font-semibold text-right text-[#334155] font-['Inter',sans-serif]">
                    {levelObj.level} {levelObj.name}
                  </div>
                  <div className="h-6 rounded-r flex items-center pl-2.5 text-white font-bold text-[11px] md:text-xs font-['Inter',sans-serif] transition-[width] duration-1000 min-w-[30px]" style={{ width: `${pct}%`, background: levelObj.barColor }}>
                    {pct}%
                  </div>
                </div>
              );
            })}
          </div>
          <div className="bg-[#F6F3FA] border-l-4 border-[#8E62B6] px-5 py-4 my-6 italic text-[#49335E] text-[13px] md:text-sm font-['Inter',sans-serif] leading-relaxed rounded-r-lg">
            "{sName} currently struggles at every level — including basic recall (L1 at {l1Pct}%). The most urgent fix is L2 — they scored {l2Score} here, which means they are memorising facts without truly understanding them. This explains why they know a concept but cannot solve a problem with it."
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[20px] p-10 mb-8 text-center text-[#888] border border-[#e2edf8]">No Bloom's Taxonomy data available.</div>
      )}

      {/* CHAPTER Block */}
      <div className="flex items-center gap-2 mt-9 mb-5 text-[15px] md:text-base font-extrabold text-[#185FA5]">
        <span>📈</span><span>Chapter-wise Analysis</span>
      </div>
      {activeReport.chapter_scores?.length > 0 ? (
        <div className="bg-white rounded-[20px] p-5 md:p-10 shadow-[0_4px_24px_rgba(24,95,165,0.06)] border border-[#e2edf8] mb-8">
          <div className="text-[16px] md:text-xl font-extrabold text-[#0d1f3c] mb-3">Chapter-wise Analysis — All {activeReport.chapter_scores.length} Chapters</div>
          <div className="text-[13px] md:text-sm text-[#444] mb-5 leading-relaxed font-['Inter',sans-serif]">
            Walk through the full chapter breakdown so the parent can see exactly where {sName} stands in every topic.
          </div>
          <div className="bg-[#F6F3FA] border-l-4 border-[#8E62B6] px-5 py-4 my-6 italic text-[#49335E] text-[13px] md:text-sm font-['Inter',sans-serif] leading-relaxed rounded-r-lg">
            "We tested {activeReport.chapter_scores.length} chapters from the Class {tClass} syllabus. Each chapter is scored and placed in one of three bands."
          </div>
          <div className="overflow-x-auto -mx-2 px-2">
            <table className="w-full border-collapse font-['Inter',sans-serif] text-[12px] md:text-[13.5px] mb-6 min-w-[700px]">
              <thead>
                <tr>
                  <th className="bg-[#234674] text-white font-semibold px-3 py-3 text-center border border-[#234674] w-[25%]">Chapter</th>
                  <th className="bg-[#234674] text-white font-semibold px-3 py-3 text-center border border-[#234674] w-[15%]">Subject</th>
                  <th className="bg-[#234674] text-white font-semibold px-3 py-3 text-center border border-[#234674] w-[10%]">Marks</th>
                  <th className="bg-[#234674] text-white font-semibold px-3 py-3 text-center border border-[#234674] w-[10%]">Score %</th>
                  <th className="bg-[#234674] text-white font-semibold px-3 py-3 text-center border border-[#234674] w-[15%]">Status</th>
                  <th className="bg-[#234674] text-white font-semibold px-3 py-3 text-left border border-[#234674] w-[25%]">Class {tClass} Risk if Weak</th>
                </tr>
              </thead>
              <tbody>
                {activeReport.chapter_scores.map((ch, i) => {
                  const status = getChapterStatus(ch.pct);
                  let subject = ch.subject;
                  let risk = ch.risk_if_weak;
                  if (!subject || !risk) {
                    const qMatch = activeReport.questions?.find((q) => q.chapter === ch.chapter);
                    if (qMatch) {
                      if (!subject) subject = qMatch.section;
                      if (!risk) risk = qMatch.risk_if_weak;
                    }
                  }
                  return (
                    <tr key={i}>
                      <td className="px-3 py-3 border border-[#e2edf8] text-left font-semibold text-[#185FA5]">{ch.chapter}</td>
                      <td className="px-3 py-3 border border-[#e2edf8] text-center font-semibold">{subject || "N/A"}</td>
                      <td className="px-3 py-3 border border-[#e2edf8] text-center font-semibold">{ch.score} / {ch.max_score}</td>
                      <td className="px-3 py-3 border border-[#e2edf8] text-center font-extrabold" style={{ color: status.color }}>{ch.pct}%</td>
                      <td className="px-3 py-3 border border-[#e2edf8] text-center">
                        <span className="font-bold px-3 py-1 rounded-full inline-block" style={{ background: status.bg, color: status.color }}>{status.label}</span>
                      </td>
                      <td className="px-3 py-3 border border-[#e2edf8] text-left text-[#555] text-[12px]">{risk || `Class ${tClass} foundations`}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="bg-[#e6f7f1] border-2 border-[#a3e6cd] px-5 py-4 rounded-xl text-[13px] md:text-sm text-[#1a4f3e] font-['Inter',sans-serif] leading-relaxed">
            <strong>Important note for parents:</strong> This report is not a judgment — it is a map. It tells us exactly where to go next.
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[20px] p-10 mb-8 text-center text-[#888] border border-[#e2edf8]">No Chapter Analysis data available.</div>
      )}

      {/* RAW QUESTION ANALYSIS */}
      <div className="flex items-center gap-2 mt-9 mb-5 text-[15px] md:text-base font-extrabold text-[#185FA5]">
        <span>📋</span><span>Score Entry / Question Data</span>
      </div>
      <div className="bg-white rounded-[20px] p-5 md:p-10 shadow-[0_4px_24px_rgba(24,95,165,0.06)] border border-[#e2edf8] mb-8">
        <div className="text-[16px] md:text-xl font-extrabold text-[#0d1f3c] mb-3">Raw Question Analysis</div>
        <div className="text-[13px] md:text-sm text-[#444] mb-5 leading-relaxed font-['Inter',sans-serif]">
          Detailed question-by-question breakdown mapped to skills and cognitive levels.
        </div>
        <div className="overflow-x-auto -mx-2 px-2">
          <table className="w-full border-collapse font-['Inter',sans-serif] text-[12px] md:text-[13.5px] min-w-[750px]">
            <thead>
              <tr>
                <th className="bg-[#234674] text-white font-semibold px-3 py-3 text-center border border-[#234674]">Q No.</th>
                <th className="bg-[#234674] text-white font-semibold px-3 py-3 text-center border border-[#234674]">Subject</th>
                <th className="bg-[#234674] text-white font-semibold px-3 py-3 text-center border border-[#234674]">Chapter</th>
                <th className="bg-[#234674] text-white font-semibold px-3 py-3 text-center border border-[#234674]">Parameter / Skill</th>
                <th className="bg-[#234674] text-white font-semibold px-3 py-3 text-center border border-[#234674]">Bloom's</th>
                <th className="bg-[#234674] text-white font-semibold px-3 py-3 text-center border border-[#234674]">Correct Ans</th>
                <th className="bg-[#234674] text-white font-semibold px-3 py-3 text-center border border-[#234674]">Student Ans</th>
                <th className="bg-[#234674] text-white font-semibold px-3 py-3 text-center border border-[#234674]">Marks / Result</th>
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
                    <tr key={q.question_id || i}>
                      <td className="px-3 py-3 border border-[#e2edf8] text-center font-extrabold text-[#185FA5]">{qLabel}</td>
                      <td className="px-3 py-3 border border-[#e2edf8] text-center font-semibold text-[#444]">{q.section}</td>
                      <td className="px-3 py-3 border border-[#e2edf8] text-left font-semibold text-[#555]">{q.chapter}</td>
                      <td className="px-3 py-3 border border-[#e2edf8] text-left text-[#555]">{q.skill_type}</td>
                      <td className="px-3 py-3 border border-[#e2edf8] text-center font-semibold">{q.bloom_level}</td>
                      <td className="px-3 py-3 border border-[#e2edf8] text-center font-bold text-[#1D9E75]">{q.correct?.toUpperCase()}</td>
                      <td className="px-3 py-3 border border-[#e2edf8] text-center font-bold" style={{ color: sk ? "#aaa" : ok ? "#1D9E75" : "#e24b4a" }}>
                        {sk ? "Skipped" : q.selected_option?.toUpperCase()}
                      </td>
                      <td className="px-3 py-3 border border-[#e2edf8] text-center font-extrabold" style={{ color: ok ? "#1D9E75" : "#e24b4a" }}>
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
            <span>📝</span><span>Next Steps</span>
          </div>
          <div className="bg-[linear-gradient(135deg,#f8fbff,#EEF4FF)] border border-[#c9dff7] rounded-[20px] p-5 md:p-10 shadow-[0_4px_24px_rgba(24,95,165,0.06)] mb-8">
            <div className="text-[16px] md:text-xl font-extrabold text-[#0d1f3c] mb-3">Recommended 4-Week Action Plan</div>
            <div className="text-[13px] md:text-sm text-[#444] mb-5 leading-relaxed font-['Inter',sans-serif]">
              Based on the data above, here is the exact roadmap to get {sName} ready for Class {tClass}.
            </div>
            {(() => {
              let plan = null;
              try {
                plan = typeof activeReport.action_plan === "string" ? JSON.parse(activeReport.action_plan) : activeReport.action_plan;
              } catch (e) {
                return <div className="text-[13px] text-[#555] whitespace-pre-line font-['Inter',sans-serif]">{activeReport.action_plan}</div>;
              }
              if (plan && typeof plan === "object") {
                return (
                  <div className="overflow-x-auto -mx-2 px-2">
                    <table className="w-full border-collapse font-['Inter',sans-serif] text-[12px] md:text-[13.5px] bg-white">
                      <tbody>
                        {Object.entries(plan).map(([key, value], idx) => {
                          const label = key.replace(/([a-zA-Z]+)(\d+)/, "$1 $2").replace(/^./, (c) => c.toUpperCase());
                          return (
                            <tr key={idx}>
                              <td className="w-[20%] px-3 py-3 border border-[#e2edf8] font-extrabold text-[#185FA5] bg-[#f8fbff]">{label}</td>
                              <td className="px-3 py-3 border border-[#e2edf8] text-[#555] leading-relaxed">{value}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              }
              return <div className="text-[13px] text-[#555] font-['Inter',sans-serif]">{activeReport.action_plan}</div>;
            })()}
          </div>
        </>
      )}
    </div>
  );
}

function SwotBox({ tone, title, desc, items, zoneTitle = "Chapters in this zone:", emptyMsg = "No chapters in this zone yet", emptyTone = "muted" }) {
  const TONE = {
    strength: "border-[#7bd7b5] bg-[#edf8f2]",
    opportunity: "border-[#f0b66a] bg-[#fff7eb]",
    weakness: "border-[#f2b3a7] bg-[#fff2ef]",
    threat: "border-[#9ec0ea] bg-[#eef5ff]",
  }[tone];
  const EMPTY = emptyTone === "green" ? "text-[#1D9E75]" : "text-[#888]";
  return (
    <div className={`border-2 rounded-xl p-5 bg-white ${TONE}`}>
      <h4 className="text-[15px] md:text-base text-[#0d1f3c] mb-2 font-extrabold">{title}</h4>
      <p className="text-[12px] text-[#666] leading-relaxed font-['Inter',sans-serif]">{desc}</p>
      <div className="mt-4 mb-2 text-[12px] text-[#333] font-bold font-['Inter',sans-serif]">{zoneTitle}</div>
      <div className="text-[12px] text-[#444] leading-[1.7] font-['Inter',sans-serif] font-medium">
        {items.length > 0 ? items.map((x, i) => <div key={`${tone}-${i}`} className="mb-1">- {x.label || x}</div>) : <div className={`italic ${EMPTY}`}>- {emptyMsg}</div>}
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
        <div className={`font-extrabold text-2xl leading-none w-8 font-['Sora',sans-serif] ${TONE.code}`}>{code}</div>
        <div className="text-[14px] md:text-[15px] font-bold text-[#0d1f3c] font-['Sora',sans-serif]">{title}</div>
      </div>
      <div className="text-[12.5px] md:text-[13px] text-[#444] font-['Inter',sans-serif] leading-relaxed">{desc}</div>
    </div>
  );
}

// ... HELPER COMPONENTS (DO NOT DELETE) ...
function StatCard({ Icon, num, label, tone }) {
  const toneCls = {
    blue: "bg-[#EEF4FF] text-[#185FA5]",
    green: "bg-[#E1F5EE] text-[#1D9E75]",
    purple: "bg-[#f0e9ff] text-[#7c3aed]",
    amber: "bg-[#fff5e1] text-[#b97500]",
  }[tone];
  return (
    <div className="bg-white rounded-2xl p-3.5 md:p-4 shadow-[0_2px_14px_rgba(24,95,165,0.06)] border border-[#f0f4fb] flex items-center gap-3">
      <div className={`w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center shrink-0 ${toneCls}`}>
        <Icon size={18} strokeWidth={2.25} />
      </div>
      <div className="min-w-0">
        <div className="text-lg md:text-xl font-bold text-[#0d1f3c] leading-none">{num}</div>
        <div className="text-[10px] text-[#888] uppercase tracking-wide font-['Inter',sans-serif] mt-1">{label}</div>
      </div>
    </div>
  );
}

function Card({ children }) {
  return <div className="bg-white rounded-2xl p-4 md:p-5 shadow-[0_2px_18px_rgba(24,95,165,0.07)] border border-[#f0f4fb]">{children}</div>;
}

function CardHeader({ Icon, title, subtitle }) {
  return (
    <div className="flex items-start gap-3 mb-3">
      <div className="w-9 h-9 rounded-xl bg-[#EEF4FF] flex items-center justify-center shrink-0">
        <Icon size={16} className="text-[#185FA5]" strokeWidth={2.25} />
      </div>
      <div className="min-w-0">
        <h2 className="text-[15px] md:text-[16px] font-bold text-[#0d1f3c] leading-tight">{title}</h2>
        {subtitle && <p className="text-[12px] text-[#888] font-['Inter',sans-serif] mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div className={error ? "anim-shake" : ""}>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

function ListHeader({ title, count, search, setSearch, searchPlaceholder }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2.5 mb-3">
      <div className="text-[13px] font-bold text-[#0d1f3c]">
        {title}
        <span className="ml-2 text-[#888] font-medium font-['Inter',sans-serif]">({count})</span>
      </div>
      <div className="relative md:w-[280px]">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a8c4e8]" />
        <input className={`${fieldCls} h-10 pl-9 text-xs`} placeholder={searchPlaceholder} value={search} onChange={(e) => setSearch(e.target.value)} />
        {search && (
          <button type="button" onClick={() => setSearch("")} aria-label="Clear search" className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#e2edf8] flex items-center justify-center text-[#888] hover:bg-[#d4e4f7]">
            <X size={10} strokeWidth={2.5} />
          </button>
        )}
      </div>
    </div>
  );
}

function PersonRow({ name, email, meta, badge, onDelete }) {
  const badgeCls = {
    blue: "bg-[#EEF4FF] text-[#185FA5] border-[#d4e4f7]",
    green: "bg-[#E1F5EE] text-[#1D9E75] border-[#a7e6cc]",
    gray: "bg-[#f0f4fb] text-[#888] border-[#e2edf8]",
  }[badge?.tone || "blue"];
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="w-10 h-10 rounded-full bg-[linear-gradient(135deg,#185FA5,#1D9E75)] flex items-center justify-center text-white text-sm font-bold shrink-0">
        {name?.[0]?.toUpperCase() || "?"}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-semibold text-[#0d1f3c] truncate">{name}</div>
        <div className="text-[11px] text-[#888] font-['Inter',sans-serif] truncate">
          {email}
          {meta && <><span className="mx-1.5 hidden md:inline">•</span><span className="block md:inline">{meta}</span></>}
        </div>
      </div>
      {badge && <span className={`hidden md:inline-flex border rounded-full px-2.5 py-1 text-[10.5px] font-bold tracking-wider ${badgeCls}`}>{badge.label}</span>}
      <button type="button" onClick={onDelete} aria-label={`Remove ${name}`} className="shrink-0 w-9 h-9 md:w-auto md:h-9 md:px-3 rounded-lg bg-[#fff0f0] border-[1.5px] border-[#ffd4d4] text-[#e24b4a] flex items-center justify-center md:gap-1.5 text-xs font-semibold cursor-pointer transition hover:bg-[#e24b4a] hover:text-white hover:border-[#e24b4a]">
        <Trash2 size={13} strokeWidth={2.25} />
        <span className="hidden md:inline">Remove</span>
      </button>
    </div>
  );
}

function ScorePill({ pct, tone }) {
  const cls = {
    green: "bg-[#E1F5EE] text-[#1D9E75]",
    amber: "bg-[#fff5e1] text-[#b97500]",
    red: "bg-[#fcebeb] text-[#e24b4a]",
  }[tone];
  return <span className={`shrink-0 rounded-full px-3 py-1 text-[11.5px] font-bold font-['Inter',sans-serif] ${cls}`}>{pct}%</span>;
}

function Empty({ Icon, title, text }) {
  return (
    <div className="py-10 px-4 text-center border-[1.5px] border-dashed border-[#d4e4f7] rounded-2xl bg-[#fafcff]">
      <div className="w-12 h-12 rounded-full bg-[#EEF4FF] flex items-center justify-center mx-auto mb-3">
        <Icon size={22} className="text-[#185FA5]" strokeWidth={2} />
      </div>
      <div className="text-[14px] font-bold text-[#0d1f3c] mb-1">{title}</div>
      <div className="text-[12px] text-[#888] font-['Inter',sans-serif]">{text}</div>
    </div>
  );
}

function LoadingDots() {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-[#185FA5]">
      <Loader2 size={16} className="anim-spin" />
      <span className="text-xs font-semibold font-['Inter',sans-serif]">Loading…</span>
    </div>
  );
}

function Modal({ children, onClose }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);
  return (
    <div className="fixed inset-0 z-[999] bg-black/40 flex items-center justify-center p-4 anim-fade-up" role="dialog" aria-modal="true">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative bg-white rounded-3xl p-6 md:p-7 max-w-[400px] w-full shadow-[0_20px_60px_rgba(13,31,60,0.2)] anim-pop">
        {children}
      </div>
    </div>
  );
}