/**
 * Validation functions for profile actions
 */

/**
 * Validates profile update data
 * @param {Object} profileData - Profile data to validate
 * @param {string} profileData.firstName - User's first name
 * @param {string} profileData.lastName - User's last name
 * @returns {{ isValid: boolean, error?: string }}
 */
export function validateProfileUpdate(profileData) {
  const { firstName, lastName } = profileData;

  // Validate required fields - firstName is required
  if (!firstName || firstName.trim() === "") {
    return { isValid: false, error: "First name is required" };
  }

  // Validate required fields - lastName is required
  if (!lastName || lastName.trim() === "") {
    return { isValid: false, error: "Last name is required" };
  }

  return { isValid: true };
}

