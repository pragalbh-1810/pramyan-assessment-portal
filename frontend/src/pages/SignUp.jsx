import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Zap,
  Layers,
  Target,
  Bell,
  Eye,
  EyeOff,
  ChevronDown,
} from "lucide-react";
import logo from "../assets/logo.jpeg";
import { setToken, setRole } from "../utils/auth";
import { apiUrl } from "../utils/api";

// Keyframes that aren't in Tailwind by default — kept tiny and scoped.
const keyframes = `
  @keyframes signup-fade-up {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes signup-fade-left {
    from { opacity: 0; transform: translateX(-16px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes signup-float {
    0%, 100% { transform: translateY(0); }
    50%      { transform: translateY(-8px); }
  }
  @keyframes signup-orbit-1 {
    from { transform: rotate(0deg) translateX(100px) rotate(0deg); }
    to   { transform: rotate(360deg) translateX(100px) rotate(-360deg); }
  }
  @keyframes signup-orbit-2 {
    from { transform: rotate(180deg) translateX(75px) rotate(-180deg); }
    to   { transform: rotate(540deg) translateX(75px) rotate(-540deg); }
  }
  .anim-fade-up   { animation: signup-fade-up 0.6s ease both; }
  .anim-fade-left { animation: signup-fade-left 0.8s ease both; }
  .anim-float     { animation: signup-float 4s ease-in-out infinite; }
  .anim-orbit-1   { animation: signup-orbit-1 9s linear infinite; }
  .anim-orbit-2   { animation: signup-orbit-2 6s linear infinite; }
  .anim-d-300     { animation-delay: 0.3s; }
  .anim-d-500     { animation-delay: 0.5s; }
  .anim-d-700     { animation-delay: 0.7s; }
`;

const FEATURES = [
  { Icon: Zap, text: "Instant diagnostic reports" },
  { Icon: Layers, text: "Chapter-wise SWOT analysis" },
  { Icon: Target, text: "Personalised 4-week study plan" },
  { Icon: Bell, text: "Updates to parents" },
];

const AVATARS = [
  ["R", "#1D9E75"],
  ["A", "#3a7bd5"],
  ["K", "#0a5a45"],
  ["S", "#2563a8"],
];

// Shared input/select styling (factored out for cleanliness — applied via className)
const inputCls =
  "w-full h-[38px] border-[1.5px] border-[#e2edf8] rounded-[10px] px-3 text-[12.5px] " +
  "font-['Inter',sans-serif] text-[#1a1a1a] bg-[#f8fbff] outline-none transition-all " +
  "appearance-none text-left placeholder:text-[#b8cce0] placeholder:text-xs " +
  "hover:border-[#a8c4e8] focus:border-[#185FA5] focus:bg-white focus:ring-[3px] focus:ring-[#185FA5]/10";

const labelCls =
  "block text-[10px] font-bold text-[#185FA5] mb-1 tracking-wider uppercase px-0.5 text-left";

const errorCls = "text-[#e24b4a] text-[10.5px] font-['Inter',sans-serif] mt-1";

export default function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    parentPhone: "",
    class: "",
    board: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    if (!form.password || form.password.length < 8)
      newErrors.password = "Min. 8 characters";
    if (!form.parentPhone.trim()) newErrors.parentPhone = "Phone is required";
    if (!form.class) newErrors.class = "Select a class";
    if (!form.board) newErrors.board = "Select a board";
    return newErrors;
  };

  const handleSubmit = async () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(apiUrl("signup.php"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          class: form.class,
          board: form.board,
          parent_phone: form.parentPhone,
        }),
      });
      const result = await response.json();

      if (result.success) {
        setToken(result.token);
        setRole(result.user.role);
        const classToTestId = { 8: 3, 9: 2, 10: 1 };
        const testId = classToTestId[String(form.class)] || 1;
        navigate(`/instructions/${testId}`);
      } else {
        setErrors({ api: result.message });
      }
    } catch {
      setErrors({ api: "Server error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{keyframes}</style>

      {/* Outer wrapper — natural scroll on mobile, centered on desktop */}
      <div className="min-h-screen w-full bg-[#EEF4FF] font-['Sora',sans-serif] flex items-start md:items-center justify-center p-3 md:p-6">
        <div className="anim-fade-up flex flex-col md:flex-row w-full max-w-[980px] md:min-h-[600px] rounded-2xl md:rounded-[28px] overflow-hidden shadow-[0_20px_60px_rgba(74,144,217,0.15),0_4px_16px_rgba(0,0,0,0.06)] bg-white">
          {/* LEFT PANEL — gradient brand side */}
          <div className="relative w-full md:w-2/5 bg-[linear-gradient(145deg,#1D9E75_0%,#185FA5_100%)] flex flex-col items-center justify-center px-6 py-8 md:px-8 md:py-10 overflow-hidden">
            {/* decorative blobs */}
            <div
              className="absolute -top-16 -right-16 w-[200px] h-[200px] rounded-full bg-white/10"
              aria-hidden
            />
            <div
              className="absolute -bottom-10 -left-10 w-[160px] h-[160px] rounded-full bg-white/[0.06]"
              aria-hidden
            />
            <div
              className="absolute top-[40%] -left-5 w-[100px] h-[100px] rounded-full bg-white/[0.05]"
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
                  className="block w-full max-w-[180px] h-auto"
                />
              </div>
            </div>

            {/* welcome text */}
            <div className="anim-fade-left anim-d-300 relative z-10 text-center mb-5">
              <h2 className="text-white text-[17px] font-semibold leading-relaxed mb-1.5">
                Your success starts right here
              </h2>
              <p className="text-white/70 text-xs font-['Inter',sans-serif]">
                India's smartest student assessment platform
              </p>
            </div>

            {/* feature pills — desktop only (kept hidden on mobile to match original) */}
            <div className="anim-fade-left anim-d-500 relative z-10 hidden md:flex flex-col gap-2 w-full mb-5">
              {FEATURES.map(({ Icon, text }, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white/[0.12] border border-white/[0.18] text-white text-xs font-['Inter',sans-serif] transition hover:bg-white/20 hover:translate-x-1">
                  <span className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    <Icon
                      className="w-3.5 h-3.5 text-white"
                      strokeWidth={2.25}
                    />
                  </span>
                  {text}
                </div>
              ))}
            </div>

            {/* student avatar tag — desktop only */}
            <div className="anim-fade-left anim-d-700 relative z-10 hidden md:flex items-center gap-2.5 bg-white/10 border border-white/15 rounded-full pr-3.5 pl-2 py-1.5">
              <div className="flex">
                {AVATARS.map(([letter, color], i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full border-2 border-white/30 flex items-center justify-center text-[8px] font-bold text-white -ml-1.5 first:ml-0"
                    style={{ background: color }}>
                    {letter}
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-white/85 font-['Inter',sans-serif]">
                students joined
              </p>
            </div>
          </div>

          {/* RIGHT PANEL — form */}
          <div className="relative flex-1 bg-white flex items-center justify-center px-6 py-8 md:px-12 md:py-10 overflow-hidden">
            {/* decorative bg circles — desktop only */}
            <div
              className="hidden md:block absolute -top-16 -right-16 w-[220px] h-[220px] rounded-full bg-[#EEF4FF]/60 pointer-events-none"
              aria-hidden
            />
            <div
              className="hidden md:block absolute -bottom-10 -left-10 w-[160px] h-[160px] rounded-full bg-[#E1F5EE]/50 pointer-events-none"
              aria-hidden
            />

            <div className="anim-fade-up relative z-10 w-full max-w-[370px]">
              {/* top bar — left-aligned & stacked on mobile, side-by-side on desktop */}
              <div className="flex flex-col items-start gap-2.5 md:flex-row md:items-center md:justify-around md:gap-3 mb-5">
                {/* step pills */}
                <div
                  className="flex gap-[5px] items-center"
                  aria-label="Sign-up step 2 of 3">
                  <div className="h-1 w-7 rounded-[2px] bg-[#1D9E75]" />
                  <div className="h-1 w-9 rounded-[2px] bg-[#185FA5]" />
                  <div className="h-1 w-[18px] rounded-[2px] bg-[#dde8f8]" />
                </div>
                <div className="text-[11.5px] text-[#888] font-['Inter',sans-serif]">
                  Already have an account?{" "}
                  <a
                    href="/"
                    className="text-[#185FA5] font-medium hover:underline">
                    Sign In
                  </a>
                </div>
              </div>

              {/* title — also left-aligned (was implicitly so, making it explicit) */}
              <div className="mb-4 text-left">
                <h2 className="text-[22px] font-bold text-[#0d1f3c] mb-1">
                  Create Account
                </h2>
                <p className="text-xs text-[#999] font-['Inter',sans-serif]">
                  Join Pramyan — Unlock your true potential
                </p>
              </div>

              {/* google button */}
              <button
                type="button"
                onClick={() => {
                  const frontendOrigin = encodeURIComponent(
                    window.location.origin,
                  );
                  window.location.href = apiUrl(
                    `google-auth.php?frontend_origin=${frontendOrigin}`,
                  );
                }}
                className="w-full h-[42px] bg-[#f8fbff] border-[1.5px] border-[#d4e4f7] rounded-xl text-[13px] font-medium text-[#1a1a1a] cursor-pointer flex items-center justify-center gap-2 mb-3.5 transition-all hover:border-[#185FA5] hover:bg-white hover:shadow-[0_4px_16px_rgba(24,95,165,0.1)] hover:-translate-y-0.5">
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>

              {/* divider */}
              <div className="flex items-center gap-2.5 mb-3.5">
                <span className="flex-1 h-px bg-[#f0f4fb]" />
                <span className="text-[11px] text-[#bbb] font-['Inter',sans-serif] whitespace-nowrap">
                  or sign up with email
                </span>
                <span className="flex-1 h-px bg-[#f0f4fb]" />
              </div>

              {/* api error */}
              {errors.api && <p className={`${errorCls} mb-2`}>{errors.api}</p>}

              {/* row 1: name + email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mb-2.5">
                <div>
                  <label className={labelCls}>Full Name</label>
                  <input
                    name="name"
                    type="text"
                    placeholder="Name"
                    value={form.name}
                    onChange={handleChange}
                    className={inputCls}
                  />
                  {errors.name && <p className={errorCls}>{errors.name}</p>}
                </div>
                <div>
                  <label className={labelCls}>Email Address</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="you@email.com"
                    value={form.email}
                    onChange={handleChange}
                    className={inputCls}
                  />
                  {errors.email && <p className={errorCls}>{errors.email}</p>}
                </div>
              </div>

              {/* row 2: password (with toggle) + parent phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mb-2.5">
                <div>
                  <label className={labelCls}>Password</label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 8 characters"
                      value={form.password}
                      onChange={handleChange}
                      className={`${inputCls} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#a8c4e8] hover:text-[#185FA5] transition-colors p-1 rounded">
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className={errorCls}>{errors.password}</p>
                  )}
                </div>
                <div>
                  <label className={labelCls}>Parent's Phone</label>
                  <input
                    name="parentPhone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={form.parentPhone}
                    onChange={handleChange}
                    className={inputCls}
                  />
                  {errors.parentPhone && (
                    <p className={errorCls}>{errors.parentPhone}</p>
                  )}
                </div>
              </div>

              {/* row 3: class + board */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mb-3">
                <div>
                  <label className={labelCls}>Class</label>
                  <div className="relative">
                    <select
                      name="class"
                      value={form.class}
                      onChange={handleChange}
                      className={`${inputCls} pr-7 cursor-pointer`}>
                      <option value="">Select Class</option>
                      {[8, 9, 10].map((c) => (
                        <option key={c} value={c}>
                          Class {c}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#185FA5] pointer-events-none"
                    />
                  </div>
                  {errors.class && <p className={errorCls}>{errors.class}</p>}
                </div>
                <div>
                  <label className={labelCls}>School Board</label>
                  <div className="relative">
                    <select
                      name="board"
                      value={form.board}
                      onChange={handleChange}
                      className={`${inputCls} pr-7 cursor-pointer`}>
                      <option value="">Select Board</option>
                      <option value="CBSE">CBSE</option>
                      <option value="ICSE">ICSE</option>
                      <option value="State Board">State Board</option>
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#185FA5] pointer-events-none"
                    />
                  </div>
                  {errors.board && <p className={errorCls}>{errors.board}</p>}
                </div>
              </div>

              {/* submit */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="group relative w-full h-[44px] rounded-xl text-[13.5px] font-semibold text-white cursor-pointer overflow-hidden bg-[linear-gradient(135deg,#1D9E75_0%,#185FA5_100%)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(24,95,165,0.3)] active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-y-0 disabled:hover:shadow-none">
                {!loading && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute top-0 -left-full w-[60%] h-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] transition-[left] duration-500 group-hover:left-[150%]"
                  />
                )}
                <span className="relative">
                  {loading ? "Creating Account..." : "Create My Account →"}
                </span>
              </button>

              {/* terms — left-aligned on mobile, centered on desktop */}
              <p className="text-left md:text-center text-[10px] text-[#bbb] mt-2.5 leading-[1.7] font-['Inter',sans-serif]">
                By signing up you agree to our{" "}
                <a href="#" className="text-[#185FA5] hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-[#185FA5] hover:underline">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
