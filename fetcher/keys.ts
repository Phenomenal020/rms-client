// Shared SWR cache keys + Nest API paths.
// Queries and mutations must import from here so invalidate/mutate always hits the same keys.

// ----------------------------- Auth / session (client-side keys) -----------------------------
export const USER_SESSION_KEY = "/api/v1/users/session";  // get user from session
export const AUTH_ACCOUNTS_KEY = "auth-accounts";  // get user accounts to check for password account
export const AUTH_SESSIONS_KEY = "auth-sessions";  // get all user sessions to check for the active session
export const AUTH_CURRENT_SESSION_KEY = "auth-current-session";  // get the current user session token to use for authentication
export const ORG_MEMBERS_KEY = "org-members";  // Get the members of the orgadmin's school
export const USER_WITH_RELATIONS_KEY = "/api/v1/users/user";  // Get the authenticated user's identity row — role, name, email, schoolId, etc. Also include the user's onboarding status
export const USER_PROFILE_KEY = "/api/v1/users/profile";  // PATCH user profile




// ----------------------------- Terms / grading / assessment -----------------------------
export const TERMS_KEY = "/api/v1/terms";  // Get all terms for the orgadmin's school
export const GRADING_SYSTEM_KEY = "/api/v1/grading-system";
export const ASSESSMENT_STRUCTURE_KEY = "/api/v1/assessment-structure";

export function gradingSystemKey(termId: string) {
    return `${GRADING_SYSTEM_KEY}?termId=${encodeURIComponent(termId)}`;
}  // id in query. Get the grading system for a specific term

export function assessmentStructureKey(termId: string) {
    return `${ASSESSMENT_STRUCTURE_KEY}?termId=${encodeURIComponent(termId)}`;
}  // id in query. Get the assessment structure for a specific term

export function gradingSystemByTermPath(termId: string) {
    return `${GRADING_SYSTEM_KEY}/${encodeURIComponent(termId)}`;
}  // id in path. POST save grading system for a term

export function assessmentStructureByTermPath(termId: string) {
    return `${ASSESSMENT_STRUCTURE_KEY}/${encodeURIComponent(termId)}`;
}  // id in path. PATCH assessment structure for a term

export function termByIdPath(id: string) {
    return `${TERMS_KEY}/${encodeURIComponent(id)}`;
}  // id in path. PATCH a term




// ----------------------------- Dashboard Cards -----------------------------
export const ORGANISATION_DASHBOARD_KEY = "/api/v1/organisation/dashboard";  // Get the dashboard cards for the user's school




// ----------------------------- Subjects -----------------------------
export const SUBJECTS_KEY = "/api/v1/subjects";  // Get all subjects for the orgadmin's school

export function subjectByIdPath(id: string) {
    return `${SUBJECTS_KEY}/${encodeURIComponent(id)}`;
}  // id in path. PATCH a subject




// ----------------------------- Students -----------------------------
export const STUDENTS_KEY = "/api/v1/students";  // Get all students for the orgadmin's school

export function studentByIdPath(id: string) {
    return `${STUDENTS_KEY}/${encodeURIComponent(id)}`;
}  // id in path. PATCH a student




// ----------------------------- Enrollments -----------------------------
export const STUDENTS_ENROLLMENT_KEY = "/api/v1/students/enrollment";  // POST save subject enrollments

export function studentEnrollmentsKey(classId: string, termId: string) {
    return `${STUDENTS_KEY}/enrollments?classId=${encodeURIComponent(classId)}&termId=${encodeURIComponent(termId)}`;
}  // classId + termId in query. GET enrollments for a class




// ----------------------------- Classes -----------------------------
export const CLASSES_KEY = "/api/v1/classes";

export function classesKey(termId: string | null = null) {
    // null  → classes only (no subject assignments)
    // string → classes + subjects for that term
    return termId
        ? `${CLASSES_KEY}?termId=${encodeURIComponent(termId)}`
        : CLASSES_KEY;
}

export function classEnrollmentsKey(termId: string) {
    return `${CLASSES_KEY}/enrollments?termId=${encodeURIComponent(termId)}`;
}

export function classByIdPath(id: string) {
    return `${CLASSES_KEY}/${encodeURIComponent(id)}`;
}  // id in path. PATCH a class

export function teacherClassesKey(termId: string) {
    return `/api/v1/student-view/classes?termId=${encodeURIComponent(termId)}`;
}




// ----------------------------- Class Record -----------------------------
export const CLASS_RECORD_KEY = "/api/v1/student-view/class-record";

export function classRecordKey(classId: string, termId: string) {
    return `${CLASS_RECORD_KEY}?classId=${encodeURIComponent(classId)}&termId=${encodeURIComponent(termId)}`;
}




// ----------------------------- Organisation -----------------------------
export const ORGANISATION_ADD_MEMBER_KEY = "/api/v1/organisation/add-member";




// ----------------------------- Student view / subject view -----------------------------
export const STUDENT_VIEW_EXPORT_KEY = "/api/v1/student-view/export";
export const STUDENT_VIEW_SAVE_SCORES_KEY = "/api/v1/student-view/save-scores";
export const SUBJECT_VIEW_SAVE_SCORES_KEY = "/api/v1/subject-view/save-scores";




// ----------------------------- Record exports -----------------------------
export const RECORD_REQUESTS_KEY = "/api/v1/record/requests";
export const RECORD_RECORD_KEY = "/api/v1/record/record";
export const RECORD_ACCEPT_KEY = "/api/v1/record/accept";
export const RECORD_REJECT_KEY = "/api/v1/record/reject";

export function recordRequestsKey(termId: string) {
    return `${RECORD_REQUESTS_KEY}?termId=${encodeURIComponent(termId)}`;
}

export function recordByRequestIdKey(requestId: string) {
    return `${RECORD_RECORD_KEY}?requestId=${encodeURIComponent(requestId)}`;
}

export function recordAcceptPath(requestId: string) {
    return `${RECORD_ACCEPT_KEY}?requestId=${encodeURIComponent(requestId)}`;
}

export function recordRejectPath(requestId: string) {
    return `${RECORD_REJECT_KEY}?requestId=${encodeURIComponent(requestId)}`;
}




// ----------------------------- Onboarding -----------------------------
export const ONBOARDING_REQUESTS_KEY = "/api/v1/onboarding/requests";
export const ONBOARDING_CREATE_REQUEST_KEY = "/api/v1/onboarding/create-request";
export const ONBOARDING_JOIN_REQUEST_KEY = "/api/v1/onboarding/join-request";
export const ONBOARDING_JOIN_REQUESTS_KEY = "/api/v1/onboarding/join-requests";

export function onboardingRequestApprovePath(id: string) {
    return `${ONBOARDING_REQUESTS_KEY}/${encodeURIComponent(id)}/approve`;
}

export function onboardingRequestRejectPath(id: string) {
    return `${ONBOARDING_REQUESTS_KEY}/${encodeURIComponent(id)}/reject`;
}

export function teacherJoinRequestApprovePath(id: string) {
    return `${ONBOARDING_JOIN_REQUESTS_KEY}/${encodeURIComponent(id)}/approve`;
}

export function teacherJoinRequestRejectPath(id: string) {
    return `${ONBOARDING_JOIN_REQUESTS_KEY}/${encodeURIComponent(id)}/reject`;
}




// ----------------------------- Prefix matchers (for mutate of query-string variants) -----------------------------
export function startsWithKey(prefix: string) {
    return (key: unknown) => typeof key === "string" && key.startsWith(prefix);
}
