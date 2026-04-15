export function setupTabSwitchMonitor({
  isSubmitted,
  maxWarnings,
  onWarning,
  onMaxViolations,
}) {
  let warnings = 0;
  let lastViolationAt = 0;

  const registerViolation = () => {
    if (isSubmitted()) return;

    const now = Date.now();
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

  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("blur", handleWindowBlur);

  return () => {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("blur", handleWindowBlur);
  };
}
