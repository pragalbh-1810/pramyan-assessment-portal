import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getToken } from "../utils/auth";
import { setupTabSwitchMonitor } from "../utils/tabSwitchMonitor";
import { useAutoSubmit } from "../utils/autoSubmit";
import { uploadWorkingSheet } from "../utils/fileUpload";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=Inter:wght@400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  html, body {
    height: 100%; margin: 0;
    background: #EEF4FF;
    font-family: 'Sora', sans-serif;
    overflow: hidden;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
  @keyframes timerWarn {
    0%, 100% { background: #fff0f0; }
    50% { background: #ffe0e0; }
  }

  /* ── LAYOUT ── */
  .test-outer {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: #EEF4FF;
    overflow: hidden;
  }

  /* ── TOPBAR ── */
  .test-topbar {
    background: linear-gradient(145deg, #1D9E75 0%, #185FA5 100%);
    padding: 0 28px;
    margin:12px;
    border-radius: 15px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 4px 16px rgba(24,95,165,0.2);
    flex-shrink: 0;
    z-index: 10;
  }
  .topbar-left {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
  }
  .topbar-testname {
    font-size: 14px;
    font-weight: 700;
    color: white;
    line-height: 1.2;
  }
  .topbar-student {
    font-size: 11px;
    color: rgba(255,255,255,0.75);
    font-family: 'Inter', sans-serif;
  }
  .topbar-center {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  /* Auto-Save Indicator */
  .save-indicator {
    font-size: 11px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    padding: 6px 12px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    gap: 6px;
    animation: fadeIn 0.3s ease;
  }
  .save-indicator.saving {
    color: #185FA5;
    background: rgba(255, 255, 255, 0.9);
  }
  .save-indicator.success {
    color: #1D9E75;
    background: #E1F5EE;
  }

  .timer-box {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 18px;
    border-radius: 12px;
    background: rgba(255,255,255,0.15);
    border: 1.5px solid rgba(255,255,255,0.3);
    font-size: 20px;
    font-weight: 700;
    color: white;
    font-family: 'Inter', sans-serif;
    letter-spacing: 2px;
    min-width: 120px;
    justify-content: center;
  }
  .timer-box.warn {
    background: rgba(226,75,74,0.25);
    border-color: #ff9b9b;
    color: #ffe0e0;
    animation: timerWarn 1s ease infinite;
  }
  .timer-icon { font-size: 16px; }
  .topbar-right {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .submit-top-btn {
    background: white;
    color: #185FA5;
    border: none;
    border-radius: 10px;
    padding: 9px 20px;
    font-size: 13px;
    font-weight: 700;
    font-family: 'Sora', sans-serif;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }
  .submit-top-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(0,0,0,0.15);
  }

  /* ── MAIN BODY ── */
  .test-body {
    flex: 1;
    display: flex;
    overflow: hidden;
    padding: 14px;
    gap: 12px;
    min-height: 0;
  }

  /* ── QUESTION PANEL ── */
  .question-panel {
    flex: 1;
    background: white;
    border-radius: 20px;
    padding: 24px 28px;
    box-shadow: 0 2px 16px rgba(24,95,165,0.07);
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    animation: fadeIn 0.4s ease both;
  }
  .q-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    flex-shrink: 0;
  }
  .q-counter {
    font-size: 12px;
    color: #888;
    font-family: 'Inter', sans-serif;
  }
  .q-counter strong {
    color: #185FA5;
    font-size: 14px;
  }
  .q-section-tag {
    font-size: 11px;
    font-weight: 600;
    padding: 4px 12px;
    border-radius: 20px;
    background: #EEF4FF;
    color: #185FA5;
    font-family: 'Inter', sans-serif;
  }
  .q-text {
    font-size: 15px;
    font-weight: 600;
    color: #0d1f3c;
    line-height: 1.7;
    margin-bottom: 16px;
    flex-shrink: 0;
  }
  .q-image-container {
    margin-bottom: 24px;
    text-align: left;
  }
  .q-image-container img {
    max-width: 100%;
    max-height: 280px;
    border-radius: 12px;
    border: 1.5px solid #e2edf8;
    object-fit: contain;
  }
  .options-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex: 1;
  }
  .option-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 18px;
    border-radius: 14px;
    border: 2px solid #e2edf8;
    background: #f8fbff;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 13.5px;
    color: #333;
    font-family: 'Inter', sans-serif;
  }
  .option-item:hover {
    border-color: #185FA5;
    background: #EEF4FF;
    transform: translateX(3px);
  }
  .option-item.selected {
    border-color: #185FA5;
    background: #EEF4FF;
    color: #0d1f3c;
    font-weight: 600;
  }
  .option-badge {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    background: #e2edf8;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    color: #185FA5;
    flex-shrink: 0;
    transition: all 0.2s;
  }
  .option-item.selected .option-badge {
    background: #185FA5;
    color: white;
  }

  /* Navigation buttons */
  .q-nav-btns {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 24px;
    flex-shrink: 0;
  }
  .nav-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 9px 20px;
    border-radius: 10px;
    border: 1.5px solid #e2edf8;
    background: #f8fbff;
    font-size: 13px;
    font-weight: 600;
    font-family: 'Sora', sans-serif;
    color: #185FA5;
    cursor: pointer;
    transition: all 0.2s;
  }
  .nav-btn:hover:not(:disabled) {
    border-color: #185FA5;
    background: #EEF4FF;
  }
  .nav-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  .clear-btn {
    font-size: 12px;
    color: #e24b4a;
    background: none;
    border: 1.5px solid #ffd4d4;
    border-radius: 10px;
    padding: 8px 16px;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: all 0.2s;
  }
  .clear-btn:hover { background: #fff0f0; }

  /* ── RIGHT SIDEBAR ── */
  .test-sidebar {
    width: 280px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    flex-shrink: 0;
    overflow-y: auto;
  }

  /* Legend */
  .legend-box {
    background: white;
    border-radius: 16px;
    padding: 14px 16px;
    box-shadow: 0 2px 12px rgba(24,95,165,0.06);
  }
  .legend-title {
    font-size: 10px;
    font-weight: 700;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 10px;
    font-family: 'Inter', sans-serif;
  }
  .legend-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
    font-size: 11px;
    color: #555;
    font-family: 'Inter', sans-serif;
  }
  .legend-dot {
    width: 14px;
    height: 14px;
    border-radius: 4px;
    flex-shrink: 0;
  }
  .dot-answered { background: #185FA5; }
  .dot-current { background: #1D9E75; }
  .dot-unanswered { background: #e2edf8; border: 1.5px solid #c8d8ed; }

  /* Stats */
  .stats-box {
    background: white;
    border-radius: 16px;
    padding: 14px 16px;
    box-shadow: 0 2px 12px rgba(24,95,165,0.06);
    display: flex;
    justify-content: space-around;
  }
  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }
  .stat-num {
    font-size: 18px;
    font-weight: 700;
    color: #0d1f3c;
  }
  .stat-num.green { color: #1D9E75; }
  .stat-num.gray { color: #aaa; }
  .stat-lbl {
    font-size: 9px;
    color: #888;
    font-family: 'Inter', sans-serif;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  /* Question palette */
  .palette-box {
    background: white;
    border-radius: 16px;
    padding: 14px 16px;
    box-shadow: 0 2px 12px rgba(24,95,165,0.06);
    flex: 1;
    overflow-y: auto;
  }
  .palette-title {
    font-size: 10px;
    font-weight: 700;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 10px;
    font-family: 'Inter', sans-serif;
  }
  .palette-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 6px;
  }
  .palette-btn {
    width: 100%;
    aspect-ratio: 1;
    border-radius: 6px;
    border: none;
    font-size: 10.5px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.15s;
    font-family: 'Inter', sans-serif;
    padding: 2px;
  }
  .palette-btn.answered {
    background: #185FA5;
    color: white;
  }
  .palette-btn.current {
    background: #1D9E75;
    color: white;
    transform: scale(1.1);
    box-shadow: 0 2px 8px rgba(29,158,117,0.4);
    z-index: 2;
  }
  .palette-btn.unanswered {
    background: #e2edf8;
    color: #185FA5;
  }
  .palette-btn:hover {
    transform: scale(1.1);
    z-index: 2;
  }
  .palette-btn.current:hover {
    transform: scale(1.15);
  }

  /* Submit confirm modal */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.2s ease both;
  }
  .modal-box {
    background: white;
    border-radius: 24px;
    padding: 32px;
    max-width: 400px;
    width: 90%;
    box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    animation: fadeIn 0.3s ease both;
  }
  .modal-icon { font-size: 40px; margin-bottom: 12px; text-align: center; }
  .modal-title {
    font-size: 18px;
    font-weight: 700;
    color: #0d1f3c;
    margin-bottom: 8px;
    text-align: center;
  }
  .modal-text {
    font-size: 13px;
    color: #888;
    font-family: 'Inter', sans-serif;
    text-align: center;
    line-height: 1.6;
    margin-bottom: 20px;
  }
  .modal-stats {
    display: flex;
    justify-content: space-around;
    background: #f8fbff;
    border-radius: 12px;
    padding: 14px;
    margin-bottom: 20px;
  }
  .modal-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
  }
  .modal-stat-num {
    font-size: 22px;
    font-weight: 700;
    color: #0d1f3c;
  }
  .modal-stat-num.blue { color: #185FA5; }
  .modal-stat-num.green { color: #1D9E75; }
  .modal-stat-num.gray { color: #aaa; }
  .modal-stat-label {
    font-size: 10px;
    color: #888;
    font-family: 'Inter', sans-serif;
  }
  .modal-btns {
    display: flex;
    gap: 10px;
  }
  .modal-cancel {
    flex: 1;
    height: 42px;
    border: 1.5px solid #e2edf8;
    border-radius: 12px;
    background: white;
    font-size: 13px;
    font-weight: 600;
    font-family: 'Sora', sans-serif;
    color: #888;
    cursor: pointer;
    transition: all 0.2s;
  }
  .modal-cancel:hover { border-color: #aaa; color: #555; }
  .modal-confirm {
    flex: 1;
    height: 42px;
    border: none;
    border-radius: 12px;
    background: linear-gradient(135deg, #1D9E75, #185FA5);
    color: white;
    font-size: 13px;
    font-weight: 600;
    font-family: 'Sora', sans-serif;
    cursor: pointer;
    transition: all 0.2s;
  }
  .modal-confirm:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(24,95,165,0.25);
  }

  @media (max-width: 768px) {
    .test-body { flex-direction: column; padding: 10px; gap: 10px; }
    .test-sidebar { width: 100%; flex-direction: row; overflow-x: auto; overflow-y: hidden; }
    .palette-box { min-width: 200px; }
    .legend-box { min-width: 150px; }
    .stats-box { min-width: 180px; }
  }
`;

const TOTAL_TIME = 45 * 60; // 45 minutes

function decodeToken(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

// NEW: Helper function to separate "Q21 (a):" from the actual text
const parseQuestionData = (text) => {
  if (!text) return { label: null, body: "" };
  // Regex to find patterns like "Q21 (a): " or "Q1: " at the start
  const match = text.match(/^Q(\d+(?:\s*\([a-zA-Z]\))?)\s*:\s*([\s\S]*)/i);
  if (match) {
    // Removes spaces so "21 (a)" becomes "21(a)" for the UI
    return { label: match[1].replace(/\s+/g, ''), body: match[2] }; 
  }
  return { label: null, body: text };
};

export default function ActiveTest() {
  const navigate = useNavigate();
  const { testId } = useParams();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); 
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [showModal, setShowModal] = useState(false);
  const [studentName, setStudentName] = useState("Student");
  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const [saveIndicator, setSaveIndicator] = useState({ show: false, text: "", type: "" });
  const answersRef = useRef({});

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const [showWarningModal, setShowWarningModal] = useState(false);
  const warningsRef = useRef(0);
  const MAX_WARNINGS = 2;

  const timerRef = useRef(null);

  const { handleAutoSubmit, submitTest } = useAutoSubmit({
    testId,
    answersRef,
    submitted,
    setSubmitted,
    setSaveIndicator,
    timerRef
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
  }, [testId]);

  const fetchQuestions = async (token) => {
    try {
      const res = await fetch(
        `http://localhost/pramyan-assessment-portal/backend/routes/get-questions.php?test_id=${testId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const result = await res.json();
      if (result.success && result.questions?.length > 0) {
        setQuestions(result.questions);
      }
    } catch (err) {
      console.error(err);
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
        alert("You switched tabs/windows multiple times. Your test is now automatically submitted.");
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

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const isWarning = timeLeft <= 5 * 60;

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;

  // Process the current question text
  const parsedCurrentQ = parseQuestionData(currentQuestion?.q_text);
  const displayLabel = parsedCurrentQ.label || (currentIndex + 1);
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

  // 2. Add handle function
const handleFileChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // You need the student_test_id. This is usually returned 
  // when the test starts or stored in a state. 
  // For this example, I'll assume it's available.
  // Backend derives student_test_id using test_id + auth user.
  const currentTestId = testId;

  setUploading(true);
  setSaveIndicator({ show: true, text: "Uploading sheet...", type: "saving" });

  const result = await uploadWorkingSheet(file, currentTestId);

  if (result.success) {
    setSelectedFile(file.name);
    setSaveIndicator({ show: true, text: "Sheet Uploaded!", type: "success" });
  } else {
    setSaveIndicator({ show: true, text: "Upload Failed", type: "warn" });
  }
  setUploading(false);
  
  setTimeout(() => setSaveIndicator({ show: false }), 3000);
};

  if (questions.length === 0) return <div style={{padding: '40px', textAlign: 'center'}}>Loading Test...</div>;

  return (
    <>
      <style>{styles}</style>
      <div className="test-outer">
        {/* TOP BAR */}
        <div className="test-topbar">
          <div className="topbar-left">
            <span className="topbar-testname">Pramyan Diagnostic Assessment</span>
            <span className="topbar-student">👤 {studentName}</span>
          </div>

          <div className="topbar-center">
            {saveIndicator.show && (
              <div className={`save-indicator ${saveIndicator.type}`}>
                {saveIndicator.text}
              </div>
            )}
            <div className={`timer-box ${isWarning ? "warn" : ""}`}>
              <span className="timer-icon">⏱</span>
              {formatTime(timeLeft)}
            </div>
          </div>

          <div className="topbar-right">
            <button className="submit-top-btn" onClick={() => setShowModal(true)}>
              Submit Test
            </button>
          </div>
        </div>

        {/* MAIN BODY */}
        <div className="test-body">
          {/* QUESTION PANEL */}
          <div className="question-panel">
            <div className="q-header">
              <div className="q-counter">
                {/* Dynamically uses "21(a)" or the standard index */}
                Question <strong>{displayLabel}</strong> of {questions.length}
              </div>
              <div className="q-section-tag">{currentQuestion?.section}</div>
            </div>

            {/* Display the clean question text */}
            <div className="q-text">{displayBody}</div>

            {/* NEW: Display the image if it exists in the DB */}
            {currentQuestion?.q_image && (
              <div className="q-image-container">
                <img 
                  src={`http://localhost/pramyan-assessment-portal/backend/assets/images/${currentQuestion.q_image}`} 
                  alt={`Figure for Question ${displayLabel}`}
                />
              </div>
            )}

            <div className="options-list">
              {["a", "b", "c", "d"].map((opt) => (
                <div
                  key={opt}
                  className={`option-item ${answers[currentQuestion?.id] === opt ? "selected" : ""}`}
                  onClick={() => handleOptionSelect(opt)}>
                  <div className="option-badge">{opt.toUpperCase()}</div>
                  {currentQuestion?.[`opt_${opt}`]}
                </div>
              ))}
            </div>

            {/* 3. CONDITIONAL UPLOAD SECTION */}
        {currentIndex === questions.length - 1 && (
            <div className="upload-container">
                <label className="upload-label">
                    Step 3: Upload your rough work / working sheet (Optional)
                </label>
                <input 
                    type="file" 
                    className="file-input" 
                    onChange={handleFileChange}
                    disabled={uploading}
                    accept=".pdf,.jpg,.jpeg,.png"
                />
                {selectedFile && (
                    <p style={{fontSize: '11px', color: '#1D9E75', marginTop: '5px'}}>
                        ✓ {selectedFile} attached
                    </p>
                )}
            </div>
        )}

            <div className="q-nav-btns">
              <button
                className="nav-btn"
                onClick={() => setCurrentIndex((i) => i - 1)}
                disabled={currentIndex === 0}>
                ← Previous
              </button>
              <button className="clear-btn" onClick={handleClearAnswer}>
                Clear Answer
              </button>
              <button
                className="nav-btn"
                onClick={() => setCurrentIndex((i) => i + 1)}
                disabled={currentIndex === questions.length - 1}>
                Next →
              </button>
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="test-sidebar">
            <div className="stats-box">
              <div className="stat-item">
                <span className="stat-num">{questions.length}</span>
                <span className="stat-lbl">Total</span>
              </div>
              <div className="stat-item">
                <span className="stat-num green">{answeredCount}</span>
                <span className="stat-lbl">Answered</span>
              </div>
              <div className="stat-item">
                <span className="stat-num gray">{unansweredCount}</span>
                <span className="stat-lbl">Left</span>
              </div>
            </div>

            <div className="legend-box">
              <div className="legend-title">Legend</div>
              <div className="legend-row"><div className="legend-dot dot-current" />Current</div>
              <div className="legend-row"><div className="legend-dot dot-answered" />Answered</div>
              <div className="legend-row"><div className="legend-dot dot-unanswered" />Not Answered</div>
            </div>

            <div className="palette-box">
              <div className="palette-title">Question Palette</div>
              <div className="palette-grid">
                {questions.map((q, i) => {
                  // Dynamically label the buttons with "1", "21(a)", etc.
                  const qLabel = parseQuestionData(q.q_text).label || (i + 1);
                  return (
                    <button
                      key={q.id}
                      className={`palette-btn ${i === currentIndex ? "current" : answers[q.id] ? "answered" : "unanswered"}`}
                      onClick={() => setCurrentIndex(i)}>
                      {qLabel}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showWarningModal && (
        <div className="modal-overlay" style={{ zIndex: 1001 }}>
          <div className="modal-box">
            <div className="modal-icon">⚠️</div>
            <div className="modal-title">Warning!</div>
            <div className="modal-text">
              Navigating away from the test window is not allowed. <br/><br/>
              <strong>Warning {warningsRef.current} of {MAX_WARNINGS}.</strong><br/>
              If you leave this tab again, your test will be automatically submitted.
            </div>
            <div className="modal-btns">
              <button
                className="modal-confirm"
                onClick={() => setShowWarningModal(false)}
                style={{ width: '100%', background: 'linear-gradient(135deg, #e24b4a, #c43a39)', boxShadow: '0 4px 14px rgba(226,75,74,0.25)' }}>
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-icon">📋</div>
            <div className="modal-title">Submit Test?</div>
            <div className="modal-text">
              Once submitted you cannot go back or change your answers. Are you sure you want to submit?
            </div>
            <div className="modal-stats">
              <div className="modal-stat"><span className="modal-stat-num blue">{questions.length}</span><span className="modal-stat-label">Total</span></div>
              <div className="modal-stat"><span className="modal-stat-num green">{answeredCount}</span><span className="modal-stat-label">Answered</span></div>
              <div className="modal-stat"><span className="modal-stat-num gray">{unansweredCount}</span><span className="modal-stat-label">Unanswered</span></div>
            </div>
            <div className="modal-btns">
              <button className="modal-cancel" onClick={() => setShowModal(false)}>Go Back</button>
              <button className="modal-confirm" onClick={() => submitTest(false)}>Yes, Submit →</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}