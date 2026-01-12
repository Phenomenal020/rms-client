// parse (optional) start and end dates
function parseOptionalDate(value) {
  if (value === undefined || value === null || value === "") return undefined;
  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return null; // invalid
  return date;
}

// Convert string to number if it is a valid number
function parseOptionalNumber(value) {
  if (value === undefined || value === null || value === "") return undefined;
  const num = typeof value === "number" ? value : Number(value);
  return Number.isNaN(num) ? undefined : num;
}

// Validate students update data
export function validateStudentsUpdate(data) {
  const { students } = data;

  // Validate students array
  if (!students || !Array.isArray(students) || students.length === 0) {
    return { isValid: false, error: "At least one student is required" };
  }

  // Validate each student
  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    
    if (!student || typeof student !== "object") {
      return { isValid: false, error: `Student ${i + 1} is invalid` };
    }

    // Validate required fields
    if (!student.firstName || typeof student.firstName !== "string" || student.firstName.trim() === "") {
      return { isValid: false, error: `Student ${i + 1}: First name is required` };
    }

    if (!student.lastName || typeof student.lastName !== "string" || student.lastName.trim() === "") {
      return { isValid: false, error: `Student ${i + 1}: Last name is required` };
    }

    // Validate optional middle name
    if (student.middleName !== undefined && student.middleName !== null && typeof student.middleName !== "string") {
      return { isValid: false, error: `Student ${i + 1}: Middle name must be a string` };
    }

    // Validate date of birth
    if (student.dateOfBirth !== undefined && student.dateOfBirth !== null && student.dateOfBirth !== "") {
      const dateOfBirth = parseOptionalDate(student.dateOfBirth);
      if (dateOfBirth === null) {
        return { isValid: false, error: `Student ${i + 1}: Invalid date of birth` };
      }
    }

    // Validate gender enum
    if (student.gender !== undefined && student.gender !== null && student.gender !== "") {
      if (!["NONE", "MALE", "FEMALE"].includes(student.gender)) {
        return { isValid: false, error: `Student ${i + 1}: Invalid gender value` };
      }
    }

    // Validate department enum
    if (student.department !== undefined && student.department !== null && student.department !== "") {
      if (!["NONE", "SCIENCE", "ARTS", "COMMERCE", "GENERAL"].includes(student.department)) {
        return { isValid: false, error: `Student ${i + 1}: Invalid department value` };
      }
    }

    // Validate days present
    if (student.daysPresent !== undefined && student.daysPresent !== null && student.daysPresent !== "") {
      const daysPresent = parseOptionalNumber(student.daysPresent);
      if (daysPresent === undefined || daysPresent < 0 || !Number.isInteger(daysPresent)) {
        return { isValid: false, error: `Student ${i + 1}: Days present must be a valid non-negative integer` };
      }
    }

    // Validate subjects array
    const subjectsData = student.subjects || student.studentSubjects;
    if (!subjectsData || !Array.isArray(subjectsData) || subjectsData.length === 0) {
      return { isValid: false, error: `Student ${i + 1}: At least one subject is required` };
    }

    // Validate each subject
    for (let j = 0; j < subjectsData.length; j++) {
      const subject = subjectsData[j];
      if (!subject) {
        return { isValid: false, error: `Student ${i + 1}, Subject ${j + 1}: Subject is invalid` };
      }
      
      const subjectName = typeof subject === "object" ? subject.name : subject;
      if (!subjectName || typeof subjectName !== "string" || subjectName.trim() === "") {
        return { isValid: false, error: `Student ${i + 1}, Subject ${j + 1}: Subject name is required` };
      }
    }
  }

  return { isValid: true };
}