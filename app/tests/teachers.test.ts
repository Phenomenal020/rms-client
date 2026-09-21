import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { addTeacherSchema } from "@/app/(main)/teachers/teachers-form";
import { DUPLICATE_TEACHER_EMAIL_MESSAGE, normaliseTeacherEmail, prepareAddTeacherMember } from "@/app/(main)/teachers/add-teacher-helpers";
import { resolveMembersFetchAuthRedirect } from "@/app/(main)/teachers/add-teacher-helpers";
import { canManage } from "@/shared-components/can-manage";
import { orgAdminCanManage } from "@/app/tests/helpers";
import { invalidateOrgMembersAfterAdd, postAddMemberRequest } from "@/fetcher/org-members-helpers";
import { getApiErrorMessage, useAddMember } from "@/fetcher/mutations";
import { getOrgMembersCacheKey, mapOrgMembersToTeachers, ORG_MEMBERS_LOAD_ERROR, toOrgMembersQueryResult } from "@/fetcher/org-members-helpers";
import { ORG_MEMBERS_KEY, ORGANISATION_ADD_MEMBER_KEY } from "@/fetcher/keys";
import { handleAuthRedirect } from "@/utils/auth-redirect";
import { toast } from "sonner";

const addMemberMutationMocks = vi.hoisted(() => ({
    mutate: vi.fn(),
    trigger: vi.fn(),
    isMutating: false,
    onSuccess: undefined as (() => void) | undefined,
}));

// Mock the toast library
vi.mock("sonner", () => ({
    toast: { error: vi.fn(), success: vi.fn() },
}));

vi.mock("swr", () => ({
    useSWRConfig: () => ({ mutate: addMemberMutationMocks.mutate }),
}));

vi.mock("swr/mutation", () => ({
    default: vi.fn(
        (_key: string, _fetcher: unknown, options?: { onSuccess?: () => void }) => {
            addMemberMutationMocks.onSuccess = options?.onSuccess;
            return {
                trigger: addMemberMutationMocks.trigger,
                get isMutating() {
                    return addMemberMutationMocks.isMutating;
                },
                error: undefined,
                data: undefined,
            };
        },
    ),
}));

// Create a mock http error that returns a response object with a status code and an optional message
function httpError(status: number, message?: string) {
    return { response: { status, data: { message } } };
}

// Testing that the addTeacherSchema is working as expected
describe("addTeacherSchema (1.1)", () => {
    // Testing that the addTeacherSchema accepts a valid email
    it("U-01: accepts a valid email", () => {
        const result = addTeacherSchema.safeParse({ email: "staff@school.edu" });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.email).toBe("staff@school.edu");
        }
    });

    // Testing that the addTeacherSchema rejects an empty string with "Valid email is required"
    it('U-02: rejects an empty string with "Valid email is required"', () => {
        const result = addTeacherSchema.safeParse({ email: "" });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0]?.message).toBe("Valid email is required");
        }
    });

    // Testing that the addTeacherSchema rejects a malformed email  
    it("U-03: rejects a malformed email", () => {
        const result = addTeacherSchema.safeParse({ email: "not-an-email" });
        expect(result.success).toBe(false);
    });

    // Testing that the addTeacherSchema rejects an email without a domain
    it("U-04: rejects an email without a domain", () => {
        const result = addTeacherSchema.safeParse({ email: "user@" });
        expect(result.success).toBe(false);
    });

    // Testing that the addTeacherSchema accepts an email with a subdomain  
    it("U-05: accepts an email with a subdomain", () => {
        const result = addTeacherSchema.safeParse({ email: "a.b@c.d.edu" });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.email).toBe("a.b@c.d.edu");
        }
    });

    // Testing that the addTeacherSchema does not trim whitespace — trimming is handled in the addMember handler
    it("U-06: rejects surrounding whitespace — trimming is handled in the addMember handler, not the schema", () => {
        const result = addTeacherSchema.safeParse({ email: "  x@y.com  " });
        expect(result.success).toBe(false);
    });
});

// Testing that the canManageTeachers function is working as expected
describe("canManageTeachers (1.2)", () => {
    // Testing that the canManageTeachers function returns true for an org admin with 2FA and a verified email
    it("U-07: returns true for org admin with 2FA and verified email", () => {
        expect(canManage(orgAdminCanManage)).toBe(true);
    });

    // Testing that the canManageTeachers function returns false for an org admin without 2FA
    it("U-08: returns false for org admin without 2FA", () => {
        expect(canManage({ ...orgAdminCanManage, twoFactorEnabled: false })).toBe(false);
    });

    // Testing that the canManageTeachers function returns false for an org admin with an unverified email
    it("U-09: returns false for org admin with unverified email", () => {
        expect(canManage({ ...orgAdminCanManage, emailVerified: false })).toBe(false);
    });

    // Testing that the canManageTeachers function returns false for a non-orgadmin role
    it('U-10: returns false for non-orgadmin role', () => {
        expect(canManage({ ...orgAdminCanManage, role: "teacher" })).toBe(false);
    });

    // Testing that the canManageTeachers function returns false when the user is undefined
    it("U-11: returns false when user is undefined", () => {
        expect(canManage(undefined)).toBe(false);
    });
});

// Testing that the add teacher email helpers - normaliseTeacherEmail, isDuplicateTeacherEmail, prepareAddTeacherMember - are working as expected
describe("add teacher email helpers (1.3)", () => {
    // Testing that the normaliseTeacherEmail function normalises the email to lowercase
    it("U-12: normalizes email to lowercase", () => {
        expect(normaliseTeacherEmail("Staff@School.EDU")).toBe("staff@school.edu");
    });

    // Testing that the normaliseTeacherEmail function trims surrounding whitespace
    it("U-13: trims surrounding whitespace", () => {
        expect(normaliseTeacherEmail("  staff@school.edu  ")).toBe("staff@school.edu");
    });

    // Testing that the isDuplicateTeacherEmail function blocks a duplicate exact match
    it("U-14: blocks duplicate exact match", () => {
        expect(
            prepareAddTeacherMember({ email: "a@b.com" }, [{ email: "a@b.com" }], true),
        ).toEqual({ action: "duplicate-error", message: DUPLICATE_TEACHER_EMAIL_MESSAGE });
    });

    // Testing that the isDuplicateTeacherEmail function blocks a duplicate case-insensitive match  
    it("U-15: blocks duplicate case-insensitive match", () => {
        expect(
            prepareAddTeacherMember({ email: "a@b.com" }, [{ email: "A@B.com" }], true),
        ).toEqual({ action: "duplicate-error", message: DUPLICATE_TEACHER_EMAIL_MESSAGE });
    });

    // Testing that the prepareAddTeacherMember function allows a new email and normalises it for the API call  
    it("U-16: allows a new email and normalizes it for the API call", () => {
        expect(
            prepareAddTeacherMember({ email: "C@D.com" }, [{ email: "a@b.com" }], true),
        ).toEqual({ action: "call-api", email: "c@d.com" });
    });

    // Testing that the prepareAddTeacherMember function returns a no-op when the user cannot manage teachers
    it("U-17: no-ops when canManage is false", () => {
        expect(
            prepareAddTeacherMember({ email: "c@d.com" }, [{ email: "a@b.com" }], false),
        ).toEqual({ action: "no-op" });
    });
});

// Testing that the auth redirect helpers - resolveMembersFetchAuthRedirect, handleAuthRedirect - are working as expected
describe("auth redirect helpers (1.4)", () => {
    // Set the pathname for the tests
    const pathname = "/teachers";

    // Testing that the resolveMembersFetchAuthRedirect function redirects on 401 and 403 errors
    describe("resolveMembersFetchAuthRedirect — member fetch errors", () => {
        // Testing that the resolveMembersFetchAuthRedirect function redirects to the sign-in page for a 401 error
        it("U-18: 401 redirects to sign-in with return path", () => {
            expect(resolveMembersFetchAuthRedirect(httpError(401), pathname)).toEqual({
                redirect: "sign-in",
                url: "/sign-in?redirect=/teachers",
            });
        });

        // Testing that the resolveMembersFetchAuthRedirect function redirects to the forbidden page for a 403 error
        it("U-19: 403 redirects to forbidden", () => {
            expect(resolveMembersFetchAuthRedirect(httpError(403), pathname)).toEqual({
                redirect: "forbidden",
            });
        });

        // Testing that the resolveMembersFetchAuthRedirect function does not redirect for other errors
        it("U-20: other errors do not redirect", () => {
            expect(resolveMembersFetchAuthRedirect(httpError(500), pathname)).toEqual({
                redirect: null,
            });
        });
    });

    // Testing that the handleAuthRedirect function shows a toast and redirects to the sign-in or forbidden page for 401 and 403 errors
    describe("handleAuthRedirect — mutation errors", () => {
        // Create a mock router
        const router = { replace: vi.fn() };

        // Testing that the handleAuthRedirect function shows a toast and redirects to the sign-in page for a 401 error
        it("U-21: 401 on add member shows toast and redirects to sign-in", () => {
            const err = httpError(401);
            expect(handleAuthRedirect(err, { router, pathname })).toBe(true);
            expect(toast.error).toHaveBeenCalledWith(
                "You are not authenticated. Please sign in to continue",
            );
            expect(router.replace).toHaveBeenCalledWith("/sign-in?redirect=/teachers");
        });

        // Testing that the handleAuthRedirect function shows a toast and redirects to the forbidden page for a 403 error
        it("U-22: 403 on remove member shows toast and redirects to forbidden", () => {
            vi.mocked(toast.error).mockClear();
            router.replace.mockClear();
            const err = httpError(403);
            expect(handleAuthRedirect(err, { router, pathname })).toBe(true);
            expect(toast.error).toHaveBeenCalledWith(
                "You are not authorised to access this page. Please contact your admin if you believe this is an error.",
            );
            expect(router.replace).toHaveBeenCalledWith("/forbidden");
        });

        // Testing that the handleAuthRedirect function does not redirect and uses getApiErrorMessage for non-auth errors
        it("U-23: non-auth error on add does not redirect and uses getApiErrorMessage", () => {
            router.replace.mockClear();
            const err = httpError(409, "Member already belongs to another organisation");
            const fallback = "Failed to add teacher. Please try again.";
            expect(handleAuthRedirect(err, { router, pathname })).toBe(false);
            expect(router.replace).not.toHaveBeenCalled();
            expect(getApiErrorMessage(err, fallback)).toBe(
                "Member already belongs to another organisation",
            );
        });
    });
});

// Testing that the getOrgMembers query helpers - mapOrgMembersToTeachers, getOrgMembersCacheKey, toOrgMembersQueryResult - are working as expected
describe("getOrgMembers query helpers (1.5)", () => {
    // Create a mock teacher
    const mockTeacher = {
        id: "t1",
        name: "Ada Lovelace",
        email: "ada@school.edu",
        image: null,
    };

    // Testing that the mapOrgMembersToTeachers function maps members to teacherOption[]
    it("U-24: maps members to teacherOption[]", () => {
        expect(
            mapOrgMembersToTeachers({
                members: [{ user: mockTeacher }],
            }),
        ).toEqual([mockTeacher]);
    });

    // Testing that the mapOrgMembersToTeachers function throws when members is missing
    it("U-25: throws when members is missing", () => {
        expect(() => mapOrgMembersToTeachers({ members: undefined })).toThrow(
            ORG_MEMBERS_LOAD_ERROR,
        );
        expect(() => mapOrgMembersToTeachers(null)).toThrow(ORG_MEMBERS_LOAD_ERROR);
    });

    // Testing that the toOrgMembersQueryResult function returns empty teachers array while loading 
    it("U-26: returns empty teachers array while loading", () => {
        expect(toOrgMembersQueryResult(undefined, undefined, true)).toEqual({
            teachers: [],
            error: undefined,
            isLoading: true,
            statusCode: 200,
        });
    });

    // Testing that the getOrgMembersCacheKey function returns null if the enabled flag is false and the ORG_MEMBERS_KEY if the enabled flag is true
    it("U-27: enabled false yields null SWR key (skips fetch)", () => {
        expect(getOrgMembersCacheKey(false)).toBeNull();
        expect(getOrgMembersCacheKey(true)).toBe(ORG_MEMBERS_KEY);
    });
});

describe("useAddMember helpers (1.6)", () => {
    it("U-28: POSTs to /api/v1/organisation/add-member with { email }", async () => {
        const post = vi.fn().mockResolvedValue({ data: { ok: true } });
        const payload = { email: "teacher@school.edu" };

        const result = await postAddMemberRequest(ORGANISATION_ADD_MEMBER_KEY, payload, post);

        expect(post).toHaveBeenCalledWith(ORGANISATION_ADD_MEMBER_KEY, payload);
        expect(result).toEqual({ ok: true });
    });

    it("U-29: on success invalidates ORG_MEMBERS_KEY", () => {
        const mutate = vi.fn();

        invalidateOrgMembersAfterAdd(mutate);

        expect(mutate).toHaveBeenCalledWith(ORG_MEMBERS_KEY);

        addMemberMutationMocks.mutate.mockClear();
        renderHook(() => useAddMember());
        addMemberMutationMocks.onSuccess?.();
        expect(addMemberMutationMocks.mutate).toHaveBeenCalledWith(ORG_MEMBERS_KEY);
    });

    it("U-30: exposes isMutating while request is in flight", () => {
        addMemberMutationMocks.isMutating = true;
        const { result, rerender } = renderHook(() => useAddMember());
        expect(result.current.isMutating).toBe(true);

        addMemberMutationMocks.isMutating = false;
        rerender();
        expect(result.current.isMutating).toBe(false);
    });
});