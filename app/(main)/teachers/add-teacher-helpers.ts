import { getHttpStatus } from "@/fetcher/mutations";

// The message to display when the email is a duplicate
export const DUPLICATE_TEACHER_EMAIL_MESSAGE =
    "A teacher with this email already exists";

// Normalises the email to lowercase and trims surrounding whitespace
export function normaliseTeacherEmail(email: string): string {
    return email.trim().toLowerCase();
}

// Checks if the email is a duplicate of an existing teacher email
export function isDuplicateTeacherEmail(
    email: string,
    teachers: { email: string }[],
): boolean {
    const normalisedEmail = normaliseTeacherEmail(email);
    return teachers.some((teacher) => teacher.email.toLowerCase() === normalisedEmail);
}

// The result of the prepareAddTeacherMember function
// Takes an email and emits an action based on the canManage context, normalised email, and duplicate status
export type PrepareAddTeacherResult =
    | { action: "call-api"; email: string }
    | { action: "duplicate-error"; message: string }
    | { action: "no-op" };

// Prepares the email for the API call
export function prepareAddTeacherMember(
    formData: { email: string },
    teachers: { email: string }[],
    canManage: boolean,
): PrepareAddTeacherResult {
    // If the user cannot manage teachers, return a no-op
    if (!canManage) return { action: "no-op" };

    const email = normaliseTeacherEmail(formData.email);
    // If the email is a duplicate, return a duplicate error
    if (isDuplicateTeacherEmail(email, teachers)) {
        return { action: "duplicate-error", message: DUPLICATE_TEACHER_EMAIL_MESSAGE };
    }

    // If the email is not a duplicate, return a call-api action with the normalised email
    return { action: "call-api", email };
}

// The result of the resolveMembersFetchAuthRedirect function
// Takes an error and pathname and emits a redirect based on the error status
export type MembersFetchAuthRedirect =
    | { redirect: "sign-in"; url: string }
    | { redirect: "forbidden" }
    | { redirect: null };

export function resolveMembersFetchAuthRedirect(
    error: unknown,
    pathname: string,
): MembersFetchAuthRedirect {
    // If the error is null, return a null redirect
    if (!error) return { redirect: null };

    const status = getHttpStatus(error);
    // If the status is 401, return a sign-in redirect
    if (status === 401) {
        return { redirect: "sign-in", url: `/sign-in?redirect=${pathname}` };
    }
    // If the status is 403, return a forbidden redirect
    if (status === 403) {
        return { redirect: "forbidden" };
    }

    // If the status is not 401 or 403, return a null redirect
    return { redirect: null };
}
