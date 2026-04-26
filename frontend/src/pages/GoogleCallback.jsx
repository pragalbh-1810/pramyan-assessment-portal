import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setToken, setRole } from "../utils/auth";
import { apiUrl } from "../utils/api";

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

    // Student — determine correct test, then check submission status
    const checkAndRedirect = async () => {
      try {
        // Step 1: get the test for this student's class
        const testsRes = await fetch(
          apiUrl("get-tests.php"),
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const testsData = await testsRes.json();

        if (!testsData.success || testsData.tests.length === 0) {
          navigate("/instructions/1", { replace: true });
          return;
        }

        const testId = testsData.tests[0].id;

        // Step 2: ✅ Check via get-report.php — this only succeeds if the student
        // has a submitted attempt with calculated results in the `results` table.
        // Previously used get-test-details.php which had a bug: it returned
        // is_submitted=false even for submitted tests due to query ordering issues.
        const reportRes = await fetch(
          apiUrl(`get-report.php?test_id=${testId}`),
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const reportData = await reportRes.json();

        if (reportData.success) {
          // ✅ Report exists → student submitted → show report
          navigate(`/report/${testId}`, { replace: true });
          return;
        }

        // Step 3: No report → check if test is in-progress (started but not submitted)
        const detailRes = await fetch(
          apiUrl(`get-test-details.php?test_id=${testId}`),
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const detailData = await detailRes.json();

        if (detailData.success && detailData.test.is_attempted && !detailData.test.is_submitted) {
          // In-progress test → resume
          navigate(`/test/${testId}`, { replace: true });
        } else {
          // Never started → go to instructions
          navigate(`/instructions/${testId}`, { replace: true });
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
      }}
    >
      ⏳ Signing you in with Google...
    </div>
  );
}
