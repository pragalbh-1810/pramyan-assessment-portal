import { useState } from "react";
import logo from "../assets/logo.jpeg";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { setToken, setRole } from "../utils/auth";

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

  html, body { height: 100%; margin: 0; background: #EEF4FF; font-family: 'Sora', sans-serif; overflow: hidden; }

  .signup-outer {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: #EEF4FF;
  }

  .signup-card {
    display: flex;
    width: 100%;
    max-width: 980px;
    min-height: 600px;
    border-radius: 28px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(74,144,217,0.15), 0 4px 16px rgba(0,0,0,0.06);
    animation: fadeInUp 0.6s ease both;
  }

  /* ── LEFT ── */
  .signup-left {
    width: 40%;
    background: linear-gradient(145deg, #1D9E75 0%, #185FA5 100%);
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2.5rem 2rem;
    overflow: hidden;
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
  .left-blob3 {
    position: absolute; top: 40%; left: -20px;
    width: 100px; height: 100px; border-radius: 50%;
    background: rgba(255,255,255,0.05);
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
    margin-bottom: 22px; width: 100%;
  }
  .logo-img-wrap {
    background: white; border-radius: 20px;
    padding: 12px 18px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.15);
    display: flex; align-items: center; justify-content: center;
  }
  .logo-real {
    width: 100%; max-width: 180px;
    height: auto; display: block; margin: 0 auto;
  }

  .left-text {
    position: relative; z-index: 2; text-align: center;
    animation: fadeInLeft 0.8s ease 0.3s both; margin-bottom: 20px;
  }
  .left-text h2 {
    color: white; font-size: 17px; font-weight: 600;
    line-height: 1.6; margin-bottom: 6px;
  }
  .left-text p { color: rgba(255,255,255,0.7); font-size: 12px; font-family: 'Inter', sans-serif; }

  .features {
    position: relative; z-index: 2;
    display: flex; flex-direction: column; gap: 8px;
    width: 100%;
    animation: fadeInLeft 0.8s ease 0.5s both;
    margin-bottom: 20px;
  }
  .feat-item {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 14px; border-radius: 12px;
    background: rgba(255,255,255,0.12);
    border: 1px solid rgba(255,255,255,0.18);
    color: white; font-size: 12px;
    font-family: 'Inter', sans-serif;
    transition: all 0.2s; cursor: default;
  }
  .feat-item:hover {
    background: rgba(255,255,255,0.2);
    transform: translateX(3px);
  }
  .feat-icon {
    width: 24px; height: 24px; border-radius: 8px;
    background: rgba(255,255,255,0.2);
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; flex-shrink: 0;
  }

  .bottom-tag {
    position: relative; z-index: 2;
    display: flex; align-items: center; gap: 10px;
    animation: fadeInLeft 0.8s ease 0.7s both;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 30px; padding: 6px 14px 6px 8px;
  }
  .avatar-stack { display: flex; }
  .av {
    width: 24px; height: 24px; border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.3); margin-left: -5px;
    display: flex; align-items: center; justify-content: center;
    font-size: 8px; font-weight: 700; color: white;
  }
  .av:first-child { margin-left: 0; }
  .bottom-tag p { font-size: 11px; color: rgba(255,255,255,0.85); font-family: 'Inter', sans-serif; }
  .bottom-tag strong { color: white; }

  /* ── RIGHT ── */
  .signup-right {
  flex: 1; background: white;
  display: flex; align-items: center; justify-content: center;
  padding: 2.5rem 3rem;
  position: relative; overflow: hidden;
}
  .signup-right::before {
    content: ''; position: absolute; top: -60px; right: -60px;
    width: 220px; height: 220px; border-radius: 50%;
    background: #EEF4FF; opacity: 0.6; pointer-events: none;
  }
  .signup-right::after {
    content: ''; position: absolute; bottom: -40px; left: -40px;
    width: 160px; height: 160px; border-radius: 50%;
    background: #E1F5EE; opacity: 0.5; pointer-events: none;
  }

  .form-wrap {
    width: 100%; max-width: 370px;
    animation: fadeInUp 0.6s ease 0.2s both;
    position: relative; z-index: 1;
  }

  .top-bar {
    display: flex; justify-content: space-around; align-items: center;
    margin-bottom: 22px;
  }
  .step-pills { display: flex; gap: 5px; align-items: center; }
  .pill { height: 4px; border-radius: 2px; }
  .pill-done { width: 28px; background: #1D9E75; }
  .pill-active { width: 36px; background: #185FA5; }
  .pill-next { width: 18px; background: #dde8f8; }
  .sign-in-link { font-size: 11.5px; color: #888; font-family: 'Inter', sans-serif; }
  .sign-in-link a { color: #185FA5; font-weight: 500; text-decoration: none; }
  .sign-in-link a:hover { text-decoration: underline; }

  .form-title { margin-bottom: 18px; }
  .form-title h2 { font-size: 22px; font-weight: 700; color: #0d1f3c; margin-bottom: 4px; }
  .form-title p { font-size: 12px; color: #999; font-family: 'Inter', sans-serif; }

  .google-btn {
    width: 100%; height: 42px;
    background: #f8fbff; border: 1.5px solid #d4e4f7;
    border-radius: 12px; font-size: 13px;
    font-family: 'Sora', sans-serif; font-weight: 500;
    color: #1a1a1a; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    margin-bottom: 14px; transition: all 0.2s;
  }
  .google-btn:hover {
    border-color: #185FA5; background: white;
    box-shadow: 0 4px 16px rgba(24,95,165,0.1);
    transform: translateY(-1px);
  }

  .divider {
    display: flex; align-items: center; gap: 10px; margin-bottom: 14px;
  }
  .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: #f0f4fb; }
  .divider span { font-size: 11px; color: #bbb; font-family: 'Inter', sans-serif; white-space: nowrap; }

  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .field { margin-bottom: 11px; }
  .field label {
    display: block; font-size: 10px; font-weight: 700;
    color: #185FA5; margin-bottom: 4px;
    padding: 2px 2px; 
    letter-spacing: 0.5px; text-transform: uppercase;
    text-align: left;
  }
  .field input, .field select {
    width: 100%; height: 38px;
    border: 1.5px solid #e2edf8; border-radius: 10px;
    padding: 0 12px; font-size: 12.5px;
    font-family: 'Inter', sans-serif; color: #1a1a1a;
    background: #f8fbff; outline: none;
    transition: all 0.2s; appearance: none;
    text-align: left;
  }
  .field input::placeholder { color: #b8cce0; font-size: 12px; }
  .field input:focus, .field select:focus {
    border-color: #185FA5; background: white;
    box-shadow: 0 0 0 3px rgba(24,95,165,0.08);
  }
  .field input:hover:not(:focus), .field select:hover:not(:focus) { border-color: #a8c4e8; }
  .select-wrap { position: relative; }
  .select-wrap::after {
    content: '▾'; position: absolute; right: 11px; top: 50%;
    transform: translateY(-50%); color: #185FA5; font-size: 11px; pointer-events: none;
  }
  .select-wrap select { padding-right: 26px; cursor: pointer; }

  .submit-btn {
    width: 100%; height: 44px; border: none; border-radius: 12px;
    font-size: 13.5px; font-weight: 600; font-family: 'Sora', sans-serif;
    color: white; cursor: pointer; margin-top: 4px;
    background: linear-gradient(135deg, #1D9E75 0%, #185FA5 100%);
    transition: all 0.3s; position: relative; overflow: hidden;
  }
  .submit-btn::before {
    content: ''; position: absolute; top: 0; left: -100%;
    width: 60%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s;
  }
  .submit-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(24,95,165,0.3); }
  .submit-btn:hover::before { left: 150%; }
  .submit-btn:active { transform: translateY(0); }
  .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }

  .error-msg { color: #e24b4a; font-size: 10.5px; margin-top: 3px; font-family: 'Inter', sans-serif; }

  .terms {
    text-align: center; font-size: 10px; color: #bbb;
    margin-top: 10px; line-height: 1.7; font-family: 'Inter', sans-serif;
  }
  .terms a { color: #185FA5; text-decoration: none; }
  .terms a:hover { text-decoration: underline; }

  @media (max-width: 768px) {
  .signup-outer { padding: 12px; align-items: flex-start; overflow-y: auto; }
  .signup-card { flex-direction: column; min-height: auto; border-radius: 20px; }
  .signup-left { width: 100%; padding: 1.5rem; min-height: auto; }
  .signup-left .orbit-wrap { display: none; }
  .signup-left .features { display: none; }
  .signup-left .bottom-tag { display: none; }
  .signup-right { padding: 1.5rem; overflow-y: auto; }
  .form-wrap { max-width: 100%; }
  .grid2 { grid-template-columns: 1fr; }
  html, body { overflow: auto; }
}
`;

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
      const response = await fetch(
        "https://pramyan.com/assessment/backend_test/backend/routes/signup.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password,
            class: form.class,
            board: form.board,
            parent_phone: form.parentPhone,
          }),
        },
      );

      const result = await response.json();

      console.log(result);

      if (result.success) {
        setToken(result.token);
        setRole(result.user.role);
        // Map class to test ID directly — no extra API call needed
        const classToTestId = { 8: 3, 9: 2, 10: 1 };
        const testId = classToTestId[String(form.class)] || 1;
        navigate(`/instructions/${testId}`);
      } else {
        setErrors({ api: result.message });
      }
    } catch (error) {
      console.log(error);

      alert("Server error");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <style>{styles}</style>
      <div className="signup-outer">
        <div className="signup-card">
          {/* LEFT PANEL */}
          <div className="signup-left">
            <div className="left-blob1" />
            <div className="left-blob2" />
            <div className="left-blob3" />
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
              <h2>Your success starts right here</h2>
              <p>India's smartest student assessment platform</p>
            </div>

            <div className="features">
              {[
                { icon: "⚡", text: "Instant diagnostic reports" },
                { icon: "◈", text: "Chapter-wise SWOT analysis" },
                { icon: "◎", text: "Personalised 4-week study plan" },
                { icon: "✦", text: "Updates to parents" },
              ].map((f, i) => (
                <div className="feat-item" key={i}>
                  <div className="feat-icon">{f.icon}</div>
                  {f.text}
                </div>
              ))}
            </div>

            <div className="bottom-tag">
              <div className="avatar-stack">
                {[
                  ["R", "#1D9E75"],
                  ["A", "#3a7bd5"],
                  ["K", "#0a5a45"],
                  ["S", "#2563a8"],
                ].map(([l, c], i) => (
                  <div className="av" key={i} style={{ background: c }}>
                    {l}
                  </div>
                ))}
              </div>
              <p>students joined</p>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="signup-right">
            <div className="form-wrap">
              <div className="top-bar">
                <div className="step-pills">
                  <div className="pill pill-done" />
                  <div className="pill pill-active" />
                  <div className="pill pill-next" />
                </div>
                <div className="sign-in-link">
                  Already have an account? <a href="/">Sign In</a>
                </div>
              </div>

              <div className="form-title">
                <h2>Create Account</h2>
                <p>Join Pramyan — Unlock your true potential</p>
              </div>

              <button
                className="google-btn"
                onClick={() => {
                  window.location.href =
                    "https://pramyan.com/assessment/backend_test/backend/routes/google-auth.php";
                }}>
                <svg width="16" height="16" viewBox="0 0 24 24">
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

              <div className="divider">
                <span>or sign up with email</span>
              </div>

              {errors.api && <p className="error-msg">{errors.api}</p>}

              <div className="grid2">
                <div className="field">
                  <label>Full Name</label>
                  <input
                    name="name"
                    type="text"
                    placeholder="Name"
                    value={form.name}
                    onChange={handleChange}
                  />
                  {errors.name && <p className="error-msg">{errors.name}</p>}
                </div>
                <div className="field">
                  <label>Email Address</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="you@email.com"
                    value={form.email}
                    onChange={handleChange}
                  />
                  {errors.email && <p className="error-msg">{errors.email}</p>}
                </div>
              </div>

              <div className="grid2">
                <div className="field">
                  <label>Password</label>
                  <input
                    name="password"
                    type="password"
                    placeholder="Min. 8 characters"
                    value={form.password}
                    onChange={handleChange}
                  />
                  {errors.password && (
                    <p className="error-msg">{errors.password}</p>
                  )}
                </div>
                <div className="field">
                  <label>Parent's Phone</label>
                  <input
                    name="parentPhone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={form.parentPhone}
                    onChange={handleChange}
                  />
                  {errors.parentPhone && (
                    <p className="error-msg">{errors.parentPhone}</p>
                  )}
                </div>
              </div>

              <div className="grid2">
                <div className="field">
                  <label>Class</label>
                  <div className="select-wrap">
                    <select
                      name="class"
                      value={form.class}
                      onChange={handleChange}>
                      <option value="">Select Class</option>
                      {[8, 9, 10].map((c) => (
                        <option key={c} value={c}>
                          Class {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.class && <p className="error-msg">{errors.class}</p>}
                </div>
                <div className="field">
                  <label>School Board</label>
                  <div className="select-wrap">
                    <select
                      name="board"
                      value={form.board}
                      onChange={handleChange}>
                      <option value="">Select Board</option>
                      <option value="CBSE">CBSE</option>
                      <option value="ICSE">ICSE</option>
                      <option value="State Board">State Board</option>
                    </select>
                  </div>
                  {errors.board && <p className="error-msg">{errors.board}</p>}
                </div>
              </div>

              <button
                className="submit-btn"
                onClick={handleSubmit}
                disabled={loading}>
                {loading ? "Creating Account..." : "Create My Account →"}
              </button>

              <p className="terms">
                By signing up you agree to our <a href="#">Terms of Service</a>{" "}
                and <a href="#">Privacy Policy</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
