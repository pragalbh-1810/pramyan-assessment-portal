import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpeg";
import { setToken, setRole } from "../utils/auth";

const BASE = "https://pramyan.com/assessment/backend_test/backend/routes";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=Inter:wght@400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; background: #EEF4FF; font-family: 'Sora', sans-serif; }

  @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  @keyframes orbit1 { from{transform:rotate(0deg) translateX(100px) rotate(0deg)} to{transform:rotate(360deg) translateX(100px) rotate(-360deg)} }
  @keyframes orbit2 { from{transform:rotate(180deg) translateX(75px) rotate(-180deg)} to{transform:rotate(540deg) translateX(75px) rotate(-540deg)} }

  .cp-outer { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px; background:#EEF4FF; }
  .cp-card { display:flex; width:100%; max-width:900px; min-height:540px; border-radius:28px; overflow:hidden; box-shadow:0 20px 60px rgba(74,144,217,0.15); animation:fadeInUp 0.6s ease both; }

  .cp-left { width:38%; background:linear-gradient(145deg,#1D9E75 0%,#185FA5 100%); display:flex; flex-direction:column; align-items:center; justify-content:center; padding:2.5rem 2rem; position:relative; overflow:hidden; }
  .cp-left .blob1 { position:absolute; top:-60px; right:-60px; width:200px; height:200px; border-radius:50%; background:rgba(255,255,255,0.08); }
  .cp-left .blob2 { position:absolute; bottom:-40px; left:-40px; width:160px; height:160px; border-radius:50%; background:rgba(255,255,255,0.06); }
  .orbit-wrap { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:220px; height:220px; pointer-events:none; }
  .orbit-ring  { position:absolute; inset:0; border-radius:50%; border:1px dashed rgba(255,255,255,0.15); }
  .orbit-ring2 { position:absolute; inset:22px; border-radius:50%; border:1px dashed rgba(255,255,255,0.1); }
  .orb1 { position:absolute; top:50%; left:50%; width:8px; height:8px; border-radius:50%; background:white; margin:-4px; animation:orbit1 9s linear infinite; }
  .orb2 { position:absolute; top:50%; left:50%; width:6px; height:6px; border-radius:50%; background:rgba(255,255,255,0.7); margin:-3px; animation:orbit2 6s linear infinite; }
  .logo-wrap { position:relative; z-index:2; animation:float 4s ease-in-out infinite; margin-bottom:22px; width:100%; }
  .logo-img-wrap { background:white; border-radius:20px; padding:12px 18px; box-shadow:0 8px 30px rgba(0,0,0,0.15); display:flex; align-items:center; justify-content:center; }
  .logo-real { width:100%; max-width:160px; height:auto; display:block; margin:0 auto; }
  .left-text { position:relative; z-index:2; text-align:center; margin-bottom:20px; }
  .left-text h2 { color:white; font-size:17px; font-weight:600; line-height:1.6; margin-bottom:6px; }
  .left-text p  { color:rgba(255,255,255,0.7); font-size:12px; font-family:'Inter',sans-serif; }
  .step-indicator { position:relative; z-index:2; display:flex; flex-direction:column; gap:10px; width:100%; }
  .step-item { display:flex; align-items:center; gap:10px; padding:10px 14px; border-radius:12px; background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.18); }
  .step-num { width:24px; height:24px; border-radius:50%; background:rgba(255,255,255,0.9); color:#185FA5; font-size:11px; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .step-num.done { background:#1D9E75; color:white; }
  .step-label { font-size:12px; color:white; font-family:'Inter',sans-serif; }

  .cp-right { flex:1; background:white; display:flex; align-items:center; justify-content:center; padding:2.5rem 3rem; position:relative; overflow:hidden; }
  .cp-right::before { content:''; position:absolute; top:-60px; right:-60px; width:220px; height:220px; border-radius:50%; background:#EEF4FF; opacity:0.6; pointer-events:none; }
  .cp-right::after  { content:''; position:absolute; bottom:-40px; left:-40px; width:160px; height:160px; border-radius:50%; background:#E1F5EE; opacity:0.5; pointer-events:none; }

  .form-wrap { width:100%; max-width:360px; animation:fadeInUp 0.6s ease 0.2s both; position:relative; z-index:1; }
  .form-title { margin-bottom:20px; }
  .form-title h2 { font-size:22px; font-weight:700; color:#0d1f3c; margin-bottom:4px; }
  .form-title p  { font-size:12px; color:#999; font-family:'Inter',sans-serif; }

  .welcome-banner { display:flex; align-items:center; gap:10px; padding:10px 14px; background:#EEF4FF; border:1.5px solid #d4e4f7; border-radius:12px; margin-bottom:20px; }
  .welcome-avatar { width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg,#1D9E75,#185FA5); display:flex; align-items:center; justify-content:center; color:white; font-size:14px; font-weight:700; flex-shrink:0; }
  .welcome-name { font-size:13px; font-weight:600; color:#0d1f3c; }
  .welcome-sub  { font-size:11px; color:#888; font-family:'Inter',sans-serif; }

  .field { margin-bottom:12px; }
  .field label { display:block; font-size:10px; font-weight:700; color:#185FA5; margin-bottom:4px; letter-spacing:0.5px; text-transform:uppercase; }
  .field input, .field select { width:100%; height:42px; border:1.5px solid #e2edf8; border-radius:10px; padding:0 12px; font-size:13px; font-family:'Inter',sans-serif; color:#1a1a1a; background:#f8fbff; outline:none; transition:all 0.2s; appearance:none; }
  .field input:focus, .field select:focus { border-color:#185FA5; background:white; box-shadow:0 0 0 3px rgba(24,95,165,0.08); }
  .select-wrap { position:relative; }
  .select-wrap::after { content:'▾'; position:absolute; right:12px; top:50%; transform:translateY(-50%); color:#185FA5; font-size:11px; pointer-events:none; }
  .grid2 { display:grid; grid-template-columns:1fr 1fr; gap:10px; }

  .submit-btn { width:100%; height:46px; border:none; border-radius:12px; font-size:14px; font-weight:600; font-family:'Sora',sans-serif; color:white; cursor:pointer; margin-top:6px; background:linear-gradient(135deg,#1D9E75 0%,#185FA5 100%); transition:all 0.3s; }
  .submit-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 24px rgba(24,95,165,0.3); }
  .submit-btn:disabled { opacity:0.7; cursor:not-allowed; }

  .error-msg { color:#e24b4a; font-size:11px; margin-top:3px; font-family:'Inter',sans-serif; }
  .api-err { background:#fff0f0; border:1.5px solid #ffd4d4; border-radius:10px; padding:10px 14px; font-size:12px; color:#e24b4a; font-family:'Inter',sans-serif; margin-bottom:14px; }

  @media(max-width:768px){
    .cp-card { flex-direction:column; }
    .cp-left { width:100%; padding:1.5rem; }
    .cp-right { padding:1.5rem; }
    .grid2 { grid-template-columns:1fr; }
  }
`;

export default function CompleteProfile() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [form, setForm] = useState({ class: "", board: "", parentPhone: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get token from URL — google-auth.php puts it here
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (!t) {
      navigate("/signup");
      return;
    }

    // Save token immediately so API calls work
    setToken(t);
    setRole("student");

    // Decode to get name/email for the welcome banner
    try {
      const decoded = JSON.parse(atob(t.split(".")[1]));
      setName(decoded.name || "");
      setEmail(decoded.email || "");
    } catch {
      /* ignore */
    }
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
      const res = await fetch(`${BASE}/update-profile.php`, {
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
        // ✅ Save the NEW token that has correct class in it
        if (data.token) {
          setToken(data.token);
        }

        // ✅ Map class to correct test ID
        const classToTestId = { 8: 3, 9: 2, 10: 1 };
        const testId = classToTestId[String(form.class)] || 1;

        navigate(`/instructions/${testId}`);
      } else {
        setErrors({ api: data.message || "Failed to save profile" });
      }
    } catch {
      setErrors({ api: "Network error. Check XAMPP is running." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="cp-outer">
        <div className="cp-card">
          {/* LEFT */}
          <div className="cp-left">
            <div className="blob1" />
            <div className="blob2" />
            <div className="orbit-wrap">
              <div className="orbit-ring" />
              <div className="orbit-ring2" />
              <div className="orb1" />
              <div className="orb2" />
            </div>
            <div className="logo-wrap">
              <div className="logo-img-wrap">
                <img src={logo} alt="Pramyan" className="logo-real" />
              </div>
            </div>
            <div className="left-text">
              <h2>Almost there!</h2>
              <p>Just a few details to personalise your experience</p>
            </div>
            <div className="step-indicator">
              {[
                { num: "✓", label: "Google Sign In", done: true },
                { num: "2", label: "Complete Profile", done: false },
                { num: "3", label: "Start Your Test", done: false },
              ].map((s, i) => (
                <div className="step-item" key={i}>
                  <div className={`step-num ${s.done ? "done" : ""}`}>
                    {s.num}
                  </div>
                  <span className="step-label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div className="cp-right">
            <div className="form-wrap">
              <div className="form-title">
                <h2>Complete Your Profile</h2>
                <p>We need a few more details to get you started</p>
              </div>

              {name && (
                <div className="welcome-banner">
                  <div className="welcome-avatar">{name[0]?.toUpperCase()}</div>
                  <div>
                    <div className="welcome-name">
                      Welcome, {name.split(" ")[0]}! 👋
                    </div>
                    <div className="welcome-sub">{email}</div>
                  </div>
                </div>
              )}

              {errors.api && <div className="api-err">❌ {errors.api}</div>}

              <div className="grid2">
                <div className="field">
                  <label>Class *</label>
                  <div className="select-wrap">
                    <select
                      value={form.class}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, class: e.target.value }))
                      }>
                      <option value="">Select Class</option>
                      <option value="8">Class 8</option>
                      <option value="9">Class 9</option>
                      <option value="10">Class 10</option>
                    </select>
                  </div>
                  {errors.class && <p className="error-msg">{errors.class}</p>}
                </div>
                <div className="field">
                  <label>School Board *</label>
                  <div className="select-wrap">
                    <select
                      value={form.board}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, board: e.target.value }))
                      }>
                      <option value="">Select Board</option>
                      <option value="CBSE">CBSE</option>
                      <option value="ICSE">ICSE</option>
                      <option value="State Board">State Board</option>
                    </select>
                  </div>
                  {errors.board && <p className="error-msg">{errors.board}</p>}
                </div>
              </div>

              <div className="field">
                <label>Parent's Phone *</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={form.parentPhone}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, parentPhone: e.target.value }))
                  }
                />
                {errors.parentPhone && (
                  <p className="error-msg">{errors.parentPhone}</p>
                )}
              </div>

              <button
                className="submit-btn"
                onClick={handleSubmit}
                disabled={loading}>
                {loading ? "Saving..." : "Save & Start My Test →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
