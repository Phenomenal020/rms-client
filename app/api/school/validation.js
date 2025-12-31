/**
 * Validation functions for school actions
 */

/**
 * Helper to parse optional string fields
 * @param {any} value - Value to parse
 * @returns {string | null | undefined} Parsed value
 */
function parseStringValues(value) {
  if (value === undefined) return undefined; // untouched
  if (typeof value !== "string" || value.trim() === "") return null; // cleared
  return value.trim(); // valid value
}

/**
 * Validates school update data
 * @param {Object} schoolData - School data to validate
 * @param {string} schoolData.schoolName - School name (required)
 * @param {string} [schoolData.schoolAddress] - School address (optional)
 * @param {string} [schoolData.schoolMotto] - School motto (optional)
 * @param {string} [schoolData.schoolTelephone] - School telephone (optional)
 * @param {string} [schoolData.schoolEmail] - School email (optional)
 * @returns {{ isValid: boolean, error?: string, validated?: Object }}
 */
export function validateSchoolUpdate(schoolData) {
  const errors = [];

  // Validate required field: schoolName
  if (!schoolData.schoolName || typeof schoolData.schoolName !== "string" || schoolData.schoolName.trim() === "") {
    return { isValid: false, error: "School name is required" };
  }

  // Optional string fields normalisation
  const schoolAddress = parseStringValues(schoolData.schoolAddress);
  const schoolMotto = parseStringValues(schoolData.schoolMotto);
  const schoolTelephone = parseStringValues(schoolData.schoolTelephone);
  const rawSchoolEmail = parseStringValues(schoolData.schoolEmail);
  
  // Validate email if provided
  const schoolEmail =
    rawSchoolEmail === null // null means the field was cleared by the user
      ? null
      : rawSchoolEmail === undefined
      ? undefined // undefined means the field was not provided by the user
      : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawSchoolEmail)
      ? rawSchoolEmail // rawSchoolEmail is a valid email address
      : (errors.push("School email must be a valid email address"), undefined); // or set the error and return undefined

  if (errors.length > 0) {
    return { isValid: false, error: errors[0] };
  }

  return {
    isValid: true,
    validated: {
      schoolName: schoolData.schoolName.trim(),
      schoolAddress,
      schoolMotto,
      schoolTelephone,
      schoolEmail,
    },
  };
}

