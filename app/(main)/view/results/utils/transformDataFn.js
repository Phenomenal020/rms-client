// Transform database data to component format
export default function transformData(user, academicTerm) {

  // If there is nothing to transform, return empty data
  if (!user || !academicTerm)
    return { students: [], schoolData: null, classData: null };

  // Transform school data from academicTerm's school
  const schoolData = user.school
    ? {
        name: user.school.schoolName, // Required field
        address: user.school.schoolAddress || "", // Optional field
        tel: user.school.schoolTelephone || "", // Optional field
        email: user.school.schoolEmail || "", // Optional field
        academicYear: user.academicTerms[0].academicYear, // Required field
        term: user.academicTerms[0].term, // Has schema default
        motto: user.school.schoolMotto || "", // Optional field
      }
    : null;

  // Transform students data - students belong to academicTerm
  const students = (academicTerm.students || []).map((student) => {
    // Get the full name of the student (required by the Student information section)
    const fullName = `${student.firstName}${
      student.middleName ? ` ${student.middleName}` : ""
    } ${student.lastName}`.trim();

    // include days Present
    const daysPresent = student.daysPresent ?? null;

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
        daysPresent: daysPresent,
        scores,
      };
    });

    return {
      name: fullName,
      firstName: student.firstName,
      middleName: student.middleName,
      lastName: student.lastName,
      daysPresent: student.daysPresent ?? null, // Optional field
      totalDays: academicTerm.termDays ?? null, // Optional field
      subjects,
      // comments: "", // TODO: Comments field doesn't exist in schema yet
    };
  });

  // Transform class data
  const classData = {
    name: user.academicTerms[0].class.name, // Required field
  };

  console.log('Academic class data:', classData);

  return { students, schoolData, classData };
};
