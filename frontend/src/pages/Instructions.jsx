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
  @keyframes fadeInLeft {
    from { opacity: 0; transform: translateX(-16px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }
  @keyframes orbit1 {
    from { transform: rotate(0deg) translateX(100px) rotate(0deg); }
    to { transform: rotate(360deg) translateX(100px) rotate(-360deg); }
  }
  @keyframes orbit2 {
    from { transform: rotate(180deg) translateX(75px) rotate(-180deg); }
    to { transform: rotate(540deg) translateX(75px) rotate(-540deg); }
  }

  html, body {
    height: 100%; margin: 0;
    background: #EEF4FF;
    font-family: 'Sora', sans-serif;
    overflow: hidden;
  }

  .instr-outer {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: #EEF4FF;
    overflow: hidden;
  }

  .instr-card {
    display: flex;
    width: 100%;
    max-width: 980px;
    height: calc(100vh - 40px);
    max-height: 700px;
    border-radius: 28px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(74,144,217,0.15), 0 4px 16px rgba(0,0,0,0.06);
    animation: fadeInUp 0.6s ease both;
  }

  /* LEFT PANEL */
  .instr-left {
    width: 38%;
    background: linear-gradient(145deg, #1D9E75 0%, #185FA5 100%);
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    padding: 2rem 1.8rem;
    overflow: hidden;
    flex-shrink: 0;
  }
  .left-blob1 {
    position: absolute; top: -60px; right: -60px;
    width: 200px; height: 200px; border-radius: 50%;
    background: rgba(255,255,255,0.08);
  }
  .left-blob2 {
    position: absolute; bottom: -40px; left: -40px;
    width: 160px; height: 160px; border-radius: 50%;
    background: rgba(255,255,255,0.06);
  }
  .orbit-wrap {
    position: absolute; top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 220px; height: 220px; pointer-events: none;
  }
  .orbit-ring {
    position: absolute; inset: 0; border-radius: 50%;
    border: 1px dashed rgba(255,255,255,0.15);
  }
  .orbit-ring2 {
    position: absolute; inset: 22px; border-radius: 50%;
    border: 1px dashed rgba(255,255,255,0.1);
  }
  .orb1 {
    position: absolute; top: 50%; left: 50%;
    width: 8px; height: 8px; border-radius: 50%;
    background: white; margin: -4px;
    animation: orbit1 9s linear infinite;
    box-shadow: 0 0 8px rgba(255,255,255,0.8);
  }
  .orb2 {
    position: absolute; top: 50%; left: 50%;
    width: 6px; height: 6px; border-radius: 50%;
    background: rgba(255,255,255,0.7); margin: -3px;
    animation: orbit2 6s linear infinite;
  }

  .logo-wrap {
    position: relative; z-index: 2;
    animation: float 4s ease-in-out infinite;
    margin-bottom: 18px; width: 100%;
  }
  .logo-img-wrap {
    background: white; border-radius: 20px;
    padding: 10px 16px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.15);
    display: flex; align-items: center; justify-content: center;
  }
  .logo-real {
    width: 100%; max-width: 160px;
    height: auto; display: block; margin: 0 auto;
  }

  .left-text {
    position: relative; z-index: 2;
    text-align: left;
    animation: fadeInLeft 0.8s ease 0.3s both;
    margin-bottom: 18px;
    width: 100%;
  }
  .left-text h2 {
    color: white; font-size: 16px; font-weight: 600;
    line-height: 1.6; margin-bottom: 4px;
    text-align: left;
    padding-left:4px;
  }
  .left-text p {
    color: rgba(255,255,255,0.7); font-size: 11px;
    font-family: 'Inter', sans-serif;
    text-align: left;
    padding-left:4px;
  }

  .test-info-boxes {
    position: relative; z-index: 2;
    display: flex; flex-direction: column; gap: 7px;
    width: 100%;
    animation: fadeInLeft 0.8s ease 0.5s both;
  }
  .info-box {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 12px; border-radius: 11px;
    background: rgba(255,255,255,0.12);
    border: 1px solid rgba(255,255,255,0.18);
    font-family: 'Inter', sans-serif;
  }
  .info-box-icon {
    width: 30px; height: 30px; border-radius: 7px;
    background: rgb(255 255 255 / 82%);
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; flex-shrink: 0;
  }
  .info-box-content {
    display: flex; flex-direction: column;
    align-items: flex-start;
  }
  .info-box-label {
    font-size: 9px; color: rgba(255,255,255,0.6);
    margin-bottom: 1px; text-transform: uppercase;
    letter-spacing: 0.3px; text-align: left;
  }
  .info-box-value {
    font-size: 12px; font-weight: 600; color: white;
    text-align: left;
  }

  /* RIGHT PANEL */
  .instr-right {
    flex: 1; background: white;
    display: flex; align-items: center; justify-content: center;
    padding: 2rem 2.5rem;
    position: relative; overflow: hidden;
  }
  .instr-right::before {
    content: ''; position: absolute; top: -60px; right: -60px;
    width: 220px; height: 220px; border-radius: 50%;
    background: #EEF4FF; opacity: 0.6; pointer-events: none;
  }
  .instr-right::after {
    content: ''; position: absolute; bottom: -40px; left: -40px;
    width: 160px; height: 160px; border-radius: 50%;
    background: #E1F5EE; opacity: 0.5; pointer-events: none;
  }

  .content-wrap {
    width: 100%; max-width: 420px;
    animation: fadeInUp 0.6s ease 0.2s both;
    position: relative; z-index: 1;
  }

  .instr-title { margin-bottom: 12px; }
  .instr-title h2 {
    font-size: 20px; font-weight: 700;
    color: #0d1f3c; margin-bottom: 3px;
  }
  .instr-title p {
    font-size: 11px; color: #999;
    font-family: 'Inter', sans-serif;
  }

  .rules-title {
    font-size: 10px; font-weight: 700; color: #185FA5;
    text-transform: uppercase; letter-spacing: 0.5px;
    margin-bottom: 7px;
  }

  .rules-list {
    display: flex; flex-direction: column; gap: 5px;
    margin-bottom: 12px;
  }
  .rule-item {
    display: flex; align-items: center; gap: 10px;
    padding: 7px 11px; border-radius: 10px;
    background: #f8fbff;
    border: 1.5px solid #e2edf8;
    transition: all 0.2s;
  }
  .rule-item:hover { border-color: #185FA5; background: #EEF4FF; }
  .rule-num {
    width: 18px; height: 18px; border-radius: 5px;
    background: linear-gradient(135deg, #1D9E75, #185FA5);
    color: white; font-size: 9px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .rule-text {
    font-size: 11.5px; color: #444;
    font-family: 'Inter', sans-serif; line-height: 1.4;
  }
  .rule-text strong { color: #0d1f3c; font-weight: 600; }

  .checkbox-wrap {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 13px;
    background: #f0f9f5;
    border: 1.5px solid #b8e8d4;
    border-radius: 11px;
    margin-bottom: 10px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .checkbox-wrap:hover { border-color: #1D9E75; background: #e6f7f1; }
  .checkbox-wrap input[type="checkbox"] {
    width: 15px; height: 15px;
    accent-color: #1D9E75;
    cursor: pointer; flex-shrink: 0;
  }
  .checkbox-label {
    font-size: 11.5px; color: #1D9E75;
    font-family: 'Inter', sans-serif;
    font-weight: 500; cursor: pointer;
  }

  .start-btn {
    width: 100%; height: 44px; border: none; border-radius: 12px;
    font-size: 13.5px; font-weight: 600; font-family: 'Sora', sans-serif;
    color: white; cursor: pointer;
    background: linear-gradient(135deg, #1D9E75 0%, #185FA5 100%);
    transition: all 0.3s; position: relative; overflow: hidden;
  }
  .start-btn::before {
    content: ''; position: absolute; top: 0; left: -100%;
    width: 60%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s;
  }
  .start-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(24,95,165,0.3);
  }
  .start-btn:hover:not(:disabled)::before { left: 150%; }
  .start-btn:disabled {
    background: #d0dff0; color: #aab8cc; cursor: not-allowed;
  }

  @media (max-width: 768px) {
    html, body { overflow: auto; }
    .instr-outer { height: auto; padding: 12px; align-items: flex-start; overflow-y: auto; }
    .instr-card { flex-direction: column; height: auto; max-height: none; border-radius: 20px; }
    .instr-left { width: 100%; padding: 1.5rem; }
    .instr-left .orbit-wrap { display: none; }
    .instr-right { padding: 1.5rem; overflow-y: auto; }
    .content-wrap { max-width: 100%; }
  }
`;

const RULES = [
  {
    text: (
      <>
        <strong>Do not refresh</strong> the page. Your progress will be lost.
      </>
    ),
  },
  {
    text: (
      <>
        <strong>Do not switch tabs</strong> or open other windows.
      </>
    ),
  },
  {
    text: (
      <>
        The test has a <strong>time limit</strong>. It will auto-submit when
        time runs out.
      </>
    ),
  },
  {
    text: (
      <>
        Each question has <strong>4 options</strong>. Select only one answer.
      </>
    ),
  },
  {
    text: (
      <>
        You can <strong>navigate between questions</strong> using the question
        palette.
      </>
    ),
  },
  {
    text: (
      <>
        Once you click <strong>Submit Test</strong>, you cannot go back.
      </>
    ),
  },
];

export default function Instructions() {
  const navigate = useNavigate();
  const { testId } = useParams();
  const [checked, setChecked] = useState(false);
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken() || "test";
    fetchTestDetails(token);
  }, [testId]);

  const fetchTestDetails = async (token) => {
    try {
      const res = await fetch(
        `http://localhost/pramyan-assessment-portal/backend/routes/get-test-details.php?test_id=${testId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      if (data.success) {
        setTest(data.test);
      } else {
        setTest({
          name: "PRAMYAN EDUCATION — DIAGNOSTIC ASSESSMENT TEST",
          duration_mins: 45,
          total_questions: 32,
        });
      }
    } catch {
      setTest({
        name: "PRAMYAN EDUCATION — DIAGNOSTIC ASSESSMENT TEST",
        duration_mins: 45,
        total_questions: 32,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = () => {
    if (checked) navigate(`/test/${testId}`);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="instr-outer">
        <div className="instr-card">
          {/* LEFT PANEL */}
          <div className="instr-left">
            <div className="left-blob1" />
            <div className="left-blob2" />
            <div className="orbit-wrap">
              <div className="orbit-ring" />
              <div className="orbit-ring2" />
              <div className="orb1" />
              <div className="orb2" />
            </div>

            <div className="logo-wrap">
              <div className="logo-img-wrap">
                <img src={logo} alt="Pramyan Logo" className="logo-real" />
              </div>
            </div>

            <div className="left-text">
              <h2>
                You're almost ready! Read carefully.
              </h2>
              <p>Please go through all instructions before starting</p>
            </div>

            {!loading && test && (
              <div className="test-info-boxes">
                <div className="info-box">
                  <div className="info-box-icon">📝</div>
                  <div className="info-box-content">
                    <span className="info-box-label">Test Name</span>
                    <span className="info-box-value">{test.name}</span>
                  </div>
                </div>
                <div className="info-box">
                  <div className="info-box-icon">⏱</div>
                  <div className="info-box-content">
                    <span className="info-box-label">Duration</span>
                    <span className="info-box-value">
                      {test.duration_mins} Minutes
                    </span>
                  </div>
                </div>
                <div className="info-box">
                  <div className="info-box-icon">❓</div>
                  <div className="info-box-content">
                    <span className="info-box-label">Total Questions</span>
                    <span className="info-box-value">
                      {test.total_questions} Questions
                    </span>
                  </div>
                </div>
                <div className="info-box">
                  <div className="info-box-icon">🎓</div>
                  <div className="info-box-content">
                    <span className="info-box-label">Class</span>
                    <span className="info-box-value">Class {test.class}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT PANEL */}
          <div className="instr-right">
            <div className="content-wrap">
              <div className="instr-title">
                <h2>Instructions</h2>
                <p>Read all rules carefully before you begin</p>
              </div>

              <div className="rules-title">📋 General Rules</div>
              <div className="rules-list">
                {RULES.map((rule, i) => (
                  <div className="rule-item" key={i}>
                    <div className="rule-num">{i + 1}</div>
                    <div className="rule-text">{rule.text}</div>
                  </div>
                ))}
              </div>

              <label
                className="checkbox-wrap"
                onClick={() => setChecked(!checked)}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => setChecked(!checked)}
                />
                <span className="checkbox-label">
                  I have read and understood all the instructions above
                </span>
              </label>

              <button
                className="start-btn"
                onClick={handleStartTest}
                disabled={!checked}>
                {checked ? "Start Test →" : "Please read instructions first"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
