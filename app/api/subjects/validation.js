/**
 * Validation functions for subjects actions
 */

/**
 * Validates subjects update data
 * @param {Object} data - Subjects data to validate
 * @param {Array} data.subjects - Array of subject objects
 * @param {Array} data.assessmentStructure - Array of assessment structure objects
 * @returns {{ isValid: boolean, error?: string }}
 */
export function validateSubjectsUpdate(data) {
  const { subjects, assessmentStructure } = data;

  // Validate subjects array
  if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
    return { isValid: false, error: "At least one subject is required" };
  }

  // Validate each subject
  for (let i = 0; i < subjects.length; i++) {
    const subject = subjects[i];
    if (!subject || typeof subject !== "object") {
      return { isValid: false, error: `Subject ${i + 1} is invalid` };
    }
    if (!subject.name || typeof subject.name !== "string" || subject.name.trim() === "") {
      return { isValid: false, error: `Subject ${i + 1}: Name is required` };
    }
  }

  // Validate assessment structure array
  if (!assessmentStructure || !Array.isArray(assessmentStructure) || assessmentStructure.length === 0) {
    return { isValid: false, error: "At least one assessment component is required" };
  }

  // Validate each assessment structure entry
  for (let i = 0; i < assessmentStructure.length; i++) {
    const assess = assessmentStructure[i];
    if (!assess || typeof assess !== "object") {
      return { isValid: false, error: `Assessment component ${i + 1} is invalid` };
    }

    // Validate type
    if (!assess.type || typeof assess.type !== "string" || assess.type.trim() === "") {
      return { isValid: false, error: `Assessment component ${i + 1}: Type is required` };
    }

    // Validate percentage
    const percentage = parseFloat(assess.percentage);
    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
      return { isValid: false, error: `Assessment component ${i + 1}: Percentage must be between 0 and 100` };
    }

    // Validate order
    const order = Number(assess.order);
    if (isNaN(order) || order < 1 || !Number.isInteger(order)) {
      return { isValid: false, error: `Assessment component ${i + 1}: Order must be a positive integer` };
    }
  }

  // Validate assessment structure totals 100%
  const totalPercentage = assessmentStructure.reduce(
    (sum, a) => sum + (parseFloat(a.percentage) || 0),
    0
  );

  if (Math.abs(totalPercentage - 100) > 0.01) { // Use small epsilon for floating point comparison
    return { isValid: false, error: "Assessment percentages must total exactly 100%" };
  }

  // Check for duplicate order values
  const orders = assessmentStructure.map(a => Number(a.order));
  const uniqueOrders = new Set(orders);
  if (orders.length !== uniqueOrders.size) {
    return { isValid: false, error: "Assessment components must have unique order values" };
  }

  return { isValid: true };
}

