export function setupTabSwitchMonitor({
  isSubmitted,
  maxWarnings,
  onWarning,
  onMaxViolations,
}) {
  let warnings = 0;
  let lastViolationAt = 0;
  let suppressedUntil = 0;

  const registerViolation = () => {
    if (isSubmitted()) return;

    const now = Date.now();
    // Skip violation if we recently triggered a suppressed action (file picker, etc.)
    if (now < suppressedUntil) return;
    if (now - lastViolationAt < 1200) return;
    lastViolationAt = now;

    warnings += 1;

    if (warnings >= maxWarnings) {
      onMaxViolations();
      return;
    }

    onWarning(warnings);
  };

  const handleVisibilityChange = () => {
    if (document.hidden) {
      registerViolation();
    }
  };

  const handleWindowBlur = () => {
    registerViolation();
  };

  // Suppress violations during native file picker / dialog interactions.
  // When user clicks a file input, the OS dialog steals focus and fires blur —
  // we don't want to flag that as a cheating attempt.
  const handleSuppressClick = (e) => {
    const target = e.target;
    if (
      target &&
      (target.type === "file" ||
        (target.tagName === "LABEL" &&
          target.querySelector &&
          target.querySelector('input[type="file"]')) ||
        target.closest?.(".upload-container"))
    ) {
      // Ignore blur/visibility events for the next 30 seconds (user may take a
      // while to pick a file from the dialog)
      suppressedUntil = Date.now() + 30000;
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("blur", handleWindowBlur);
  document.addEventListener("click", handleSuppressClick, true);

  return () => {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("blur", handleWindowBlur);
    document.removeEventListener("click", handleSuppressClick, true);
  };
}
