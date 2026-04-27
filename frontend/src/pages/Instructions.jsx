import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  FileText,
  Clock,
  HelpCircle,
  GraduationCap,
  ClipboardList,
} from "lucide-react";
import logo from "../assets/logo.jpeg";
import { getToken, setToken } from "../utils/auth";
import { apiUrl } from "../utils/api";

// Keyframes that aren't in Tailwind by default — kept tiny and scoped.
const keyframes = `
  @keyframes instr-fade-up {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes instr-fade-left {
    from { opacity: 0; transform: translateX(-16px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes instr-float {
    0%, 100% { transform: translateY(0); }
    50%      { transform: translateY(-8px); }
  }
  @keyframes instr-orbit-1 {
    from { transform: rotate(0deg) translateX(100px) rotate(0deg); }
    to   { transform: rotate(360deg) translateX(100px) rotate(-360deg); }
  }
  @keyframes instr-orbit-2 {
    from { transform: rotate(180deg) translateX(75px) rotate(-180deg); }
    to   { transform: rotate(540deg) translateX(75px) rotate(-540deg); }
  }
  .anim-fade-up   { animation: instr-fade-up 0.6s ease both; }
  .anim-fade-left { animation: instr-fade-left 0.8s ease both; }
  .anim-float     { animation: instr-float 4s ease-in-out infinite; }
  .anim-orbit-1   { animation: instr-orbit-1 9s linear infinite; }
  .anim-orbit-2   { animation: instr-orbit-2 6s linear infinite; }
  .anim-d-300     { animation-delay: 0.3s; }
  .anim-d-500     { animation-delay: 0.5s; }
`;

const RULES = [
  {
    text: (
      <>
        <strong className="text-[#0d1f3c] font-semibold">Do not refresh</strong>{" "}
        the page. Your progress will be lost.
      </>
    ),
  },
  {
    text: (
      <>
        <strong className="text-[#0d1f3c] font-semibold">
          Do not switch tabs
        </strong>{" "}
        or open other windows.
      </>
    ),
  },
  {
    text: (
      <>
        The test has a{" "}
        <strong className="text-[#0d1f3c] font-semibold">time limit</strong>. It
        will auto-submit when time runs out.
      </>
    ),
  },
  {
    text: (
      <>
        Each question has{" "}
        <strong className="text-[#0d1f3c] font-semibold">4 options</strong>.
        Select only one answer.
      </>
    ),
  },
  {
    text: (
      <>
        You can{" "}
        <strong className="text-[#0d1f3c] font-semibold">
          navigate between questions
        </strong>{" "}
        using the question palette.
      </>
    ),
  },
  {
    text: (
      <>
        Once you click{" "}
        <strong className="text-[#0d1f3c] font-semibold">Submit Test</strong>,
        you cannot go back.
      </>
    ),
  },
];

export default function Instructions() {
  const navigate = useNavigate();
  const { testId } = useParams();
  const [searchParams] = useSearchParams();
  const tokenUrl = searchParams.get("token");

  const [checked, setChecked] = useState(false);
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. If returning from Google Auth, save the token to LocalStorage
    if (tokenUrl) setToken(tokenUrl);

    // 2. Get active token (just-saved or existing session)
    const activeToken = tokenUrl || getToken();

    if (!activeToken) {
      navigate("/");
      return;
    }

    fetchTestDetails(activeToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testId, tokenUrl]);

  const fetchTestDetails = async (token) => {
    try {
      const res = await fetch(
        apiUrl(`get-test-details.php?test_id=${testId}`),
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      if (data.success) {
        setTest(data.test);
      } else {
        fallbackTest(token);
      }
    } catch {
      fallbackTest(token);
    } finally {
      setLoading(false);
    }
  };

  const fallbackTest = (token) => {
    let userClass = null;
    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      userClass = decoded.class || null;
    } catch {
      // ignore decode errors
    }

    const classTestMap = {
      8: {
        name: "Class 8 Foundation Check",
        duration_mins: 45,
        total_questions: 32,
      },
      9: {
        name: "Class 9 Mid-Term Readiness Test",
        duration_mins: 60,
        total_questions: 32,
      },
      10: {
        name: "Class 10 Diagnostic Assessment",
        duration_mins: 90,
        total_questions: 32,
      },
    };

    const testInfo = classTestMap[Number(userClass)] || {
      name: "Pramyan Diagnostic Assessment",
      duration_mins: 60,
      total_questions: 32,
    };

    setTest({ ...testInfo, class: userClass });
  };

  const handleStartTest = () => {
    if (checked) navigate(`/test/${testId}`);
  };

  return (
    <>
      <style>{keyframes}</style>

      {/* Outer wrapper — natural scroll on mobile, centered on desktop */}
      <div className="min-h-screen w-full bg-[#EEF4FF] font-['Sora',sans-serif] flex items-start md:items-center justify-center p-3 md:p-5">
        <div className="anim-fade-up flex flex-col md:flex-row w-full max-w-[980px] rounded-2xl md:rounded-[28px] overflow-hidden shadow-[0_20px_60px_rgba(74,144,217,0.15),0_4px_16px_rgba(0,0,0,0.06)] bg-white">
          {/* LEFT PANEL — gradient brand side */}
          <div className="relative w-full md:w-[38%] md:shrink-0 bg-[linear-gradient(145deg,#1D9E75_0%,#185FA5_100%)] flex flex-col items-start justify-center px-6 py-7 md:px-7 md:py-8 overflow-hidden">
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
            <div className="anim-float relative z-10 w-full mb-4">
              <div className="bg-white rounded-2xl px-4 py-2.5 shadow-[0_8px_30px_rgba(0,0,0,0.15)] flex items-center justify-center">
                <img
                  src={logo}
                  alt="Pramyan Logo"
                  className="block w-full max-w-[160px] h-auto"
                />
              </div>
            </div>

            {/* welcome text — left-aligned (matches original) */}
            <div className="anim-fade-left anim-d-300 relative z-10 text-left w-full mb-4">
              <h2 className="text-white text-base font-semibold leading-relaxed mb-1 pl-1">
                You're almost ready! Read carefully.
              </h2>
              <p className="text-white/70 text-[11px] font-['Inter',sans-serif] pl-1">
                Please go through all instructions before starting
              </p>
            </div>

            {/* test info boxes */}
            {!loading && test && (
              <div className="anim-fade-left anim-d-500 relative z-10 flex flex-col gap-1.5 w-full">
                <InfoBox Icon={FileText} label="Test Name" value={test.name} />
                <InfoBox
                  Icon={Clock}
                  label="Duration"
                  value={`${test.duration_mins ?? 45} minutes`}
                />
                <InfoBox
                  Icon={HelpCircle}
                  label="Total Questions"
                  value={`${test.total_questions ?? 32} Questions`}
                />
                <InfoBox
                  Icon={GraduationCap}
                  label="Class"
                  value={test.class ? `Class ${test.class}` : "—"}
                />
              </div>
            )}
          </div>

          {/* RIGHT PANEL — instructions + checkbox + start */}
          <div className="relative flex-1 bg-white flex items-center justify-center px-6 py-7 md:px-10 md:py-7 overflow-hidden">
            {/* decorative bg circles — desktop only */}
            <div
              className="hidden md:block absolute -top-16 -right-16 w-[220px] h-[220px] rounded-full bg-[#EEF4FF]/60 pointer-events-none"
              aria-hidden
            />
            <div
              className="hidden md:block absolute -bottom-10 -left-10 w-[160px] h-[160px] rounded-full bg-[#E1F5EE]/50 pointer-events-none"
              aria-hidden
            />

            <div className="anim-fade-up relative z-10 w-full max-w-[420px]">
              {/* title */}
              <div className="mb-3">
                <h2 className="text-xl font-bold text-[#0d1f3c] mb-0.5">
                  Instructions
                </h2>
                <p className="text-[11px] text-[#999] font-['Inter',sans-serif]">
                  Read all rules carefully before you begin
                </p>
              </div>

              {/* rules header */}
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#185FA5] uppercase tracking-wider mb-2">
                <ClipboardList size={12} strokeWidth={2.5} />
                <span>General Rules</span>
              </div>

              {/* rules list */}
              <div className="flex flex-col gap-1.5 mb-3">
                {RULES.map((rule, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-[10px] bg-[#f8fbff] border-[1.5px] border-[#e2edf8] transition-all hover:border-[#185FA5] hover:bg-[#EEF4FF]">
                    <div className="w-[18px] h-[18px] rounded-[5px] bg-[linear-gradient(135deg,#1D9E75,#185FA5)] text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </div>
                    <div className="text-[11.5px] text-[#444] font-['Inter',sans-serif] leading-snug">
                      {rule.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* agreement checkbox */}
              <label className="flex items-center gap-2.5 px-3 py-2.5 bg-[#f0f9f5] border-[1.5px] border-[#b8e8d4] rounded-[11px] mb-2.5 cursor-pointer transition-all hover:border-[#1D9E75] hover:bg-[#e6f7f1]">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => setChecked(e.target.checked)}
                  className="w-[15px] h-[15px] cursor-pointer shrink-0 accent-[#1D9E75]"
                />
                <span className="text-[11.5px] text-[#1D9E75] font-medium font-['Inter',sans-serif]">
                  I have read and understood all the instructions above
                </span>
              </label>

              {/* start button */}
              <button
                type="button"
                onClick={handleStartTest}
                disabled={!checked}
                className="group relative w-full h-[44px] rounded-xl text-[13.5px] font-semibold text-white cursor-pointer overflow-hidden bg-[linear-gradient(135deg,#1D9E75_0%,#185FA5_100%)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(24,95,165,0.3)] active:translate-y-0 disabled:bg-[#d0dff0] disabled:bg-none disabled:text-[#aab8cc] disabled:cursor-not-allowed disabled:translate-y-0 disabled:hover:shadow-none">
                {checked && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute top-0 -left-full w-[60%] h-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] transition-[left] duration-500 group-hover:left-[150%]"
                  />
                )}
                <span className="relative">
                  {checked ? "Start Test →" : "Please read instructions first"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* Sub-component: a single info box on the left panel */
function InfoBox({ Icon, label, value }) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2 rounded-[11px] bg-white/[0.12] border border-white/[0.18] font-['Inter',sans-serif]">
      <span className="w-[30px] h-[30px] rounded-[7px] bg-white/[0.82] flex items-center justify-center shrink-0">
        <Icon size={16} className="text-[#185FA5]" strokeWidth={2.25} />
      </span>
      <div className="flex flex-col items-start min-w-0">
        <span className="text-[9px] text-white/60 uppercase tracking-wide mb-px">
          {label}
        </span>
        <span className="text-xs font-semibold text-white truncate max-w-full">
          {value}
        </span>
      </div>
    </div>
  );
}
