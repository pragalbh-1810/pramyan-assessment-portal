import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../utils/auth.js"; // Adjust path if needed

// Extracted Save Logic
export const saveAnswersToDB = async (testId, currentAnswers, setSaveIndicator, isAutoSave = false) => {
  const token = getToken() || "test";

  const answersArray = Object.entries(currentAnswers).map(
    ([question_id, selected_option]) => ({
      question_id: parseInt(question_id),
      selected_option,
      time_on_question: 0,
    })
  );

  if (answersArray.length === 0) return null;

  if (isAutoSave && setSaveIndicator) {
    setSaveIndicator({ show: true, text: "Saving...", type: "saving" });
  }

  try {
    const saveRes = await fetch(
      "http://localhost/pramyan-assessment-portal/backend/routes/save-answers.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          test_id: parseInt(testId),
          answers: answersArray,
        }),
      }
    );
    const saveResult = await saveRes.json();

    if (isAutoSave && setSaveIndicator) {
      if (saveResult.success) {
        setSaveIndicator({ show: true, text: "Saved ✓", type: "success" });
        setTimeout(() => {
          setSaveIndicator({ show: false, text: "", type: "" });
        }, 3000);
      } else {
        setSaveIndicator({ show: false, text: "", type: "" });
        console.error("Backend refused to save:", saveResult.message);
      }
    }
    return saveResult;
  } catch (error) {
    if (isAutoSave && setSaveIndicator) setSaveIndicator({ show: false, text: "", type: "" });
    console.error("Network error during save:", error);
    return null;
  }
};

// Custom Hook to handle Auto-Save and Submissions
export function useAutoSubmit({ testId, answersRef, submitted, setSubmitted, setSaveIndicator, timerRef }) {
  const navigate = useNavigate();

  const submitTest = async (isAuto = false) => {
    const token = getToken() || "test";
    try {
      const saveResult = await saveAnswersToDB(testId, answersRef.current, setSaveIndicator, false);

      if (saveResult && saveResult.success) {
        await fetch(
          "http://localhost/pramyan-assessment-portal/backend/routes/submit-test.php",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              student_test_id: saveResult.student_test_id,
            }),
          }
        );
      }
    } catch (err) {
      console.error("Submit failed:", err);
    }
    navigate(`/report/${testId}`);
  };

  const handleAutoSubmit = useCallback(() => {
    if (!submitted) {
      setSubmitted(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      submitTest(true);
    }
  }, [submitted, setSubmitted, timerRef]);

  // 30-Second Auto-Save Interval
  useEffect(() => {
    if (submitted) return;

    const intervalId = setInterval(() => {
      saveAnswersToDB(testId, answersRef.current, setSaveIndicator, true);
    }, 30000); 

    return () => clearInterval(intervalId);
  }, [submitted, testId, answersRef, setSaveIndicator]);

  return { handleAutoSubmit, submitTest };
}