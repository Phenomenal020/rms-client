// Transform database data to component format
export default function transformData(user, academicTerm) {
  // If there is nothing to transform, return empty data
  if (!user || !academicTerm)
    return { students: [], subjects: [], schoolData: null };

  // Transform school data from academicTerm's school
  const schoolData = academicTerm.school
    ? {
        name: academicTerm.school.schoolName, // Required field
        address: academicTerm.school.schoolAddress || "", // Optional field
        tel: academicTerm.school.schoolTelephone || "", // Optional field
        email: academicTerm.school.schoolEmail || "", // Optional field
        academicYear: academicTerm.academicYear, // Required field
        term: academicTerm.term, // Has schema default
      }
    : null;

  // Transform students data - students belong to academicTerm
  const students = (academicTerm.students || []).map((student) => {
    // Get the full name of the student
    const fullName = `${student.firstName}${
      student.middleName ? ` ${student.middleName}` : ""
    } ${student.lastName}`.trim();

    // Transform subjects with assessments and scores
    const subjects = (student.subjects || []).map((studentSubject) => {
      // Find the assessment for this student-subject combination
      const assessment = student.assessments?.find(
        (a) => a.subjectId === studentSubject.subjectId
      );

      // Transform scores from AssessmentScore model
      const scores =
        assessment?.scores?.map((score) => ({
          type: score.assessmentStructure?.type || "",
          score: score.score || 0,
        })) || [];

      return {
        name: studentSubject.subject?.name,
        subjectId: studentSubject.subjectId,
        assessmentId: assessment?.id || null,
        scores,
      };
    });

    return {
      name: fullName,
      firstName: student.firstName,
      middleName: student.middleName,
      lastName: student.lastName,
      studentId: student.id,
      subjects,
    };
  });

  // Extract unique subjects from academicTerm
  const subjects = (academicTerm.subjects || []).map((subject) => subject.name);

  return { students, subjects, schoolData };
}

