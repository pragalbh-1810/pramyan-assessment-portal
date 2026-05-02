// Module-level state — survives across React re-renders so that
// re-creating the monitor (e.g. on dependency change) does NOT
// reset the warning counter back to 0.
let warnings = 0;
let lastViolationAt = 0;
let suppressedUntil = 0;
let cleanupCurrent = null; // ensures only one set of listeners is active

const DEBUG = true; // flip to false to silence console logs

const dbg = (...args) => {
  if (DEBUG) console.log("[tabSwitch]", ...args);
};

/**
 * Start watching for tab/window switches.
 * Idempotent — calling this twice will tear down the previous listener
 * set first, so React Strict Mode and effect re-runs don't add duplicate
 * handlers.
 *
 * The warning counter persists across calls (module scope), so even if
 * the effect re-fires due to changing deps, accumulated warnings stay.
 */
export function setupTabSwitchMonitor({
  isSubmitted,
  maxWarnings,
  onWarning,
  onMaxViolations,
}) {
  // If a previous monitor is still active, clean it up first.
  if (cleanupCurrent) {
    dbg("re-init — cleaning up previous listeners");
    cleanupCurrent();
    cleanupCurrent = null;
  }

  const registerViolation = (reason) => {
    if (isSubmitted()) {
      dbg("violation ignored — test already submitted", reason);
      return;
    }

    const now = Date.now();

    // Skip if we're inside a "suppressed" window (e.g. file picker open).
    if (now < suppressedUntil) {
      dbg("violation suppressed (file picker etc.)", reason);
      return;
    }

    // Debounce: blur + visibilitychange often fire together. Count once.
    if (now - lastViolationAt < 1200) {
      dbg("violation debounced (within 1.2s of last)", reason);
      return;
    }
    lastViolationAt = now;

    warnings += 1;
    dbg(`violation registered (${reason}). count=${warnings}/${maxWarnings}`);

    if (warnings >= maxWarnings) {
      dbg("max violations reached — auto-submitting");
      onMaxViolations();
      return;
    }

    onWarning(warnings);
  };

  const handleVisibilityChange = () => {
    if (document.hidden) {
      registerViolation("visibilitychange (hidden)");
    }
  };

  const handleWindowBlur = () => {
    registerViolation("window blur");
  };

  // Click-capture handler that suppresses violations during file picker
  // interactions. The OS file dialog steals focus and fires window.blur,
  // which would otherwise count as a tab switch.
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
      suppressedUntil = Date.now() + 30000; // 30s window for file dialog
      dbg("file picker click — suppressing violations for 30s");
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("blur", handleWindowBlur);
  document.addEventListener("click", handleSuppressClick, true);

  dbg("monitor started. current warnings:", warnings);

  cleanupCurrent = () => {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("blur", handleWindowBlur);
    document.removeEventListener("click", handleSuppressClick, true);
    dbg("listeners removed");
  };

  return cleanupCurrent;
}

/**
 * Reset the warning counter. Call this when a fresh test starts.
 */
export function resetTabSwitchWarnings() {
  warnings = 0;
  lastViolationAt = 0;
  suppressedUntil = 0;
  dbg("warnings reset to 0");
}
