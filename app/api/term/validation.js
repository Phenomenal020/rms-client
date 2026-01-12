// SERVER SIDE VALIDATION FOR TERM UPDATES (required as client side validation is not reliable)

// Parse optional dates. Returns undefined (so prisma can handle null values) if the value is not a date.
function parseOptionalDate(value) {
  if (value === undefined || value === null) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return null; // invalid
  return date;
}

// Parse optional numbers. Returns undefined (so prisma can handle null values) if the value is not a number.
function parseOptionalNumber(value) {
  if (value === undefined || value === null || value === "") return undefined;
  const num = typeof value === "number" ? value : Number(value);
  return Number.isNaN(num) ? undefined : num;
}

// Validate term update data
export function validateTermUpdate(termData) {
  // Use an array to collect all the errors
  const errors = [];

  // Validate required fields
  if (!termData.academicYear || typeof termData.academicYear !== "string" || termData.academicYear.trim() === "") {
    return { isValid: false, error: "Academic year is required" };
  }

  if (!termData.className || typeof termData.className !== "string" || termData.className.trim() === "") {
    return { isValid: false, error: "Class name is required" };
  }

  // Validate term (enum)
  if (!["FIRST", "SECOND", "THIRD"].includes(termData.term)) {
    return { isValid: false, error: "Term must be First, Second, or Third" };
  }

  // Validate term days
  const termDaysNum = parseOptionalNumber(termData.termDays);
  if (termDaysNum !== undefined && (termDaysNum < 0 || !Number.isInteger(termDaysNum))) {
    return { isValid: false, error: "Term days must be a valid non-negative integer" };
  }

  // Validate term start and end dates
  const termStartDate = parseOptionalDate(termData.termStart);
  const termEndDate = parseOptionalDate(termData.termEnd);
  if (termStartDate && termEndDate && termEndDate <= termStartDate) {
    return { isValid: false, error: "Term end date must be after term start date" };
  }

  // Grading system validation
  let gradingSystem = termData.gradingSystem;
  if (gradingSystem !== undefined) {
    // Validate grading system is an array
    if (!Array.isArray(gradingSystem)) {
      return { isValid: false, error: "Grading system entries must be at least one" };
    } else {
      const scoreRanges = [];
      gradingSystem.forEach((entry, i) => {
        if (!entry || typeof entry !== "object") {
          errors.push(`Grading system entry ${i + 1} is invalid`);
          return;
        }
        // Validate grade is provided
        const grade = entry.grade?.trim();
        if (!grade) errors.push(`Grading system entry ${i + 1}: Grade is required`);

        // Validate minScore and maxScore are provided and are numbers and within the range of 0 to 100
        const minScore = parseOptionalNumber(entry.minScore);
        const maxScore = parseOptionalNumber(entry.maxScore);
        if (
          minScore === undefined ||
          maxScore === undefined ||
          minScore < 0 ||
          maxScore > 100 ||
          minScore >= maxScore
        ) {
          errors.push(`Grading system entry ${i + 1}: Invalid score range`);
        } else {
          scoreRanges.push({ min: minScore, max: maxScore, index: i + 1 });
        }
      });

      // Check for overlapping ranges
      for (let i = 0; i < scoreRanges.length; i++) {
        for (let j = i + 1; j < scoreRanges.length; j++) {
          const r1 = scoreRanges[i];
          const r2 = scoreRanges[j];
          if (r1.min <= r2.max && r1.max >= r2.min) {
            errors.push(`Grading system entries ${r1.index} and ${r2.index} overlap`);
          }
        }
      }
    }
  }

  // If there are any errors, return the first error. Also, set the isValid flag to false.
  if (errors.length > 0) {
    return { isValid: false, error: errors[0] };
  }

  // Otherwise, return the validated data
  return {
    isValid: true,
    validated: {
      academicYear: termData.academicYear.trim(),
      term: termData.term,
      className: termData.className.trim(),
      termDays: termDaysNum,
      termStart: termStartDate,
      termEnd: termEndDate,
      gradingSystem,
    },
  };
}

