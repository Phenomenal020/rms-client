// Mock data for promotions — replace with API calls later

export type MockClass = {
    id: string;
    name: string;
    nextClassId: string | null;
    nextClassName: string | null;
};

export type MockStudent = {
    id: string;
    firstName: string;
    middleName: string | null;
    lastName: string;
    gender: "MALE" | "FEMALE";
    classId: string;
};

export const MOCK_CLASSES: MockClass[] = [
    { id: "class-jss1a", name: "JSS 1A", nextClassId: "class-jss2a", nextClassName: "JSS 2A" },
    { id: "class-jss1b", name: "JSS 1B", nextClassId: "class-jss2b", nextClassName: "JSS 2B" },
    { id: "class-jss2a", name: "JSS 2A", nextClassId: "class-jss3a", nextClassName: "JSS 3A" },
    { id: "class-jss2b", name: "JSS 2B", nextClassId: "class-jss3b", nextClassName: "JSS 3B" },
    { id: "class-jss3a", name: "JSS 3A", nextClassId: null, nextClassName: null },
    { id: "class-jss3b", name: "JSS 3B", nextClassId: null, nextClassName: null },
];

export const MOCK_STUDENTS: MockStudent[] = [
    { id: "stu-001", firstName: "Ada", middleName: "C", lastName: "Okafor", gender: "FEMALE", classId: "class-jss1a" },
    { id: "stu-002", firstName: "Chidi", middleName: null, lastName: "Nwosu", gender: "MALE", classId: "class-jss1a" },
    { id: "stu-003", firstName: "Fatima", middleName: "A", lastName: "Bello", gender: "FEMALE", classId: "class-jss1a" },
    { id: "stu-004", firstName: "Emeka", middleName: "O", lastName: "Eze", gender: "MALE", classId: "class-jss1a" },
    { id: "stu-005", firstName: "Grace", middleName: null, lastName: "Adeyemi", gender: "FEMALE", classId: "class-jss1b" },
    { id: "stu-006", firstName: "Ibrahim", middleName: "M", lastName: "Yusuf", gender: "MALE", classId: "class-jss1b" },
    { id: "stu-007", firstName: "Kemi", middleName: null, lastName: "Bakare", gender: "FEMALE", classId: "class-jss1b" },
    { id: "stu-008", firstName: "Tunde", middleName: "J", lastName: "Ajayi", gender: "MALE", classId: "class-jss2a" },
    { id: "stu-009", firstName: "Ngozi", middleName: "P", lastName: "Okonkwo", gender: "FEMALE", classId: "class-jss2a" },
    { id: "stu-010", firstName: "Samuel", middleName: null, lastName: "Danjuma", gender: "MALE", classId: "class-jss2a" },
    { id: "stu-011", firstName: "Amina", middleName: "H", lastName: "Garba", gender: "FEMALE", classId: "class-jss2b" },
    { id: "stu-012", firstName: "David", middleName: null, lastName: "Ogunleye", gender: "MALE", classId: "class-jss2b" },
    { id: "stu-013", firstName: "Blessing", middleName: "E", lastName: "Udoh", gender: "FEMALE", classId: "class-jss3a" },
    { id: "stu-014", firstName: "Michael", middleName: null, lastName: "Chukwu", gender: "MALE", classId: "class-jss3a" },
    { id: "stu-015", firstName: "Zainab", middleName: "K", lastName: "Abubakar", gender: "FEMALE", classId: "class-jss3b" },
];

// Simulate fetching students for a class (mock API)
export function getMockStudentsByClass(classId: string): MockStudent[] {
    return MOCK_STUDENTS.filter((student) => student.classId === classId);
}
