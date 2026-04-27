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

const TABS = [
  { key: "teachers", label: "Teachers", Icon: Users, mobileLabel: "Teachers" },
  {
    key: "students",
    label: "Students",
    Icon: GraduationCap,
    mobileLabel: "Students",
  },
  {
    key: "assignments",
    label: "Assignments",
    Icon: Link2,
    mobileLabel: "Assign",
  },
  {
    key: "reports",
    label: "Reports",
    Icon: FileBarChart,
    mobileLabel: "Reports",
  },
];

const fieldCls =
  "w-full h-[44px] border-[1.5px] border-[#e2edf8] rounded-xl px-3.5 text-[13px] " +
  "font-['Inter',sans-serif] text-[#1a1a1a] bg-[#f8fbff] outline-none transition-all " +
  "placeholder:text-[#b8cce0] hover:border-[#a8c4e8] " +
  "focus:border-[#185FA5] focus:bg-white focus:ring-[3px] focus:ring-[#185FA5]/10";

const labelCls =
  "block text-[10px] font-bold text-[#185FA5] mb-1.5 tracking-wider uppercase";

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
        showToast(
          "ok",
          `${kind === "teacher" ? "Teacher" : "Student"} "${name}" removed.`,
        );
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
              <img
                src={logo}
                alt="logo"
                className="h-7 md:h-8 rounded-md bg-white p-0.5 shrink-0"
              />
              <span className="hidden md:inline text-sm font-bold text-white">
                Pramyan
              </span>
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
                onClick={() => {
                  removeToken();
                  navigate("/");
                }}
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
            <StatCard
              Icon={Users}
              num={teachers.length}
              label="Teachers"
              tone="blue"
            />
            <StatCard
              Icon={GraduationCap}
              num={students.length}
              label="Students"
              tone="green"
            />
            <StatCard
              Icon={Link2}
              num={students.filter((s) => s.assigned_teacher_id).length}
              label="Assigned"
              tone="purple"
            />
            <StatCard
              Icon={FileBarChart}
              num={students.filter((s) => s.test_id).length}
              label="Tested"
              tone="amber"
            />
          </div>

          {activeTab === "teachers" && (
            <TeachersTab
              teachers={teachers}
              loading={teachersLoading}
              onAdded={loadTeachers}
              onDelete={(t) =>
                setDelTarget({ kind: "teacher", id: t.id, name: t.name })
              }
              showToast={showToast}
            />
          )}
          {activeTab === "students" && (
            <StudentsTab
              students={students}
              loading={studentsLoading}
              onAdded={loadStudents}
              onDelete={(s) =>
                setDelTarget({ kind: "student", id: s.id, name: s.name })
              }
              showToast={showToast}
            />
          )}
          {activeTab === "assignments" && (
            <AssignmentsTab
              teachers={teachers}
              students={students}
              loading={teachersLoading || studentsLoading}
              onChanged={() => {
                loadTeachers();
                loadStudents();
              }}
              showToast={showToast}
            />
          )}
          {activeTab === "reports" && (
            <ReportsTab
              students={students}
              teachers={teachers}
              loading={studentsLoading}
            />
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
                  className={`relative flex-1 flex flex-col items-center justify-center gap-0.5 py-1.5 transition-colors ${
                    active ? "text-[#185FA5]" : "text-[#888]"
                  }`}>
                  {active && (
                    <span className="absolute top-0 w-8 h-0.5 rounded-b-full bg-[#185FA5]" />
                  )}
                  <Icon size={18} strokeWidth={active ? 2.5 : 2} />
                  <span
                    className={`text-[10px] font-['Inter',sans-serif] ${active ? "font-bold" : "font-medium"}`}>
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
                <AlertTriangle
                  size={28}
                  className="text-[#e24b4a]"
                  strokeWidth={2.25}
                />
              </div>
            </div>
            <div className="text-lg font-bold text-[#0d1f3c] text-center mb-2">
              Remove {delTarget.kind === "teacher" ? "Teacher" : "Student"}?
            </div>
            <div className="text-[13px] text-[#666] text-center leading-relaxed mb-5 font-['Inter',sans-serif]">
              Remove{" "}
              <strong className="text-[#0d1f3c]">{delTarget.name}</strong>? They
              will lose access immediately and any associated data may be
              affected.
            </div>
            <div className="flex flex-col-reverse md:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => setDelTarget(null)}
                className="flex-1 h-11 border-[1.5px] border-[#e2edf8] rounded-xl bg-white text-[13px] font-semibold text-[#888] cursor-pointer transition-colors hover:border-[#aaa] hover:text-[#555]">
                Cancel
              </button>
              <button
                type="button"
                onClick={performDelete}
                className="flex-1 h-11 rounded-xl bg-[linear-gradient(135deg,#e24b4a,#c43a39)] text-white text-[13px] font-bold cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_14px_rgba(226,75,74,0.3)]">
                Yes, Remove
              </button>
            </div>
          </Modal>
        )}

        {/* TOAST */}
        {toast && (
          <div
            className={`fixed top-20 md:top-24 right-3 md:right-6 z-50 anim-pop max-w-[340px] flex items-start gap-2.5 px-4 py-3 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] ${
              toast.type === "ok"
                ? "bg-[#e6f7f1] border-[1.5px] border-[#a7e6cc] text-[#1D9E75]"
                : "bg-[#fff0f0] border-[1.5px] border-[#ffd4d4] text-[#e24b4a]"
            }`}>
            {toast.type === "ok" ? (
              <CheckCircle2
                size={16}
                strokeWidth={2.25}
                className="shrink-0 mt-0.5"
              />
            ) : (
              <XCircle
                size={16}
                strokeWidth={2.25}
                className="shrink-0 mt-0.5"
              />
            )}
            <span className="text-[13px] font-semibold font-['Inter',sans-serif]">
              {toast.text}
            </span>
          </div>
        )}

        <span className="hidden">{admin?.name}</span>
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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
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
    return teachers.filter(
      (t) =>
        t.name?.toLowerCase().includes(q) || t.email?.toLowerCase().includes(q),
    );
  }, [teachers, search]);

  return (
    <div className="anim-fade-up space-y-4">
      <Card>
        <CardHeader
          Icon={UserPlus}
          title="Add New Teacher"
          subtitle="Teachers can view diagnostic reports for assigned students."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-1">
          <Field label="Full Name *" error={errs.name}>
            <input
              className={fieldCls}
              placeholder="e.g. Priya Sharma"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
          </Field>
          <Field label="Email Address *" error={errs.email}>
            <input
              type="email"
              className={fieldCls}
              placeholder="teacher@pramyan.com"
              value={form.email}
              onChange={(e) =>
                setForm((p) => ({ ...p, email: e.target.value }))
              }
            />
          </Field>
          <Field label="Password * (min 6)" error={errs.password}>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                className={`${fieldCls} pr-11`}
                placeholder="Set a password"
                value={form.password}
                onChange={(e) =>
                  setForm((p) => ({ ...p, password: e.target.value }))
                }
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                aria-label={showPwd ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a8c4e8] hover:text-[#185FA5] p-1">
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </Field>
        </div>
        <button
          type="button"
          onClick={submit}
          disabled={busy}
          className="mt-4 w-full md:w-auto md:px-7 h-12 rounded-xl bg-[linear-gradient(135deg,#1D9E75,#185FA5)] text-white text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_22px_rgba(24,95,165,0.25)] disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 disabled:hover:shadow-none">
          {busy ? (
            <Loader2 size={14} className="anim-spin" />
          ) : (
            <Plus size={14} strokeWidth={2.5} />
          )}
          {busy ? "Adding..." : "Add Teacher"}
        </button>
      </Card>

      <Card>
        <ListHeader
          title="All Teachers"
          count={teachers.length}
          search={search}
          setSearch={setSearch}
          searchPlaceholder="Search by name or email…"
        />
        {loading ? (
          <LoadingDots />
        ) : filtered.length === 0 ? (
          <Empty
            Icon={Users}
            title={teachers.length === 0 ? "No teachers yet" : "No matches"}
            text={
              teachers.length === 0
                ? "Add your first teacher using the form above."
                : "Try a different search term."
            }
          />
        ) : (
          <div className="divide-y divide-[#f0f4fb]">
            {filtered.map((t) => (
              <PersonRow
                key={t.id}
                name={t.name}
                email={t.email}
                meta={
                  t.created_at
                    ? `Added ${new Date(t.created_at).toLocaleDateString("en-IN")}`
                    : null
                }
                badge={{ label: "Teacher", tone: "blue" }}
                onDelete={() => onDelete(t)}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

/* STUDENTS TAB */
function StudentsTab({ students, loading, onAdded, onDelete, showToast }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    class: "",
    board: "",
  });
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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
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
    return students.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        String(s.class).includes(q),
    );
  }, [students, search]);

  return (
    <div className="anim-fade-up space-y-4">
      <Card>
        <CardHeader
          Icon={UserPlus}
          title="Add New Student"
          subtitle="Manually create a student account. They can also self-register."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
          <Field label="Full Name *" error={errs.name}>
            <input
              className={fieldCls}
              placeholder="e.g. Aarav Mehta"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
          </Field>
          <Field label="Email Address *" error={errs.email}>
            <input
              type="email"
              className={fieldCls}
              placeholder="student@example.com"
              value={form.email}
              onChange={(e) =>
                setForm((p) => ({ ...p, email: e.target.value }))
              }
            />
          </Field>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
          <Field label="Password *" error={errs.password}>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                className={`${fieldCls} pr-11`}
                placeholder="min 6 characters"
                value={form.password}
                onChange={(e) =>
                  setForm((p) => ({ ...p, password: e.target.value }))
                }
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a8c4e8] hover:text-[#185FA5] p-1"
                aria-label={showPwd ? "Hide password" : "Show password"}>
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </Field>
          <Field label="Class *" error={errs.class}>
            <select
              className={`${fieldCls} cursor-pointer appearance-none`}
              value={form.class}
              onChange={(e) =>
                setForm((p) => ({ ...p, class: e.target.value }))
              }>
              <option value="">Select Class</option>
              <option value="8">Class 8</option>
              <option value="9">Class 9</option>
              <option value="10">Class 10</option>
            </select>
          </Field>
          <Field label="Board *" error={errs.board}>
            <select
              className={`${fieldCls} cursor-pointer appearance-none`}
              value={form.board}
              onChange={(e) =>
                setForm((p) => ({ ...p, board: e.target.value }))
              }>
              <option value="">Select Board</option>
              <option value="CBSE">CBSE</option>
              <option value="ICSE">ICSE</option>
              <option value="State Board">State Board</option>
            </select>
          </Field>
        </div>
        <button
          type="button"
          onClick={submit}
          disabled={busy}
          className="mt-4 w-full md:w-auto md:px-7 h-12 rounded-xl bg-[linear-gradient(135deg,#1D9E75,#185FA5)] text-white text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_22px_rgba(24,95,165,0.25)] disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 disabled:hover:shadow-none">
          {busy ? (
            <Loader2 size={14} className="anim-spin" />
          ) : (
            <Plus size={14} strokeWidth={2.5} />
          )}
          {busy ? "Adding..." : "Add Student"}
        </button>
      </Card>

      <Card>
        <ListHeader
          title="All Students"
          count={students.length}
          search={search}
          setSearch={setSearch}
          searchPlaceholder="Search by name, email or class…"
        />
        {loading ? (
          <LoadingDots />
        ) : filtered.length === 0 ? (
          <Empty
            Icon={GraduationCap}
            title={students.length === 0 ? "No students yet" : "No matches"}
            text={
              students.length === 0
                ? "Students will appear here once added or self-registered."
                : "Try a different search term."
            }
          />
        ) : (
          <div className="divide-y divide-[#f0f4fb]">
            {filtered.map((s) => (
              <PersonRow
                key={s.id}
                name={s.name}
                email={s.email}
                meta={s.class ? `Class ${s.class} • ${s.board || "—"}` : null}
                badge={{
                  label: s.test_id ? "Tested" : "Pending",
                  tone: s.test_id ? "green" : "gray",
                }}
                onDelete={() => onDelete(s)}
              />
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
  const assignedStudents = useMemo(
    () => students.filter((s) => s.assigned_teacher_id === pickedTeacherId),
    [students, pickedTeacherId],
  );
  const unassignedStudents = useMemo(() => {
    const list = students.filter((s) => !s.assigned_teacher_id);
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q),
    );
  }, [students, search]);

  const callAssign = async (studentIds, teacherId) => {
    setBusy(true);
    try {
      const res = await fetch(apiUrl("assign-students.php"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          teacher_id: teacherId,
          student_ids: studentIds,
        }),
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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
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

  if (loading)
    return (
      <Card>
        <LoadingDots />
      </Card>
    );

  if (teachers.length === 0) {
    return (
      <Card>
        <Empty
          Icon={Users}
          title="No teachers yet"
          text="Add a teacher first, then come back here to assign students."
        />
      </Card>
    );
  }

  return (
    <div className="anim-fade-up space-y-4">
      <Card>
        <CardHeader
          Icon={Link2}
          title="Assign Students to Teachers"
          subtitle="Select a teacher to view and manage their student roster."
        />
        <div className="mt-2">
          <div className="text-[10px] font-bold text-[#185FA5] mb-2 tracking-wider uppercase">
            Pick a teacher
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {teachers.map((t) => {
              const active = pickedTeacherId === t.id;
              const count = students.filter(
                (s) => s.assigned_teacher_id === t.id,
              ).length;
              return (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setPickedTeacherId(t.id)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all text-left ${
                    active
                      ? "border-[#185FA5] bg-[#EEF4FF]"
                      : "border-[#e2edf8] bg-[#f8fbff] hover:border-[#a8c4e8]"
                  }`}>
                  <div className="w-9 h-9 rounded-full bg-[linear-gradient(135deg,#185FA5,#1D9E75)] flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {t.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[12.5px] font-semibold text-[#0d1f3c] truncate">
                      {t.name}
                    </div>
                    <div className="text-[11px] text-[#888] font-['Inter',sans-serif]">
                      {count} {count === 1 ? "student" : "students"}
                    </div>
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
            <CardHeader
              Icon={Users}
              title={`Currently assigned to ${pickedTeacher.name}`}
              subtitle={
                assignedStudents.length === 0
                  ? "No students are assigned yet."
                  : `${assignedStudents.length} student(s) assigned.`
              }
            />
            {assignedStudents.length > 0 && (
              <div className="divide-y divide-[#f0f4fb] mt-2">
                {assignedStudents.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 py-3">
                    <div className="w-9 h-9 rounded-full bg-[#E1F5EE] flex items-center justify-center text-[#1D9E75] text-sm font-bold shrink-0">
                      {s.name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-semibold text-[#0d1f3c] truncate">
                        {s.name}
                      </div>
                      <div className="text-[11px] text-[#888] font-['Inter',sans-serif] truncate">
                        Class {s.class || "—"} • {s.email}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => callUnassign(s.id)}
                      disabled={busy}
                      className="shrink-0 text-[#e24b4a] bg-[#fff0f0] border-[1.5px] border-[#ffd4d4] rounded-lg px-3 h-9 text-xs font-semibold cursor-pointer transition hover:bg-[#e24b4a] hover:text-white disabled:opacity-60">
                      Unassign
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <CardHeader
              Icon={Plus}
              title="Assign more students"
              subtitle="Tap a student to assign them to this teacher."
            />
            <div className="relative mt-2 mb-3">
              <Search
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a8c4e8]"
              />
              <input
                className={`${fieldCls} pl-10`}
                placeholder="Search unassigned students…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {unassignedStudents.length === 0 ? (
              <Empty
                Icon={GraduationCap}
                title="No unassigned students"
                text={
                  search
                    ? "Try a different search term."
                    : "All students are already assigned."
                }
              />
            ) : (
              <div className="divide-y divide-[#f0f4fb]">
                {unassignedStudents.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 py-3">
                    <div className="w-9 h-9 rounded-full bg-[#EEF4FF] flex items-center justify-center text-[#185FA5] text-sm font-bold shrink-0">
                      {s.name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-semibold text-[#0d1f3c] truncate">
                        {s.name}
                      </div>
                      <div className="text-[11px] text-[#888] font-['Inter',sans-serif] truncate">
                        Class {s.class || "—"} • {s.email}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => callAssign([s.id], pickedTeacher.id)}
                      disabled={busy}
                      className="shrink-0 bg-[linear-gradient(135deg,#1D9E75,#185FA5)] text-white rounded-lg px-3 h-9 text-xs font-bold cursor-pointer transition hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(24,95,165,0.25)] disabled:opacity-60">
                      Assign
                    </button>
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

/* REPORTS TAB */
function ReportsTab({ students, teachers, loading }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterTeacher, setFilterTeacher] = useState("all");

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
      list = list.filter(
        (s) => s.assigned_teacher_id === Number(filterTeacher),
      );
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.name?.toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [students, search, filterTeacher]);

  const openReport = (s) => {
    if (!s.test_id) return;
    navigate(`/report/${s.test_id}?student_id=${s.id}`);
  };

  return (
    <div className="anim-fade-up space-y-4">
      <Card>
        <CardHeader
          Icon={FileBarChart}
          title="Student Reports"
          subtitle="View any student's diagnostic report. Filter by their assigned teacher."
        />
        <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-2.5 mt-2">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a8c4e8]"
            />
            <input
              className={`${fieldCls} pl-10`}
              placeholder="Search students…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className={`${fieldCls} cursor-pointer appearance-none`}
            value={filterTeacher}
            onChange={(e) => setFilterTeacher(e.target.value)}>
            <option value="all">All teachers</option>
            <option value="unassigned">Unassigned</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                Under {t.name}
              </option>
            ))}
          </select>
        </div>
      </Card>

      <Card>
        {loading ? (
          <LoadingDots />
        ) : filtered.length === 0 ? (
          <Empty
            Icon={FileBarChart}
            title="No reports to show"
            text={
              students.length === 0
                ? "Students with completed tests will appear here."
                : "No students match your filters or have completed tests yet."
            }
          />
        ) : (
          <div className="divide-y divide-[#f0f4fb]">
            {filtered.map((s) => {
              const pct = Math.round(s.overall_pct ?? 0);
              const tone = pct >= 75 ? "green" : pct >= 50 ? "amber" : "red";
              const teacherName = s.assigned_teacher_id
                ? teacherById[s.assigned_teacher_id]?.name
                : null;
              return (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => openReport(s)}
                  className="w-full flex items-center gap-3 py-3 px-1 text-left transition-colors hover:bg-[#fafcff] group">
                  <div className="w-10 h-10 rounded-full bg-[linear-gradient(135deg,#185FA5,#1D9E75)] flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {s.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13.5px] font-semibold text-[#0d1f3c] truncate">
                      {s.name}
                    </div>
                    <div className="text-[11px] text-[#888] font-['Inter',sans-serif] truncate">
                      Class {s.class || "—"}
                      {teacherName && (
                        <>
                          <span className="mx-1.5">•</span>Under {teacherName}
                        </>
                      )}
                    </div>
                  </div>
                  <ScorePill pct={pct} tone={tone} />
                  <ChevronRight
                    size={16}
                    className="hidden md:block text-[#aaa] group-hover:text-[#185FA5] transition-colors shrink-0"
                    strokeWidth={2.25}
                  />
                </button>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

/* SHARED SUBCOMPONENTS */
function StatCard({ Icon, num, label, tone }) {
  const toneCls = {
    blue: "bg-[#EEF4FF] text-[#185FA5]",
    green: "bg-[#E1F5EE] text-[#1D9E75]",
    purple: "bg-[#f0e9ff] text-[#7c3aed]",
    amber: "bg-[#fff5e1] text-[#b97500]",
  }[tone];
  return (
    <div className="bg-white rounded-2xl p-3.5 md:p-4 shadow-[0_2px_14px_rgba(24,95,165,0.06)] border border-[#f0f4fb] flex items-center gap-3">
      <div
        className={`w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center shrink-0 ${toneCls}`}>
        <Icon size={18} strokeWidth={2.25} />
      </div>
      <div className="min-w-0">
        <div className="text-lg md:text-xl font-bold text-[#0d1f3c] leading-none">
          {num}
        </div>
        <div className="text-[10px] text-[#888] uppercase tracking-wide font-['Inter',sans-serif] mt-1">
          {label}
        </div>
      </div>
    </div>
  );
}

function Card({ children }) {
  return (
    <div className="bg-white rounded-2xl p-4 md:p-5 shadow-[0_2px_18px_rgba(24,95,165,0.07)] border border-[#f0f4fb]">
      {children}
    </div>
  );
}

function CardHeader({ Icon, title, subtitle }) {
  return (
    <div className="flex items-start gap-3 mb-3">
      <div className="w-9 h-9 rounded-xl bg-[#EEF4FF] flex items-center justify-center shrink-0">
        <Icon size={16} className="text-[#185FA5]" strokeWidth={2.25} />
      </div>
      <div className="min-w-0">
        <h2 className="text-[15px] md:text-[16px] font-bold text-[#0d1f3c] leading-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-[12px] text-[#888] font-['Inter',sans-serif] mt-0.5">
            {subtitle}
          </p>
        )}
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
        <span className="ml-2 text-[#888] font-medium font-['Inter',sans-serif]">
          ({count})
        </span>
      </div>
      <div className="relative md:w-[280px]">
        <Search
          size={13}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a8c4e8]"
        />
        <input
          className={`${fieldCls} h-10 pl-9 text-xs`}
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#e2edf8] flex items-center justify-center text-[#888] hover:bg-[#d4e4f7]">
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
        <div className="text-[13px] font-semibold text-[#0d1f3c] truncate">
          {name}
        </div>
        <div className="text-[11px] text-[#888] font-['Inter',sans-serif] truncate">
          {email}
          {meta && (
            <>
              <span className="mx-1.5 hidden md:inline">•</span>
              <span className="block md:inline">{meta}</span>
            </>
          )}
        </div>
      </div>
      {badge && (
        <span
          className={`hidden md:inline-flex border rounded-full px-2.5 py-1 text-[10.5px] font-bold tracking-wider ${badgeCls}`}>
          {badge.label}
        </span>
      )}
      <button
        type="button"
        onClick={onDelete}
        aria-label={`Remove ${name}`}
        className="shrink-0 w-9 h-9 md:w-auto md:h-9 md:px-3 rounded-lg bg-[#fff0f0] border-[1.5px] border-[#ffd4d4] text-[#e24b4a] flex items-center justify-center md:gap-1.5 text-xs font-semibold cursor-pointer transition hover:bg-[#e24b4a] hover:text-white hover:border-[#e24b4a]">
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
  return (
    <span
      className={`shrink-0 rounded-full px-3 py-1 text-[11.5px] font-bold font-['Inter',sans-serif] ${cls}`}>
      {pct}%
    </span>
  );
}

function Empty({ Icon, title, text }) {
  return (
    <div className="py-10 px-4 text-center border-[1.5px] border-dashed border-[#d4e4f7] rounded-2xl bg-[#fafcff]">
      <div className="w-12 h-12 rounded-full bg-[#EEF4FF] flex items-center justify-center mx-auto mb-3">
        <Icon size={22} className="text-[#185FA5]" strokeWidth={2} />
      </div>
      <div className="text-[14px] font-bold text-[#0d1f3c] mb-1">{title}</div>
      <div className="text-[12px] text-[#888] font-['Inter',sans-serif]">
        {text}
      </div>
    </div>
  );
}

function LoadingDots() {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-[#185FA5]">
      <Loader2 size={16} className="anim-spin" />
      <span className="text-xs font-semibold font-['Inter',sans-serif]">
        Loading…
      </span>
    </div>
  );
}

function Modal({ children, onClose }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);
  return (
    <div
      className="fixed inset-0 z-[999] bg-black/40 flex items-center justify-center p-4 anim-fade-up"
      role="dialog"
      aria-modal="true">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative bg-white rounded-3xl p-6 md:p-7 max-w-[400px] w-full shadow-[0_20px_60px_rgba(13,31,60,0.2)] anim-pop">
        {children}
      </div>
    </div>
  );
}
