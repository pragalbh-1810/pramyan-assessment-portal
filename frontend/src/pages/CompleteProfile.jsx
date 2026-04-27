import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronDown, AlertCircle } from "lucide-react";
import logo from "../assets/logo.jpeg";
import { setToken, setRole } from "../utils/auth";
import { apiUrl } from "../utils/api";

// Keyframes that aren't in Tailwind by default
const keyframes = `
  @keyframes cp-fade-up {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes cp-float {
    0%, 100% { transform: translateY(0); }
    50%      { transform: translateY(-8px); }
  }
  @keyframes cp-orbit-1 {
    from { transform: rotate(0deg) translateX(100px) rotate(0deg); }
    to   { transform: rotate(360deg) translateX(100px) rotate(-360deg); }
  }
  @keyframes cp-orbit-2 {
    from { transform: rotate(180deg) translateX(75px) rotate(-180deg); }
    to   { transform: rotate(540deg) translateX(75px) rotate(-540deg); }
  }
  .anim-fade-up { animation: cp-fade-up 0.6s ease both; }
  .anim-fade-up-delay { animation: cp-fade-up 0.6s ease 0.2s both; }
  .anim-float   { animation: cp-float 4s ease-in-out infinite; }
  .anim-orbit-1 { animation: cp-orbit-1 9s linear infinite; }
  .anim-orbit-2 { animation: cp-orbit-2 6s linear infinite; }
`;

// Shared input/select styling (matches SignUp's pattern for consistency)
const fieldCls =
  "w-full h-[42px] border-[1.5px] border-[#e2edf8] rounded-[10px] px-3 text-[13px] " +
  "font-['Inter',sans-serif] text-[#1a1a1a] bg-[#f8fbff] outline-none transition-all " +
  "appearance-none placeholder:text-[#b8cce0] " +
  "hover:border-[#a8c4e8] focus:border-[#185FA5] focus:bg-white focus:ring-[3px] focus:ring-[#185FA5]/10";

const labelCls =
  "block text-[10px] font-bold text-[#185FA5] mb-1 tracking-wider uppercase";

const errorCls = "text-[#e24b4a] text-[11px] mt-0.5 font-['Inter',sans-serif]";

export default function CompleteProfile() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [form, setForm] = useState({ class: "", board: "", parentPhone: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (!t) {
      navigate("/signup");
      return;
    }

    setToken(t);
    setRole("student");

    try {
      const decoded = JSON.parse(atob(t.split(".")[1]));
      setName(decoded.name || "");
      setEmail(decoded.email || "");
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validate = () => {
    const e = {};
    if (!form.class) e.class = "Select your class";
    if (!form.board) e.board = "Select your board";
    if (!form.parentPhone.trim()) e.parentPhone = "Phone is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch(apiUrl("update-profile.php"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          class: form.class,
          board: form.board,
          parent_phone: form.parentPhone,
        }),
      });
      const data = await res.json();

      if (data.success) {
        if (data.token) setToken(data.token);
        const classToTestId = { 8: 3, 9: 2, 10: 1 };
        const testId = classToTestId[String(form.class)] || 1;
        navigate(`/instructions/${testId}`);
      } else {
        setErrors({ api: data.message || "Failed to save profile" });
      }
    } catch {
      setErrors({ api: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const STEPS = [
    { num: "1", label: "Google Sign In", done: true },
    { num: "2", label: "Complete Profile", done: false, current: true },
    { num: "3", label: "Start Your Test", done: false },
  ];

  return (
    <>
      <style>{keyframes}</style>

      {/* Outer wrapper — natural scroll on mobile, centered on desktop */}
      <div className="min-h-screen w-full bg-[#EEF4FF] font-['Sora',sans-serif] flex items-start md:items-center justify-center p-3 md:p-6">
        <div className="anim-fade-up flex flex-col md:flex-row w-full max-w-[900px] md:min-h-[540px] rounded-2xl md:rounded-[28px] overflow-hidden shadow-[0_20px_60px_rgba(74,144,217,0.15)] bg-white">
          {/* LEFT PANEL — gradient brand side */}
          <div className="relative w-full md:w-[38%] bg-[linear-gradient(145deg,#1D9E75_0%,#185FA5_100%)] flex flex-col items-center justify-center px-6 py-7 md:px-8 md:py-10 overflow-hidden">
            {/* decorative blobs */}
            <div
              className="absolute -top-16 -right-16 w-[200px] h-[200px] rounded-full bg-white/[0.08]"
              aria-hidden
            />
            <div
              className="absolute -bottom-10 -left-10 w-[160px] h-[160px] rounded-full bg-white/[0.06]"
              aria-hidden
            />

            {/* orbit rings — desktop only */}
            <div
              className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] pointer-events-none"
              aria-hidden>
              <div className="absolute inset-0 rounded-full border border-dashed border-white/15" />
              <div className="absolute inset-[22px] rounded-full border border-dashed border-white/10" />
              <div className="anim-orbit-1 absolute top-1/2 left-1/2 w-2 h-2 -m-1 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
              <div className="anim-orbit-2 absolute top-1/2 left-1/2 w-1.5 h-1.5 -m-[3px] rounded-full bg-white/70" />
            </div>

            {/* logo */}
            <div className="anim-float relative z-10 w-full mb-5">
              <div className="bg-white rounded-2xl px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.15)] flex items-center justify-center">
                <img
                  src={logo}
                  alt="Pramyan Logo"
                  className="block w-full max-w-[160px] h-auto"
                />
              </div>
            </div>

            {/* welcome text */}
            <div className="relative z-10 text-center mb-5">
              <h2 className="text-white text-[17px] font-semibold leading-relaxed mb-1.5">
                Almost there!
              </h2>
              <p className="text-white/70 text-xs font-['Inter',sans-serif]">
                Just a few details to personalise your experience
              </p>
            </div>

            {/* step indicator — desktop visible, mobile hidden (the form title is enough on mobile) */}
            <div className="relative z-10 hidden md:flex flex-col gap-2.5 w-full">
              {STEPS.map((s, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border transition ${
                    s.current
                      ? "bg-white/[0.18] border-white/30"
                      : "bg-white/[0.12] border-white/[0.18]"
                  }`}>
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                      s.done
                        ? "bg-[#1D9E75] text-white"
                        : "bg-white/90 text-[#185FA5]"
                    }`}>
                    {s.done ? <Check size={12} strokeWidth={3} /> : s.num}
                  </span>
                  <span className="text-xs text-white font-['Inter',sans-serif]">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>

            {/* compact step pills on mobile */}
            <div className="relative z-10 md:hidden flex items-center justify-center gap-1.5">
              {STEPS.map((s, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all ${
                    s.done
                      ? "w-6 bg-[#1D9E75]"
                      : s.current
                        ? "w-9 bg-white"
                        : "w-4 bg-white/30"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* RIGHT PANEL — form */}
          <div className="relative flex-1 bg-white flex items-center justify-center px-6 py-7 md:px-12 md:py-10 overflow-hidden">
            {/* decorative bg circles — desktop only */}
            <div
              className="hidden md:block absolute -top-16 -right-16 w-[220px] h-[220px] rounded-full bg-[#EEF4FF]/60 pointer-events-none"
              aria-hidden
            />
            <div
              className="hidden md:block absolute -bottom-10 -left-10 w-[160px] h-[160px] rounded-full bg-[#E1F5EE]/50 pointer-events-none"
              aria-hidden
            />

            <div className="anim-fade-up-delay relative z-10 w-full max-w-[360px]">
              {/* title */}
              <div className="mb-5 text-left">
                <h2 className="text-[22px] font-bold text-[#0d1f3c] mb-1">
                  Complete Your Profile
                </h2>
                <p className="text-xs text-[#999] font-['Inter',sans-serif]">
                  We need a few more details to get you started
                </p>
              </div>

              {/* welcome banner */}
              {name && (
                <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-[#EEF4FF] border-[1.5px] border-[#d4e4f7] rounded-xl mb-5">
                  <div className="w-9 h-9 rounded-full bg-[linear-gradient(135deg,#1D9E75,#185FA5)] flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {name[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold text-[#0d1f3c] truncate">
                      Welcome, {name.split(" ")[0]}! 👋
                    </div>
                    <div className="text-[11px] text-[#888] font-['Inter',sans-serif] truncate">
                      {email}
                    </div>
                  </div>
                </div>
              )}

              {/* api error */}
              {errors.api && (
                <div className="flex items-start gap-2 bg-[#fff0f0] border-[1.5px] border-[#ffd4d4] rounded-[10px] px-3.5 py-2.5 text-xs text-[#e24b4a] font-['Inter',sans-serif] mb-3.5">
                  <AlertCircle
                    size={14}
                    strokeWidth={2.25}
                    className="shrink-0 mt-0.5"
                  />
                  <span>{errors.api}</span>
                </div>
              )}

              {/* row: class + board */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mb-3">
                <div>
                  <label className={labelCls}>Class *</label>
                  <div className="relative">
                    <select
                      value={form.class}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, class: e.target.value }))
                      }
                      className={`${fieldCls} pr-8 cursor-pointer`}>
                      <option value="">Select Class</option>
                      <option value="8">Class 8</option>
                      <option value="9">Class 9</option>
                      <option value="10">Class 10</option>
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#185FA5] pointer-events-none"
                    />
                  </div>
                  {errors.class && <p className={errorCls}>{errors.class}</p>}
                </div>

                <div>
                  <label className={labelCls}>School Board *</label>
                  <div className="relative">
                    <select
                      value={form.board}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, board: e.target.value }))
                      }
                      className={`${fieldCls} pr-8 cursor-pointer`}>
                      <option value="">Select Board</option>
                      <option value="CBSE">CBSE</option>
                      <option value="ICSE">ICSE</option>
                      <option value="State Board">State Board</option>
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#185FA5] pointer-events-none"
                    />
                  </div>
                  {errors.board && <p className={errorCls}>{errors.board}</p>}
                </div>
              </div>

              {/* parent phone */}
              <div className="mb-3">
                <label className={labelCls}>Parent's Phone *</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={form.parentPhone}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, parentPhone: e.target.value }))
                  }
                  className={fieldCls}
                />
                {errors.parentPhone && (
                  <p className={errorCls}>{errors.parentPhone}</p>
                )}
              </div>

              {/* submit */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="group relative w-full h-[46px] rounded-xl text-sm font-semibold text-white cursor-pointer overflow-hidden mt-1.5 bg-[linear-gradient(135deg,#1D9E75_0%,#185FA5_100%)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(24,95,165,0.3)] active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-y-0 disabled:hover:shadow-none">
                {!loading && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute top-0 -left-full w-[60%] h-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] transition-[left] duration-500 group-hover:left-[150%]"
                  />
                )}
                <span className="relative">
                  {loading ? "Saving..." : "Save & Start My Test →"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
