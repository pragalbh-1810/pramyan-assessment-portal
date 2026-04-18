import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setToken, setRole } from "../utils/auth";

export default function GoogleCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const role = params.get("role");

    if (!token) {
      navigate("/signup", { replace: true });
      return;
    }

    setToken(token);
    setRole(role || "student");

    if (role === "teacher") {
      navigate("/teacher", { replace: true });
      return;
    }
    if (role === "admin") {
      navigate("/admin", { replace: true });
      return;
    }

    // Student — fetch their test and check if already submitted
    const checkAndRedirect = async () => {
      try {
        const testsRes = await fetch(
          "http://localhost/pramyan-assessment-portal/backend/routes/get-tests.php",
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const testsData = await testsRes.json();

        if (testsData.success && testsData.tests.length > 0) {
          const testId = testsData.tests[0].id;
          const detailRes = await fetch(
            `http://localhost/pramyan-assessment-portal/backend/routes/get-test-details.php?test_id=${testId}`,
            { headers: { Authorization: `Bearer ${token}` } },
          );
          const detailData = await detailRes.json();

          if (detailData.success && detailData.test.is_submitted) {
            // Old user already submitted → go to report
            navigate(`/report/${testId}`, { replace: true });
          } else {
            // Not submitted yet → go to instructions
            navigate(`/instructions/${testId}`, { replace: true });
          }
        } else {
          navigate("/instructions/1", { replace: true });
        }
      } catch {
        navigate("/instructions/1", { replace: true });
      }
    };

    checkAndRedirect();
  }, []);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        fontFamily: "Sora, sans-serif",
        color: "#185FA5",
        fontSize: "16px",
        background: "#EEF4FF",
      }}>
      ⏳ Signing you in with Google...
    </div>
  );
}
