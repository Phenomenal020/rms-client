// Shared validation helpers for subject actions

export const SUBJECT_VALIDATION_ERRORS = [
  "Please set up your school first before adding subjects",
  "Please set up your academic term first before adding subjects",
  "School not found",
  "Academic term not found",
  "User unauthorised",
];

export function validateSubjectsInput(subjects) {
  // check if the subjects array is valid or not empty
  if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
    return "At least one subject is required";
  }

  // check if each subject is valid and has a name
  for (let i = 0; i < subjects.length; i++) {
    const subject = subjects[i];
    if (!subject || typeof subject !== "object") {
      return `Subject ${i + 1} is invalid`;
    }
    if (
      !subject.name ||
      typeof subject.name !== "string" ||
      subject.name.trim() === ""
    ) {
      return `Subject ${i + 1}: Name is required`;
    }
  }

  return null;
}

export function validateUserContext(currentUser) {
  // check if the user is valid
  if (!currentUser) {
    return { error: "User unauthorised" };
  }

  // check if the user has a school
  if (!currentUser.schoolId) {
    return {
      error: "Please set up your school first before adding subjects",
    };
  }

  // check if the user has an academic term
  const academicTerm = currentUser.academicTerms?.[0];
  if (!academicTerm) {
    return {
      error: "Please set up your academic term first before adding subjects",
    };
  }

  return { academicTerm };
}

