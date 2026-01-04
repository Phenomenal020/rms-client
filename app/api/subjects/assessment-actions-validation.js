// Shared validation helpers for assessment structure updates

export const ASSESSMENT_VALIDATION_ERRORS = [
  "Please set up your school first before adding subjects",
  "Please set up your academic term first before adding subjects",
  "School not found",
  "Academic term not found",
  "User unauthorised",
];

// Validate assessment structure payload (array of { type, percentage, order })
function validateAssessmentStructureInput(assessmentStructure) {
  if (!assessmentStructure || !Array.isArray(assessmentStructure)) {
    return { error: "Assessment structure must be an array" };
  }

  if (assessmentStructure.length === 0) {
    return { error: "At least one assessment component is required" };
  }

  let total = 0;
  const orders = new Set();

  for (let i = 0; i < assessmentStructure.length; i++) {
    const assess = assessmentStructure[i];

    if (!assess || typeof assess !== "object") {
      return { error: `Assessment ${i + 1} is invalid` };
    }

    if (!assess.type || typeof assess.type !== "string" || assess.type.trim() === "") {
      return { error: `Assessment ${i + 1}: Type is required` };
    }

    const percentageNum = Number.parseFloat(assess.percentage);
    if (Number.isNaN(percentageNum) || percentageNum < 0 || percentageNum > 100) {
      return { error: `Assessment ${i + 1}: Percentage must be between 0 and 100` };
    }
    total += percentageNum;

    const orderNum = Number(assess.order);
    if (!Number.isInteger(orderNum) || orderNum < 1) {
      return { error: `Assessment ${i + 1}: Order must be a positive integer` };
    }

    if (orders.has(orderNum)) {
      return { error: `Duplicate order number detected: ${orderNum}` };
    }
    orders.add(orderNum);
  }

  if (total !== 100) {
    return { error: "Assessment percentages must total exactly 100%" };
  }

  return { error: null };
}

// Maintain legacy name used by assessment-actions.js
export function validateSubjectsUpdate(data) {
  
  if (!data || typeof data !== "object") {
    return { isValid: false, error: "Invalid payload" };
  }

  const { subjects, assessmentStructure } = data;

  // Ensure we have at least one array to work with
  if (!Array.isArray(subjects) && !Array.isArray(assessmentStructure)) {
    return { isValid: false, error: "No data provided to update" };
  }

  // Validate assessment structure if provided
  if (Array.isArray(assessmentStructure)) {
    const { error } = validateAssessmentStructureInput(assessmentStructure);
    if (error) {
      return { isValid: false, error };
    }
  }

  // Basic subject validation (only if subjects array is provided)
  if (Array.isArray(subjects)) {
    if (subjects.length === 0) {
      return { isValid: false, error: "At least one subject is required" };
    }

    for (let i = 0; i < subjects.length; i++) {
      const subject = subjects[i];
      if (!subject || typeof subject !== "object") {
        return { isValid: false, error: `Subject ${i + 1} is invalid` };
      }
      if (!subject.name || typeof subject.name !== "string" || subject.name.trim() === "") {
        return { isValid: false, error: `Subject ${i + 1}: Name is required` };
      }
    }
  }

  return { isValid: true, error: null };
}