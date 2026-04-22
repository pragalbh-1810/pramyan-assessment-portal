import { getToken } from "./auth";
import { apiUrl } from "./api";

/**
 * Uploads a file for a specific student test attempt
 * @param {File} file - The file object from the input
 * @param {number|string} testId - The ID of the current test (tests table id)
 * @returns {Promise<Object>} - API response
 */
export const uploadWorkingSheet = async (file, testId) => {
  if (!file || !testId) {
    return { success: false, message: "Missing file or test ID" };
  }

  const formData = new FormData();
  formData.append("working_sheet", file);
  // Backend derives student_test_id from this (and the auth user_id)
  formData.append("test_id", testId);

  try {
    const token = getToken();
    const response = await fetch(
      apiUrl("upload.php"),
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      },
    );

    const result = await response.json().catch(() => null);
    if (!response.ok) {
      return (
        result || {
          success: false,
          message: `Upload failed (${response.status})`,
        }
      );
    }
    return result;
  } catch (error) {
    console.error("Upload error:", error);
    return { success: false, message: "Network error during upload" };
  }
};
