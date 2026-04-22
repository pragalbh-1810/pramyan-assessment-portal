import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpeg";
import { getToken, removeToken } from "../utils/auth";
import { apiUrl } from "../utils/api";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=Inter:wght@400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  html, body { height: 100%; margin: 0; background: #EEF4FF; font-family: 'Sora', sans-serif; }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .dash-outer {
    min-height: 100vh;
    background: #EEF4FF;
  }

  /* ── NAVBAR ── */
  .dash-nav {
    background: white;
    padding: 0 32px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 2px 12px rgba(24,95,165,0.08);
    position: sticky;
    top: 0;
    z-index: 100;
  }
  .nav-logo {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .nav-logo img {
    height: 36px;
    border-radius: 8px;
  }
  .nav-right {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .nav-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #1D9E75, #185FA5);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
  }
  .nav-name {
    font-size: 13px;
    font-weight: 600;
    color: #0d1f3c;
  }
  .logout-btn {
    background: none;
    border: 1.5px solid #e2edf8;
    border-radius: 8px;
    padding: 6px 12px;
    font-size: 12px;
    font-family: 'Sora', sans-serif;
    color: #888;
    cursor: pointer;
    transition: all 0.2s;
  }
  .logout-btn:hover {
    border-color: #e24b4a;
    color: #e24b4a;
  }

  /* ── MAIN ── */
  .dash-main {
    max-width: 900px;
    margin: 0 auto;
    padding: 36px 24px;
    animation: fadeIn 0.5s ease both;
  }

  /* ── GREETING ── */
  .greeting {
    margin-bottom: 32px;
    animation: fadeInUp 0.5s ease both;
  }
  .greeting h1 {
    font-size: 26px;
    font-weight: 700;
    color: #0d1f3c;
    margin-bottom: 4px;
  }
  .greeting h1 span {
    background: linear-gradient(135deg, #1D9E75, #185FA5);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .greeting p {
    font-size: 13px;
    color: #888;
    font-family: 'Inter', sans-serif;
  }

  /* ── STATS ROW ── */
  .stats-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 32px;
    animation: fadeInUp 0.5s ease 0.1s both;
  }
  .stat-card {
    background: white;
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 2px 12px rgba(24,95,165,0.06);
    border: 1.5px solid #f0f4fb;
  }
  .stat-icon {
    font-size: 22px;
    margin-bottom: 10px;
  }
  .stat-value {
    font-size: 24px;
    font-weight: 700;
    color: #0d1f3c;
    margin-bottom: 2px;
  }
  .stat-label {
    font-size: 11px;
    color: #999;
    font-family: 'Inter', sans-serif;
  }

  /* ── SECTION TITLE ── */
  .section-title {
    font-size: 16px;
    font-weight: 700;
    color: #0d1f3c;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .section-title span {
    font-size: 11px;
    font-weight: 500;
    color: #888;
    font-family: 'Inter', sans-serif;
  }

  /* ── TEST CARDS ── */
  .tests-grid {
    display: flex;
    flex-direction: column;
    gap: 14px;
    animation: fadeInUp 0.5s ease 0.2s both;
  }
  .test-card {
    background: white;
    border-radius: 18px;
    padding: 22px 24px;
    box-shadow: 0 2px 16px rgba(24,95,165,0.07);
    border: 1.5px solid #f0f4fb;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    transition: all 0.25s;
  }
  .test-card:hover {
    box-shadow: 0 8px 28px rgba(24,95,165,0.12);
    transform: translateY(-2px);
    border-color: #d4e4f7;
  }
  .test-left {
    display: flex;
    align-items: center;
    gap: 16px;
    flex: 1;
  }
  .test-icon {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    background: linear-gradient(135deg, #EEF4FF, #dce9f8);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    flex-shrink: 0;
  }
  .test-info h3 {
    font-size: 15px;
    font-weight: 600;
    color: #0d1f3c;
    margin-bottom: 6px;
  }
  .test-tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .tag {
    font-size: 11px;
    font-family: 'Inter', sans-serif;
    padding: 3px 10px;
    border-radius: 20px;
    font-weight: 500;
  }
  .tag-blue {
    background: #EEF4FF;
    color: #185FA5;
  }
  .tag-green {
    background: #e6f7f1;
    color: #1D9E75;
  }
  .tag-orange {
    background: #fff4e6;
    color: #e07b2a;
  }
  .start-btn {
    background: linear-gradient(135deg, #1D9E75, #185FA5);
    color: white;
    border: none;
    border-radius: 12px;
    padding: 10px 22px;
    font-size: 13px;
    font-weight: 600;
    font-family: 'Sora', sans-serif;
    cursor: pointer;
    transition: all 0.25s;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .start-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(24,95,165,0.25);
  }

  /* ── EMPTY STATE ── */
  .empty-state {
    background: white;
    border-radius: 18px;
    padding: 48px 24px;
    text-align: center;
    border: 1.5px dashed #d4e4f7;
    animation: fadeInUp 0.5s ease 0.2s both;
  }
  .empty-state .empty-icon {
    font-size: 40px;
    margin-bottom: 14px;
  }
  .empty-state h3 {
    font-size: 16px;
    font-weight: 600;
    color: #0d1f3c;
    margin-bottom: 6px;
  }
  .empty-state p {
    font-size: 12px;
    color: #999;
    font-family: 'Inter', sans-serif;
  }

  /* ── LOADING ── */
  .loading-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 48px;
  }
  .loading-dots {
    display: flex;
    gap: 6px;
  }
  .loading-dots span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #185FA5;
    animation: pulse 1.2s ease infinite;
  }
  .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
  .loading-dots span:nth-child(3) { animation-delay: 0.4s; }
  .loading-text {
    font-size: 13px;
    color: #888;
    font-family: 'Inter', sans-serif;
  }

  /* ── ERROR ── */
  .error-banner {
    background: #fff0f0;
    border: 1.5px solid #ffd4d4;
    border-radius: 12px;
    padding: 14px 18px;
    font-size: 13px;
    color: #e24b4a;
    font-family: 'Inter', sans-serif;
    margin-bottom: 20px;
  }

  @media (max-width: 768px) {
    .dash-nav { padding: 0 16px; }
    .dash-main { padding: 20px 16px; }
    .stats-row { grid-template-columns: 1fr 1fr; }
    .test-card { flex-direction: column; align-items: flex-start; }
    .start-btn { width: 100%; text-align: center; }
    .greeting h1 { font-size: 20px; }
  }
`;

// Helper to decode JWT and get user info
function decodeToken(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = getToken();

    // // If no token redirect to login
    // if (!token) {
    //   navigate("/");
    //   return;
    // }

    // Decode token to get user info
    const decoded = decodeToken(token);
    if (decoded) setUser(decoded);

    // Fetch tests for this student
    fetchTests(token);
  }, []);

  const fetchTests = async (token) => {
    try {
      const response = await fetch(
        apiUrl("get-tests.php"),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const result = await response.json();
      if (result.success) {
        setTests(result.tests);
      } else {
        setError(result.message || "Failed to load tests");
      }
    } catch (err) {
      setError("Could not connect to server. Make sure XAMPP is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    removeToken();
    localStorage.removeItem("role");
    navigate("/");
  };

  const handleStartTest = (testId) => {
    navigate(`/instructions/${testId}`);
  };

  const getInitials = (name) => {
    if (!name) return "S";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="dash-outer">
        {/* NAVBAR */}
        <nav className="dash-nav">
          <div className="nav-logo">
            <img src={logo} alt="Pramyan" />
          </div>
          <div className="nav-right">
            <div className="nav-avatar">
              {getInitials(user?.name || user?.email)}
            </div>
            <span className="nav-name">
              {user?.name || user?.email || "Student"}
            </span>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </nav>

        {/* MAIN CONTENT */}
        <div className="dash-main">
          {/* GREETING */}
          <div className="greeting">
            <h1>
              Hello, <span>{user?.name?.split(" ")[0] || "Student"}</span> 👋
            </h1>
            <p>Here are your assigned tests. Good luck!</p>
          </div>

          {/* STATS */}
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-icon">📋</div>
              <div className="stat-value">{tests.length}</div>
              <div className="stat-label">Tests Assigned</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-value">Class {user?.class || "-"}</div>
              <div className="stat-label">Your Class</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⚡</div>
              <div className="stat-value">0</div>
              <div className="stat-label">Tests Completed</div>
            </div>
          </div>

          {/* TESTS SECTION */}
          <div className="section-title">
            📝 Your Tests <span>Click Start Test to begin</span>
          </div>

          {/* ERROR */}
          {error && <div className="error-banner">⚠️ {error}</div>}

          {/* LOADING */}
          {loading && (
            <div className="loading-wrap">
              <div className="loading-dots">
                <span />
                <span />
                <span />
              </div>
              <p className="loading-text">Loading your tests...</p>
            </div>
          )}

          {/* TESTS LIST */}
          {!loading && !error && (
            <div className="tests-grid">
              {tests.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📭</div>
                  <h3>No tests assigned yet</h3>
                  <p>
                    Your teacher hasn't assigned any tests for your class yet.
                    Check back later!
                  </p>
                </div>
              ) : (
                tests.map((test) => (
                  <div className="test-card" key={test.id}>
                    <div className="test-left">
                      <div className="test-icon">📝</div>
                      <div className="test-info">
                        <h3>{test.name}</h3>
                        <div className="test-tags">
                          <span className="tag tag-blue">
                            Class {test.class}
                          </span>
                          <span className="tag tag-green">
                            ⏱ {test.duration_mins} mins
                          </span>
                          {test.total_questions && (
                            <span className="tag tag-orange">
                              {test.total_questions} Questions
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      className="start-btn"
                      onClick={() => handleStartTest(test.id)}>
                      Start Test →
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
