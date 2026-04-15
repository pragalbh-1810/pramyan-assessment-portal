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
        // NEW: If backend rejects it, hide the saving indicator and log the error
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