// Form teacher payload
export type formTeacherPayload = {
    id: string;
    name: string;
    email: string;
    image: string | null;
}

// Subject class assignment row
export type subjectClassAssignmentRow = {
    assignmentId: string;
    subjectId: string;
    subjectName: string;
    assignedTeacher: { id: string; name: string } | null;
}

// Get class payload (returns id, class name, form teacher, and subject class assignments) for a single class
export type getClassPayload = {
    id: string;  // organisation class id
    name: string;  // organisation class name
    formTeacher: formTeacherPayload | null;
    subjectClassAssignments: subjectClassAssignmentRow[] | null;
}

// Get all classes payload (returns id, class name, form teacher, and subject class assignments) for all classes
export type getAllClassesPayload = {
    success: string;
    data: getClassPayload[];
}

export type createClassPayload = {
    activeTermId?: string | null;
    name: string;
    formTeacherId: string | null;
}

export type updateClassPayload = {
    name?: string;
    formTeacherId?: string | null;
}

export type deleteClassPayload = {
    id: string;
}

export type classSubjectAssignmentRow = {
    assignmentId: string;
    subjectId: string;
    subjectName: string;
    assignedTeacher: { id: string; name: string } | null;
}

export type getClassByIdPayload = {
    id: string;
    name: string;
    formTeacher: { id: string; name: string } | null;
    subjectAssignments: classSubjectAssignmentRow[];
}

export type saveSubjectClassAssignmentPayload = {
    id: string;
    activeTermId: string;
    subjectId: string;
    assignedTeacherId: string | null;
}

export type teacherOption = {
    id: string;
    name: string;
    email: string;
    image: string | null;
}
