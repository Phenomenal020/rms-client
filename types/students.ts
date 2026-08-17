// Payload for getting a single student
export type getSingleStudent = {
    id: string;
    firstName: string;
    middleName?: string | null;
    lastName: string;
    gender: "MALE" | "FEMALE";
    status: "ACTIVE" | "INACTIVE";
    classId: string | null;
    // className?: string | null;
}

// Payload for getting all students
export type getAllStudentsPayload = {
    success: boolean;
    data: getSingleStudent[];
}

// Payload for updating a single student
export type updateSingleStudent = {
    id: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    gender?: "MALE" | "FEMALE";
    status?: "ACTIVE" | "INACTIVE";
    // Pass a UUID to assign, null to remove from class, omit to leave unchanged
    classId?: string | null;
}

// Payload for creating a single student
export type createSingleStudent = {
    firstName: string;
    middleName?: string;
    lastName: string;
    gender: "MALE" | "FEMALE";
    classId: string | null;
    // status is active by default
}

// Payload for deleting a single student
export type deleteSingleStudent = {
    id: string;
};

/////////////////////////////////////////////
export type enrollmentAssignment = {
    enrollmentId: string;
    assignmentId: string;
}

export type enrollmentStudent = {
    studentId: string;
    firstName: string;
    middleName?: string;
    lastName: string;
}

export type enrollmentPayload = {
    student: enrollmentStudent;
    enrollments: enrollmentAssignment[];
};

export type enrollmentsResponse = {
    success: boolean;
    data: enrollmentPayload[]
}