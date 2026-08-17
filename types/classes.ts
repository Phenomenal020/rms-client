import type { singleGetSubjectPayload } from "./subjects";

export type formTeacherPayload = {
    id: string;
    name: string;
    email: string;
    image: string | null;
}

export type getClassPayload = {
    id: string;  // organisation class id
    name: string;  // organisation class name
    formTeacher: formTeacherPayload | null;
    subjects: singleGetSubjectPayload[];
}

export type getAllClassesPayload = {
    success: string;
    data: getClassPayload[];
}

export type createClassPayload = {
    activeTermId?: string | null;
    name: string;
    formTeacherId: string | null;
    subjectIds?: string[];
}

export type updateClassPayload = {
    id: string;
    activeTermId?: string | null;
    name?: string;
    formTeacherId?: string | null;
    subjectIds?: string[];
}

export type deleteClassPayload = {
    id: string;
}

export type teacherOption = {
    id: string;
    name: string;
    email: string;
    image: string | null;
}
