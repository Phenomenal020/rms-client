type enrolledSubject = {
    enrollmentId: string;
    studentId: string;
    subjectClassAssignmentId: string;
}

export type studentPayload = {
    id: string;
    firstName: string;
    middleName: string;
    lastName: string;
    classId: string;
    enrolledSubjects: enrolledSubject[];
};

type subjectClassAssignment = {
    id: string;
    subjectId: string;
};

// export type getAllStudentsByClassPayload = {
//     success: boolean;
//     data: getStudentsByClassPayload[];
// };

export type SaveEnrollmentPayload = {
    studentId: string;
    enrolledSubjectIds: string[];
    activeTermId: string;
};

////////////////

export type getEnrollmentsPayload= {
    students: studentPayload[];
    subjectClassAssignments: subjectClassAssignment[];
}

export type getEnrollmentsResponse = {
    success: boolean;
    data: getEnrollmentsPayload;
}

//////////////////////////////////////////////////////////////
export type subjectAssignment = {
    assignmentId: string;
    subjectId: string;
    subjectName: string;
}

export type subjectClassAssignmentPayload = {
    classId: string;
    name: string;
    assignments: subjectAssignment[];
};

export type subjectClassAssignmentResponse = {
    success: boolean;
    data: subjectClassAssignmentPayload[]
}