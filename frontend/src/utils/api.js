/**
 * Single source of truth for the backend API base URL.
 * Set VITE_API_BASE_URL in frontend/.env to override.
 *
 * Local  : VITE_API_BASE_URL=http://localhost/pramyan-assessment-portal/backend/routes
 * Prod   : VITE_API_BASE_URL=https://pramyan.com/assessment/backend_test/backend/routes
 */
export const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost/pramyan-assessment-portal/backend/routes";

/**
 * Convenience helper — builds a full route URL.
 * @param {string} route  e.g. "get-tests.php" or "/get-tests.php"
 * @returns {string}
 */
export const apiUrl = (route) =>
  `${API_BASE.replace(/\/$/, "")}/${route.replace(/^\//, "")}`;
