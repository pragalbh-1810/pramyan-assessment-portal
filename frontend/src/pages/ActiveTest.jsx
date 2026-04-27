import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  User,
  Clock,
  ClipboardList,
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  X,
  Upload,
  Loader2,
  Grid3x3,
} from "lucide-react";
import { getToken } from "../utils/auth";
import { apiUrl, API_BASE } from "../utils/api";
import { setupTabSwitchMonitor } from "../utils/tabSwitchMonitor";
import { useAutoSubmit } from "../utils/autoSubmit";
import { uploadWorkingSheet } from "../utils/fileUpload";

// Keyframes that aren't in Tailwind by default
const keyframes = `
  @keyframes test-fade-in {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes test-timer-warn {
    0%, 100% { background: rgba(226,75,74,0.18); }
    50%      { background: rgba(226,75,74,0.32); }
  }
  @keyframes test-spin {
    to { transform: rotate(360deg); }
  }
  .anim-fade-in   { animation: test-fade-in 0.4s ease both; }
  .anim-timer-warn { animation: test-timer-warn 1s ease infinite; }
  .anim-spin       { animation: test-spin 1s linear infinite; }
`;

const TOTAL_TIME = 45 * 60; // 45 minutes

function decodeToken(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

// Helper function to separate "Q21 (a):" from the actual text
const parseQuestionData = (text) => {
  if (!text) return { label: null, body: "" };
  const match = text.match(/^Q(\d+(?:\s*\([a-zA-Z]\))?)\s*:\s*([\s\S]*)/i);
  if (match) {
    return { label: match[1].replace(/\s+/g, ""), body: match[2] };
  }
  return { label: null, body: text };
};

export default function ActiveTest() {
  const navigate = useNavigate();
  const { testId } = useParams();

  const [questions, setQuestions] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [showModal, setShowModal] = useState(false);
  const [studentName, setStudentName] = useState("Student");
  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showPaletteSheet, setShowPaletteSheet] = useState(false); // mobile palette sheet

  const [saveIndicator, setSaveIndicator] = useState({
    show: false,
    text: "",
    type: "",
  });
  const answersRef = useRef({});

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const [showWarningModal, setShowWarningModal] = useState(false);
  const warningsRef = useRef(0);
  const MAX_WARNINGS = 4;

  const timerRef = useRef(null);

  const { handleAutoSubmit, submitTest } = useAutoSubmit({
    testId,
    answersRef,
    submitted,
    setSubmitted,
    setSaveIndicator,
    timerRef,
  });

  useEffect(() => {
    const token = getToken();
    if (token) {
      const decoded = decodeToken(token);
      if (decoded?.name) setStudentName(decoded.name.split(" ")[0]);
    }
  }, []);

  useEffect(() => {
    const token = getToken() || "test";
    fetchQuestions(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testId]);

  const fetchQuestions = async (token) => {
    setIsLoading(true);
    setLoadError("");
    try {
      const res = await fetch(
        apiUrl(`get-questions.php?test_id=${testId}`),
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const result = await res.json().catch(() => null);

      if (res.status === 401) {
        setLoadError("Session expired. Please sign in again.");
        setTimeout(() => navigate("/"), 800);
        return;
      }

      if (!result) {
        setLoadError("Could not load test data. Please refresh and try again.");
        return;
      }

      if (result.success && result.questions?.length > 0) {
        setQuestions(result.questions);
        setTotalQuestions(result.total_questions);
      } else {
        setLoadError(result.message || "No questions found for this test.");
      }
    } catch (err) {
      console.error(err);
      setLoadError("Network error while loading test. Check server and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return setupTabSwitchMonitor({
      isSubmitted: () => submitted,
      maxWarnings: MAX_WARNINGS,
      onWarning: (warningCount) => {
        warningsRef.current = warningCount;
        setShowWarningModal(true);
      },
      onMaxViolations: () => {
        warningsRef.current = MAX_WARNINGS;
        alert(
          "You switched tabs/windows multiple times. Your test is now automatically submitted.",
        );
        handleAutoSubmit();
      },
    });
  }, [submitted, handleAutoSubmit]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [handleAutoSubmit]);

  // Lock body scroll while palette sheet open on mobile
  useEffect(() => {
    if (showPaletteSheet) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showPaletteSheet]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const isWarning = timeLeft <= 5 * 60;

  const currentQuestion = questions[currentIndex];

  // Group sub-parts (e.g. Q21(a), Q21(b)) under their main question for accurate "answered" count
  const mainQuestionGroups = {};
  questions.forEach((q) => {
    const match = q.q_text.match(/^Q(\d+)/i);
    const mainNum = match ? match[1] : q.id;
    if (!mainQuestionGroups[mainNum]) {
      mainQuestionGroups[mainNum] = [];
    }
    mainQuestionGroups[mainNum].push(q.id);
  });

  let answeredMainCount = 0;
  Object.values(mainQuestionGroups).forEach((partIds) => {
    if (partIds.every((id) => answers[id])) answeredMainCount++;
  });

  const unansweredMainCount = totalQuestions - answeredMainCount;
  const parsedCurrentQ = parseQuestionData(currentQuestion?.q_text);
  const displayLabel = parsedCurrentQ.label || currentIndex + 1;
  const displayBody = parsedCurrentQ.body || "Loading question...";

  const handleOptionSelect = (option) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: option }));
  };

  const handleClearAnswer = () => {
    setAnswers((prev) => {
      const updated = { ...prev };
      delete updated[currentQuestion.id];
      return updated;
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const currentTestId = testId;

    setUploading(true);
    setSaveIndicator({
      show: true,
      text: "Uploading sheet...",
      type: "saving",
    });

    const result = await uploadWorkingSheet(file, currentTestId);

    if (result.success) {
      setSelectedFile(file.name);
      setSaveIndicator({
        show: true,
        text: "Sheet Uploaded!",
        type: "success",
      });
    } else {
      setSaveIndicator({ show: true, text: "Upload Failed", type: "warn" });
    }
    setUploading(false);
    setTimeout(() => setSaveIndicator({ show: false }), 3000);
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EEF4FF] font-['Sora',sans-serif]">
        <div className="flex items-center gap-3 text-[#185FA5]">
          <Loader2 size={20} className="anim-spin" />
          <span className="text-sm font-medium">Loading test…</span>
        </div>
      </div>
    );

  if (loadError)
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#d14343" }}>
        <div style={{ marginBottom: "12px", fontWeight: 600 }}>{loadError}</div>
        <button
          onClick={() => {
            const token = getToken() || "test";
            fetchQuestions(token);
          }}
          style={{
            border: "none",
            borderRadius: "8px",
            padding: "10px 16px",
            background: "#185FA5",
            color: "white",
            cursor: "pointer",
          }}>
          Retry
        </button>
      </div>
    );

  return (
    <>
      <style>{keyframes}</style>

      <div className="min-h-screen md:h-screen bg-[#EEF4FF] font-['Sora',sans-serif] flex flex-col md:overflow-hidden">
        {/* ── TOP BAR ── */}
        {/* Mobile: compact single row sticky top. Desktop: original fuller bar. */}
        <div className="sticky top-0 md:static z-40 md:m-3 md:rounded-[15px] bg-[linear-gradient(145deg,#1D9E75_0%,#185FA5_100%)] shadow-[0_4px_16px_rgba(24,95,165,0.2)] flex-shrink-0">
          {/* Mobile topbar */}
          <div className="md:hidden flex items-center justify-between gap-2 px-3 h-12">
            <div className="min-w-0 flex-1">
              <div className="text-[12px] font-bold text-white truncate leading-tight">
                Pramyan Assessment
              </div>
              <div className="text-[10px] text-white/75 font-['Inter',sans-serif] flex items-center gap-1 truncate">
                <User size={9} strokeWidth={2.5} />
                <span className="truncate">{studentName}</span>
              </div>
            </div>
            <div
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border-[1.5px] text-white font-bold tracking-wider font-['Inter',sans-serif] text-[13px] ${
                isWarning
                  ? "border-[#ff9b9b] anim-timer-warn"
                  : "bg-white/15 border-white/30"
              }`}
              aria-label="time remaining">
              <Clock size={12} strokeWidth={2.5} />
              {formatTime(timeLeft)}
            </div>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="bg-white text-[#185FA5] rounded-lg px-3 h-8 text-xs font-bold cursor-pointer shadow-[0_2px_10px_rgba(0,0,0,0.1)] active:scale-95 transition">
              Submit
            </button>
          </div>

          {/* Desktop topbar */}
          <div className="hidden md:flex items-center justify-between gap-3 h-16 px-7">
            <div className="flex flex-col items-start text-left">
              <span className="text-sm font-bold text-white leading-tight">
                Pramyan Diagnostic Assessment
              </span>
              <span className="text-[11px] text-white/75 font-['Inter',sans-serif] flex items-center gap-1.5 mt-0.5">
                <User size={11} strokeWidth={2.5} />
                {studentName}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {saveIndicator.show && (
                <div
                  className={`anim-fade-in text-[11px] font-semibold font-['Inter',sans-serif] px-3 py-1.5 rounded-full flex items-center gap-1.5 ${
                    saveIndicator.type === "success"
                      ? "text-[#1D9E75] bg-[#E1F5EE]"
                      : saveIndicator.type === "warn"
                        ? "text-[#a32d2d] bg-[#fcebeb]"
                        : "text-[#185FA5] bg-white/90"
                  }`}>
                  {saveIndicator.type === "saving" && (
                    <Loader2
                      size={11}
                      className="anim-spin"
                      strokeWidth={2.5}
                    />
                  )}
                  {saveIndicator.type === "success" && (
                    <Check size={11} strokeWidth={3} />
                  )}
                  {saveIndicator.text}
                </div>
              )}
              <div
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border-[1.5px] text-white font-bold tracking-[2px] font-['Inter',sans-serif] text-xl min-w-[120px] justify-center ${
                  isWarning
                    ? "border-[#ff9b9b] anim-timer-warn"
                    : "bg-white/15 border-white/30"
                }`}>
                <Clock size={16} strokeWidth={2.5} />
                {formatTime(timeLeft)}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="bg-white text-[#185FA5] rounded-[10px] px-5 py-2 text-[13px] font-bold cursor-pointer shadow-[0_2px_10px_rgba(0,0,0,0.1)] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(0,0,0,0.15)]">
              Submit Test
            </button>
          </div>

          {/* Mobile save indicator (separate row, only when shown) */}
          {saveIndicator.show && (
            <div className="md:hidden px-3 pb-2 -mt-1">
              <div
                className={`anim-fade-in text-[10px] font-semibold font-['Inter',sans-serif] px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 ${
                  saveIndicator.type === "success"
                    ? "text-[#1D9E75] bg-[#E1F5EE]"
                    : saveIndicator.type === "warn"
                      ? "text-[#a32d2d] bg-[#fcebeb]"
                      : "text-[#185FA5] bg-white/95"
                }`}>
                {saveIndicator.type === "saving" && (
                  <Loader2 size={10} className="anim-spin" strokeWidth={2.5} />
                )}
                {saveIndicator.type === "success" && (
                  <Check size={10} strokeWidth={3} />
                )}
                {saveIndicator.text}
              </div>
            </div>
          )}
        </div>

        {/* ── MAIN BODY ── */}
        <div className="flex-1 flex flex-col md:flex-row md:overflow-hidden p-3 md:p-3.5 gap-3 md:min-h-0 pb-[88px] md:pb-3.5">
          {/* QUESTION PANEL */}
          <div className="anim-fade-in flex-1 bg-white rounded-2xl md:rounded-[20px] p-4 md:p-7 shadow-[0_2px_16px_rgba(24,95,165,0.07)] flex flex-col md:overflow-y-auto">
            {/* Header: counter + section tag */}
            <div className="flex items-center justify-between mb-4 md:mb-5 flex-shrink-0 gap-2">
              <div className="text-xs text-[#888] font-['Inter',sans-serif]">
                Question{" "}
                <strong className="text-[#185FA5] text-sm font-bold">
                  {displayLabel}
                </strong>{" "}
                of {totalQuestions}
              </div>
              {currentQuestion?.section && (
                <div className="text-[11px] font-semibold px-3 py-1 rounded-full bg-[#EEF4FF] text-[#185FA5] font-['Inter',sans-serif] truncate max-w-[60%]">
                  {currentQuestion.section}
                </div>
              )}
            </div>

            {/* Question text */}
            <div className="text-[15px] font-semibold text-[#0d1f3c] leading-[1.7] mb-4 flex-shrink-0">
              {displayBody}
            </div>

            {/* Optional question image */}
            {currentQuestion?.q_image && (
              <div className="mb-5 md:mb-6 text-left flex-shrink-0">
                <img
                  src={`${API_BASE.replace(/\/routes\/?$/, "/assets/images")}/${currentQuestion.q_image}`}
                  alt={`Figure for Question ${displayLabel}`}
                  className="max-w-full md:max-h-[280px] rounded-xl border-[1.5px] border-[#e2edf8] object-contain"
                />
              </div>
            )}

            {/* Options */}
            <div className="flex flex-col gap-2.5 flex-1">
              {["a", "b", "c", "d"].map((opt) => {
                const isSelected = answers[currentQuestion?.id] === opt;
                return (
                  <button
                    type="button"
                    key={opt}
                    onClick={() => handleOptionSelect(opt)}
                    className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl border-2 text-left text-[13.5px] font-['Inter',sans-serif] cursor-pointer transition-all ${
                      isSelected
                        ? "border-[#185FA5] bg-[#EEF4FF] text-[#0d1f3c] font-semibold"
                        : "border-[#e2edf8] bg-[#f8fbff] text-[#333] hover:border-[#185FA5] hover:bg-[#EEF4FF] hover:translate-x-[3px]"
                    }`}>
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition ${
                        isSelected
                          ? "bg-[#185FA5] text-white"
                          : "bg-[#e2edf8] text-[#185FA5]"
                      }`}>
                      {opt.toUpperCase()}
                    </span>
                    <span className="flex-1">
                      {currentQuestion?.[`opt_${opt}`]}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Working sheet upload (only on last question) */}
            {currentIndex === questions.length - 1 && (
              <div className="mt-5 p-4 border-2 border-dashed border-[#185FA5] rounded-xl bg-[linear-gradient(135deg,#f0f7ff,#eaf3ff)]">
                <label className="flex items-center gap-2 text-[13.5px] font-semibold text-[#0d1f3c] mb-2.5">
                  <Upload
                    size={14}
                    className="text-[#185FA5]"
                    strokeWidth={2.25}
                  />
                  Step 3: Upload your rough work / working sheet (Required)
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  disabled={uploading}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="block w-full px-2.5 py-2 border border-[#c7d8ee] rounded-lg bg-white text-[13px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {selectedFile && (
                  <p className="text-[11px] text-[#1D9E75] mt-1.5 font-medium font-['Inter',sans-serif] flex items-center gap-1">
                    <Check size={10} strokeWidth={3} />
                    {selectedFile} attached
                  </p>
                )}
              </div>
            )}

            {/* Desktop nav buttons (mobile uses sticky bottom nav) */}
            <div className="hidden md:flex justify-between items-center gap-3 mt-6 flex-shrink-0">
              <button
                type="button"
                onClick={() => setCurrentIndex((i) => i - 1)}
                disabled={currentIndex === 0}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-[10px] border-[1.5px] border-[#e2edf8] bg-[#f8fbff] text-[13px] font-semibold text-[#185FA5] cursor-pointer transition-all hover:border-[#185FA5] hover:bg-[#EEF4FF] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-[#e2edf8] disabled:hover:bg-[#f8fbff]">
                <ChevronLeft size={14} strokeWidth={2.5} />
                Previous
              </button>
              <button
                type="button"
                onClick={handleClearAnswer}
                className="text-xs text-[#e24b4a] bg-transparent border-[1.5px] border-[#ffd4d4] rounded-[10px] px-4 py-2 cursor-pointer font-['Inter',sans-serif] transition-colors hover:bg-[#fff0f0]">
                Clear Answer
              </button>
              <button
                type="button"
                onClick={() => setCurrentIndex((i) => i + 1)}
                disabled={currentIndex === questions.length - 1}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-[10px] border-[1.5px] border-[#e2edf8] bg-[#f8fbff] text-[13px] font-semibold text-[#185FA5] cursor-pointer transition-all hover:border-[#185FA5] hover:bg-[#EEF4FF] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-[#e2edf8] disabled:hover:bg-[#f8fbff]">
                Next
                <ChevronRight size={14} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* DESKTOP SIDEBAR */}
          <aside className="hidden md:flex w-[280px] flex-shrink-0 flex-col gap-3 overflow-y-auto">
            {/* Stats */}
            <div className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(24,95,165,0.06)] flex justify-around">
              <Stat num={totalQuestions} label="Total" tone="default" />
              <Stat num={answeredMainCount} label="Answered" tone="green" />
              <Stat num={unansweredMainCount} label="Left" tone="gray" />
            </div>

            {/* Legend */}
            <div className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(24,95,165,0.06)]">
              <div className="text-[10px] font-bold text-[#888] uppercase tracking-wider mb-2.5 font-['Inter',sans-serif]">
                Legend
              </div>
              <LegendRow color="#1D9E75" label="Current" />
              <LegendRow color="#185FA5" label="Answered" />
              <LegendRow color="#e2edf8" label="Not Answered" border />
            </div>

            {/* Palette */}
            <div className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(24,95,165,0.06)] flex-1 overflow-y-auto">
              <div className="text-[10px] font-bold text-[#888] uppercase tracking-wider mb-2.5 font-['Inter',sans-serif]">
                Question Palette
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {questions.map((q, i) => (
                  <PaletteButton
                    key={q.id}
                    q={q}
                    i={i}
                    currentIndex={currentIndex}
                    answers={answers}
                    onClick={() => setCurrentIndex(i)}
                  />
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* ── MOBILE STICKY BOTTOM NAV ── */}
        <div className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-[#e2edf8] shadow-[0_-4px_16px_rgba(24,95,165,0.08)] px-3 pt-2 pb-[max(8px,env(safe-area-inset-bottom))]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentIndex((i) => i - 1)}
              disabled={currentIndex === 0}
              aria-label="Previous question"
              className="flex items-center justify-center w-11 h-11 rounded-xl border-[1.5px] border-[#e2edf8] bg-[#f8fbff] text-[#185FA5] active:scale-95 transition disabled:opacity-40 disabled:bg-[#f8fbff]">
              <ChevronLeft size={18} strokeWidth={2.5} />
            </button>

            <button
              type="button"
              onClick={() => setShowPaletteSheet(true)}
              className="flex-1 h-11 rounded-xl bg-[#EEF4FF] text-[#185FA5] font-semibold text-[12.5px] flex items-center justify-center gap-2 active:scale-[0.98] transition font-['Inter',sans-serif]"
              aria-label="Open question palette">
              <Grid3x3 size={14} strokeWidth={2.5} />
              <span>
                <span className="font-bold">{answeredMainCount}</span>
                <span className="text-[#888] mx-1">/</span>
                <span>{totalQuestions}</span>
                <span className="text-[#888] ml-1.5">answered</span>
              </span>
            </button>

            <button
              type="button"
              onClick={handleClearAnswer}
              aria-label="Clear answer"
              className="flex items-center justify-center w-11 h-11 rounded-xl border-[1.5px] border-[#ffd4d4] bg-white text-[#e24b4a] active:scale-95 transition">
              <X size={18} strokeWidth={2.5} />
            </button>

            <button
              type="button"
              onClick={() => setCurrentIndex((i) => i + 1)}
              disabled={currentIndex === questions.length - 1}
              aria-label="Next question"
              className="flex items-center justify-center w-11 h-11 rounded-xl bg-[linear-gradient(135deg,#1D9E75,#185FA5)] text-white active:scale-95 transition disabled:opacity-40">
              <ChevronRight size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* ── MOBILE PALETTE SHEET ── */}
        {showPaletteSheet && (
          <div
            className="md:hidden fixed inset-0 z-50 anim-fade-in"
            role="dialog"
            aria-modal="true">
            {/* backdrop */}
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setShowPaletteSheet(false)}
            />
            {/* sheet */}
            <div className="absolute left-0 right-0 bottom-0 max-h-[80vh] bg-white rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.15)] flex flex-col">
              {/* drag handle */}
              <div className="flex justify-center pt-2 pb-1">
                <div className="w-10 h-1 rounded-full bg-[#e2edf8]" />
              </div>
              {/* header */}
              <div className="flex items-center justify-between px-5 pb-3">
                <div className="text-[15px] font-bold text-[#0d1f3c]">
                  Question Palette
                </div>
                <button
                  type="button"
                  onClick={() => setShowPaletteSheet(false)}
                  aria-label="Close palette"
                  className="w-8 h-8 rounded-full bg-[#f0f4fb] flex items-center justify-center text-[#888] active:scale-90 transition">
                  <X size={16} strokeWidth={2.5} />
                </button>
              </div>
              {/* stats */}
              <div className="px-5 pb-3">
                <div className="bg-[#f8fbff] rounded-xl p-3 flex justify-around">
                  <Stat num={totalQuestions} label="Total" tone="default" />
                  <Stat num={answeredMainCount} label="Answered" tone="green" />
                  <Stat num={unansweredMainCount} label="Left" tone="gray" />
                </div>
              </div>
              {/* legend */}
              <div className="px-5 pb-3 flex items-center gap-4 text-[11px] text-[#666] font-['Inter',sans-serif]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-[3px] bg-[#1D9E75]" />
                  Current
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-[3px] bg-[#185FA5]" />
                  Answered
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-[3px] bg-[#e2edf8] border border-[#c8d8ed]" />
                  Blank
                </span>
              </div>
              {/* grid */}
              <div className="overflow-y-auto px-5 pb-6">
                <div className="grid grid-cols-6 gap-2">
                  {questions.map((q, i) => (
                    <PaletteButton
                      key={q.id}
                      q={q}
                      i={i}
                      currentIndex={currentIndex}
                      answers={answers}
                      onClick={() => {
                        setCurrentIndex(i);
                        setShowPaletteSheet(false);
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── TAB-SWITCH WARNING MODAL ── */}
      {showWarningModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 anim-fade-in"
          style={{ zIndex: 1001 }}>
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-[400px] w-full shadow-[0_20px_60px_rgba(0,0,0,0.2)] anim-fade-in">
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
              Warning!
            </div>
            <div className="text-[13px] text-[#666] text-center leading-relaxed mb-5 font-['Inter',sans-serif]">
              Navigating away from the test window is not allowed.
              <br />
              <br />
              <strong className="text-[#0d1f3c]">
                Warning {warningsRef.current} of {MAX_WARNINGS}.
              </strong>
              <br />
              If you leave this tab again, your test will be automatically
              submitted.
            </div>
            <button
              type="button"
              onClick={() => setShowWarningModal(false)}
              className="w-full h-11 rounded-xl bg-[linear-gradient(135deg,#e24b4a,#c43a39)] text-white text-[13px] font-semibold shadow-[0_4px_14px_rgba(226,75,74,0.25)] cursor-pointer transition-all hover:-translate-y-0.5">
              I Understand
            </button>
          </div>
        </div>
      )}

      {/* ── SUBMIT CONFIRM MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 z-[1000] bg-black/40 flex items-center justify-center p-4 anim-fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-[420px] w-full shadow-[0_20px_60px_rgba(0,0,0,0.2)] anim-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-center mb-3">
              <div className="w-14 h-14 rounded-full bg-[#EEF4FF] flex items-center justify-center">
                <ClipboardList
                  size={28}
                  className="text-[#185FA5]"
                  strokeWidth={2.25}
                />
              </div>
            </div>
            <div className="text-lg font-bold text-[#0d1f3c] text-center mb-2">
              Submit Test?
            </div>
            <div className="text-[13px] text-[#666] text-center leading-relaxed mb-5 font-['Inter',sans-serif]">
              Once submitted you cannot go back or change your answers. Are you
              sure you want to submit?
            </div>

            <div className="bg-[#f8fbff] rounded-xl p-3.5 mb-5 flex justify-around flex-wrap gap-2.5">
              <ModalStat num={totalQuestions} label="Total" tone="blue" />
              <ModalStat
                num={answeredMainCount}
                label="Answered"
                tone="green"
              />
              <ModalStat num={unansweredMainCount} label="Left" tone="gray" />
            </div>

            {!selectedFile && (
              <div className="flex items-start gap-2 bg-[#fff4e5] border border-[#f0ad4e] text-[#8a5a00] px-3 py-2.5 rounded-lg text-[12.5px] mb-4 font-['Inter',sans-serif]">
                <AlertTriangle
                  size={14}
                  className="shrink-0 mt-0.5"
                  strokeWidth={2.25}
                />
                <span>
                  Please upload your working sheet on the last question before
                  submitting.
                </span>
              </div>
            )}

            <div className="flex flex-col-reverse md:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 h-11 border-[1.5px] border-[#e2edf8] rounded-xl bg-white text-[13px] font-semibold text-[#888] cursor-pointer transition-colors hover:border-[#aaa] hover:text-[#555]">
                Go Back
              </button>
              <button
                type="button"
                onClick={() => submitTest(false)}
                disabled={!selectedFile}
                className="flex-1 h-11 rounded-xl bg-[linear-gradient(135deg,#1D9E75,#185FA5)] text-white text-[13px] font-semibold cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_14px_rgba(24,95,165,0.25)] disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:hover:shadow-none">
                Yes, Submit →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── small subcomponents ─── */

function Stat({ num, label, tone = "default" }) {
  const color =
    tone === "green"
      ? "text-[#1D9E75]"
      : tone === "gray"
        ? "text-[#aaa]"
        : "text-[#0d1f3c]";
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className={`text-lg font-bold ${color}`}>{num}</span>
      <span className="text-[9px] text-[#888] uppercase tracking-wide font-['Inter',sans-serif]">
        {label}
      </span>
    </div>
  );
}

function ModalStat({ num, label, tone }) {
  const color =
    tone === "green"
      ? "text-[#1D9E75]"
      : tone === "blue"
        ? "text-[#185FA5]"
        : tone === "gray"
          ? "text-[#aaa]"
          : "text-[#0d1f3c]";
  return (
    <div className="flex flex-col items-center gap-0.5 flex-1 min-w-[80px]">
      <span className={`text-[22px] font-bold ${color}`}>{num}</span>
      <span className="text-[10px] text-[#888] font-['Inter',sans-serif]">
        {label}
      </span>
    </div>
  );
}

function LegendRow({ color, label, border }) {
  return (
    <div className="flex items-center gap-2 mb-1.5 last:mb-0 text-[11px] text-[#555] font-['Inter',sans-serif]">
      <span
        className="w-3.5 h-3.5 rounded-[4px] shrink-0"
        style={
          border
            ? { background: color, border: "1.5px solid #c8d8ed" }
            : { background: color }
        }
      />
      {label}
    </div>
  );
}

function PaletteButton({ q, i, currentIndex, answers, onClick }) {
  const qLabel = parseQuestionData(q.q_text).label || i + 1;
  const isCurrent = i === currentIndex;
  const isAnswered = !!answers[q.id];

  const cls = isCurrent
    ? "bg-[#1D9E75] text-white shadow-[0_2px_8px_rgba(29,158,117,0.4)] scale-110 z-[2]"
    : isAnswered
      ? "bg-[#185FA5] text-white"
      : "bg-[#e2edf8] text-[#185FA5]";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full aspect-square rounded-md text-[10.5px] md:text-[11px] font-bold cursor-pointer transition-transform font-['Inter',sans-serif] p-0.5 hover:scale-110 hover:z-[2] ${cls}`}>
      {qLabel}
    </button>
  );
}
