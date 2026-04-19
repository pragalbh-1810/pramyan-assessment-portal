import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpeg";
import { getToken, removeToken } from "../utils/auth";

const BASE = "http://localhost/pramyan-assessment-portal/backend/routes";
function decodeJWT(t) {
  try {
    return JSON.parse(atob(t.split(".")[1]));
  } catch {
    return null;
  }
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
html,body{min-height:100%;background:#EEF4FF;font-family:'Sora',sans-serif;}

@keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
@keyframes slideIn { from{opacity:0;transform:scale(.96)} to{opacity:1;transform:scale(1)} }
@keyframes shake   { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-5px)} 75%{transform:translateX(5px)} }
@keyframes blink   { 0%,100%{opacity:1} 50%{opacity:.3} }

/* NAV */
.ap-nav {
  background:linear-gradient(135deg,#1D9E75 0%,#185FA5 100%);
  height:64px; margin:10px 16px 0; border-radius:16px;
  padding:0 26px; display:flex; align-items:center; justify-content:space-between;
  box-shadow:0 6px 28px rgba(24,95,165,.22);
  position:sticky; top:10px; z-index:100;
}
.nav-brand { display:flex; align-items:center; gap:10px; }
.nav-logo  { height:34px; border-radius:7px; background:#fff; padding:3px; }
.nav-title { font-size:14px; font-weight:700; color:#fff; }
.nav-chip  { background:rgba(255,255,255,.18); border:1px solid rgba(255,255,255,.28); border-radius:20px; padding:3px 10px; font-size:10px; font-weight:700; color:#fff; letter-spacing:.5px; font-family:'DM Sans',sans-serif; }
.nav-right { display:flex; align-items:center; gap:10px; }
.btn-ghost { background:rgba(255,255,255,.15); border:1px solid rgba(255,255,255,.28); color:#fff; border-radius:9px; padding:7px 15px; font-size:12px; font-weight:600; font-family:'Sora',sans-serif; cursor:pointer; transition:.2s; }
.btn-ghost:hover { background:rgba(255,255,255,.28); }
.btn-white { background:#fff; color:#185FA5; border:none; border-radius:9px; padding:7px 16px; font-size:12px; font-weight:700; font-family:'Sora',sans-serif; cursor:pointer; transition:.2s; }
.btn-white:hover { transform:translateY(-1px); box-shadow:0 4px 12px rgba(0,0,0,.1); }

/* BODY */
.ap-body { max-width:860px; margin:0 auto; padding:28px 18px 60px; }
.eyebrow { font-size:10px; font-weight:700; color:#185FA5; text-transform:uppercase; letter-spacing:.7px; margin-bottom:10px; font-family:'DM Sans',sans-serif; }

/* STATS */
.ap-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:24px; animation:fadeUp .4s ease both; }
.ap-stat  { background:#fff; border-radius:16px; padding:20px; text-align:center; box-shadow:0 2px 14px rgba(24,95,165,.06); border:1.5px solid #f0f4fb; }
.aps-ico  { font-size:26px; margin-bottom:8px; }
.aps-val  { font-size:24px; font-weight:800; color:#0d1f3c; margin-bottom:3px; }
.aps-lbl  { font-size:10px; color:#aaa; text-transform:uppercase; letter-spacing:.4px; font-family:'DM Sans',sans-serif; }

/* ADD CARD */
.add-card { background:#fff; border-radius:20px; padding:26px; margin-bottom:24px; box-shadow:0 2px 18px rgba(24,95,165,.07); animation:fadeUp .4s ease .07s both; }
.add-card h2 { font-size:16px; font-weight:700; color:#0d1f3c; margin-bottom:4px; }
.add-card p  { font-size:12px; color:#aaa; font-family:'DM Sans',sans-serif; margin-bottom:20px; }
.form-grid  { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:16px; }
.f-field    { display:flex; flex-direction:column; gap:5px; }
.f-label    { font-size:10px; font-weight:700; color:#555; text-transform:uppercase; letter-spacing:.5px; font-family:'DM Sans',sans-serif; }
.f-input    { height:46px; border:1.5px solid #e2edf8; border-radius:12px; padding:0 16px; font-size:13px; font-family:'Sora',sans-serif; color:#1a1a1a; background:#f8fbff; outline:none; transition:.2s; }
.f-input:focus { border-color:#185FA5; background:#fff; box-shadow:0 0 0 3px rgba(24,95,165,.08); }
.f-input.err   { border-color:#e24b4a; animation:shake .3s ease; }
.add-btn {
  width:100%; height:48px; border:none; border-radius:13px;
  background:linear-gradient(135deg,#1D9E75,#185FA5);
  color:#fff; font-size:14px; font-weight:700; font-family:'Sora',sans-serif;
  cursor:pointer; transition:.2s;
}
.add-btn:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 8px 24px rgba(24,95,165,.28); }
.add-btn:disabled { opacity:.6; cursor:not-allowed; }

/* Messages */
.msg-ok  { background:#e6f7f1; border:1.5px solid #a7e6cc; border-radius:12px; padding:12px 16px; font-size:13px; color:#1D9E75; font-family:'DM Sans',sans-serif; margin-bottom:14px; animation:slideIn .3s ease; }
.msg-err { background:#fff0f0; border:1.5px solid #ffd4d4; border-radius:12px; padding:12px 16px; font-size:13px; color:#e24b4a; font-family:'DM Sans',sans-serif; margin-bottom:14px; animation:slideIn .3s ease; }

/* LIST */
.list-card { background:#fff; border-radius:20px; overflow:hidden; box-shadow:0 2px 18px rgba(24,95,165,.07); animation:fadeUp .4s ease .14s both; }
.list-head { display:grid; grid-template-columns:2fr 2fr 1fr; padding:12px 22px; background:#f8fbff; border-bottom:1.5px solid #f0f4fb; }
.list-th   { font-size:10px; font-weight:700; color:#aaa; text-transform:uppercase; letter-spacing:.5px; font-family:'DM Sans',sans-serif; }
.t-row { display:grid; grid-template-columns:2fr 2fr 1fr; padding:14px 22px; border-bottom:1px solid #f5f8ff; align-items:center; transition:.15s; }
.t-row:last-child { border-bottom:none; }
.t-row:hover { background:#fafcff; }
.t-info  { display:flex; align-items:center; gap:12px; }
.t-avi   { width:38px; height:38px; border-radius:50%; background:linear-gradient(135deg,#185FA5,#1D9E75); display:flex; align-items:center; justify-content:center; color:#fff; font-size:15px; font-weight:700; flex-shrink:0; }
.t-name  { font-size:13px; font-weight:600; color:#0d1f3c; margin-bottom:1px; }
.t-date  { font-size:11px; color:#aaa; font-family:'DM Sans',sans-serif; }
.t-email { font-size:12px; color:#777; font-family:'DM Sans',sans-serif; }
.t-badge { background:#EEF4FF; border:1px solid #d4e4f7; border-radius:20px; padding:4px 12px; font-size:11px; font-weight:700; color:#185FA5; font-family:'DM Sans',sans-serif; }
.del-btn { background:#fff0f0; border:1.5px solid #ffd4d4; color:#e24b4a; border-radius:9px; padding:7px 14px; font-size:12px; font-weight:700; font-family:'Sora',sans-serif; cursor:pointer; transition:.2s; }
.del-btn:hover { background:#e24b4a; color:#fff; border-color:#e24b4a; }

/* EMPTY */
.empty { padding:48px 24px; text-align:center; border:1.5px dashed #d4e4f7; border-radius:16px; background:#fafcff; }
.empty-ico { font-size:36px; margin-bottom:12px; }
.empty h3  { font-size:14px; font-weight:700; color:#0d1f3c; margin-bottom:5px; }
.empty p   { font-size:12px; color:#aaa; font-family:'DM Sans',sans-serif; }

/* LOADING */
.loading { display:flex; gap:7px; justify-content:center; padding:40px; }
.loading span { width:9px; height:9px; border-radius:50%; background:#185FA5; animation:blink 1.2s ease infinite; }
.loading span:nth-child(2){animation-delay:.2s;} .loading span:nth-child(3){animation-delay:.4s;}

/* MODAL */
.modal-bg  { position:fixed; inset:0; background:rgba(13,31,60,.5); display:flex; align-items:center; justify-content:center; z-index:999; }
.modal-box { background:#fff; border-radius:20px; padding:30px 28px; max-width:360px; width:90%; text-align:center; box-shadow:0 20px 60px rgba(13,31,60,.2); animation:slideIn .25s ease; }
.modal-ico { font-size:36px; margin-bottom:12px; }
.modal-title { font-size:16px; font-weight:700; color:#0d1f3c; margin-bottom:8px; }
.modal-text  { font-size:13px; color:#888; font-family:'DM Sans',sans-serif; line-height:1.6; margin-bottom:22px; }
.modal-btns  { display:flex; gap:10px; }
.modal-cancel { flex:1; height:44px; border:1.5px solid #e2edf8; border-radius:11px; background:#fff; color:#888; font-size:13px; font-weight:600; font-family:'Sora',sans-serif; cursor:pointer; transition:.2s; }
.modal-cancel:hover { border-color:#ccc; color:#555; }
.modal-delete { flex:1; height:44px; border:none; border-radius:11px; background:linear-gradient(135deg,#e24b4a,#c43a39); color:#fff; font-size:13px; font-weight:700; font-family:'Sora',sans-serif; cursor:pointer; transition:.2s; }
.modal-delete:hover { transform:translateY(-1px); box-shadow:0 4px 14px rgba(226,75,74,.3); }

@media(max-width:600px){
  .form-grid{grid-template-columns:1fr;}
  .ap-stats{grid-template-columns:1fr 1fr;}
  .list-head,.t-row{grid-template-columns:1fr;gap:6px;padding:12px 16px;}
}
`;

export default function AdminPanel() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [formErr, setFormErr] = useState({});
  const [adding, setAdding] = useState(false);
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");
  const [delTarget, setDelTarget] = useState(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/");
      return;
    }
    const dec = decodeJWT(token);
    if (!dec || dec.role !== "admin") {
      navigate("/");
      return;
    }
    setAdmin(dec);
    loadTeachers(token);
  }, []);

  const loadTeachers = async (token) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/manage-teachers.php`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setTeachers(data.teachers);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = true;
    if (!form.email.includes("@")) e.email = true;
    if (form.password.length < 6) e.password = true;
    setFormErr(e);
    return Object.keys(e).length === 0;
  };

  const handleAdd = async () => {
    setOk("");
    setErr("");
    if (!validate()) return;
    setAdding(true);
    try {
      const res = await fetch(`${BASE}/add-teacher.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setOk(`✅ Teacher "${form.name}" added successfully!`);
        setForm({ name: "", email: "", password: "" });
        loadTeachers(getToken());
      } else {
        setErr(`❌ ${data.message || "Failed to add teacher"}`);
      }
    } catch {
      setErr("❌ Network error. Check XAMPP is running.");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async () => {
    if (!delTarget) return;
    try {
      const res = await fetch(`${BASE}/manage-teachers.php`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ teacher_id: delTarget.id }),
      });
      const data = await res.json();
      if (data.success) {
        setOk(`✅ Teacher "${delTarget.name}" removed.`);
        setTeachers((prev) => prev.filter((t) => t.id !== delTarget.id));
      } else {
        setErr(`❌ ${data.message}`);
      }
    } catch {
      setErr("❌ Network error.");
    } finally {
      setDelTarget(null);
    }
  };

  return (
    <>
      <style>{css}</style>
      <div style={{ minHeight: "100vh", background: "#EEF4FF" }}>
        {/* NAV */}
        <nav className="ap-nav">
          <div className="nav-brand">
            <img src={logo} className="nav-logo" alt="logo" />
            <span className="nav-title">Pramyan Education</span>
            <span className="nav-chip">ADMIN</span>
          </div>
          <div className="nav-right">
            <button className="btn-ghost" onClick={() => navigate("/teacher")}>
              Teacher View
            </button>
            <button
              className="btn-white"
              onClick={() => {
                removeToken();
                navigate("/");
              }}>
              Logout
            </button>
          </div>
        </nav>

        <div className="ap-body">
          {/* STATS */}
          <div className="eyebrow">📊 Overview</div>
          <div className="ap-stats">
            <div className="ap-stat">
              <div className="aps-ico">👨‍🏫</div>
              <div className="aps-val">{teachers.length}</div>
              <div className="aps-lbl">Teachers</div>
            </div>
            <div className="ap-stat">
              <div className="aps-ico">👑</div>
              <div className="aps-val" style={{ fontSize: 16 }}>
                {admin?.name?.split(" ")[0] || "Admin"}
              </div>
              <div className="aps-lbl">Admin</div>
            </div>
            <div className="ap-stat">
              <div className="aps-ico">🏫</div>
              <div className="aps-val" style={{ fontSize: 16 }}>
                Pramyan
              </div>
              <div className="aps-lbl">Institution</div>
            </div>
          </div>

          {/* ADD TEACHER */}
          <div className="eyebrow">➕ Add New Teacher</div>
          <div className="add-card">
            <h2>Create Teacher Account</h2>
            <p>
              Teachers can log in and view full diagnostic reports for all
              students.
            </p>

            {ok && <div className="msg-ok">{ok}</div>}
            {err && <div className="msg-err">{err}</div>}

            <div className="form-grid">
              <div className="f-field">
                <label className="f-label">Full Name *</label>
                <input
                  className={`f-input${formErr.name ? " err" : ""}`}
                  placeholder="e.g. Priya Sharma"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                />
              </div>
              <div className="f-field">
                <label className="f-label">Email Address *</label>
                <input
                  className={`f-input${formErr.email ? " err" : ""}`}
                  type="email"
                  placeholder="teacher@pramyan.com"
                  value={form.email}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, email: e.target.value }))
                  }
                />
              </div>
              <div className="f-field">
                <label className="f-label">Password * (min 6 chars)</label>
                <input
                  className={`f-input${formErr.password ? " err" : ""}`}
                  type="password"
                  placeholder="Set a password"
                  value={form.password}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, password: e.target.value }))
                  }
                />
              </div>
            </div>
            <button className="add-btn" onClick={handleAdd} disabled={adding}>
              {adding ? "⏳ Adding..." : "➕ Add Teacher"}
            </button>
          </div>

          {/* TEACHER LIST */}
          <div className="eyebrow">👨‍🏫 Manage Teachers ({teachers.length})</div>
          {loading ? (
            <div className="loading">
              <span />
              <span />
              <span />
            </div>
          ) : teachers.length === 0 ? (
            <div className="empty">
              <div className="empty-ico">👨‍🏫</div>
              <h3>No teachers yet</h3>
              <p>Use the form above to add your first teacher account.</p>
            </div>
          ) : (
            <div className="list-card">
              <div className="list-head">
                <div className="list-th">Teacher</div>
                <div className="list-th">Email</div>
                <div className="list-th">Action</div>
              </div>
              {teachers.map((t) => (
                <div className="t-row" key={t.id}>
                  <div className="t-info">
                    <div className="t-avi">{t.name[0]?.toUpperCase()}</div>
                    <div>
                      <div className="t-name">{t.name}</div>
                      <div className="t-date">
                        {t.created_at
                          ? `Added ${new Date(t.created_at).toLocaleDateString("en-IN")}`
                          : "Active"}
                      </div>
                    </div>
                  </div>
                  <div className="t-email">{t.email}</div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}>
                    <span className="t-badge">Teacher</span>
                    <button className="del-btn" onClick={() => setDelTarget(t)}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CONFIRM DELETE MODAL */}
      {delTarget && (
        <div className="modal-bg">
          <div className="modal-box">
            <div className="modal-ico">⚠️</div>
            <div className="modal-title">Remove Teacher?</div>
            <div className="modal-text">
              Remove <strong>{delTarget.name}</strong>? They will lose access
              immediately.
            </div>
            <div className="modal-btns">
              <button
                className="modal-cancel"
                onClick={() => setDelTarget(null)}>
                Cancel
              </button>
              <button className="modal-delete" onClick={handleDelete}>
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
