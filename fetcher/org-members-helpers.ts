import { ORG_MEMBERS_KEY } from "@/fetcher/keys";
import { authClient } from "@/src/auth-client";
import type { teacherOption } from "@/types/classes";
import type { AddMemberPayload, RemoveMemberPayload } from "@/types/organisation";

export const ORG_MEMBERS_LOAD_ERROR = "Failed to load organisation members";

export type OrgMembersListResponse = {
    members?: Array<{ user: teacherOption }>;
};

// Maps the members to teacherOption[]. Throws an error: Failed to load organisation members when members is missing
export function mapOrgMembersToTeachers(
    data: OrgMembersListResponse | null | undefined,
): teacherOption[] {
    if (!data?.members) {
        throw new Error(ORG_MEMBERS_LOAD_ERROR);
    }
    return data.members.map((member) => member.user);
}

// Returns the cache key for the org members query. Returns null if the enabled flag is false
export function getOrgMembersCacheKey(enabled: boolean): string | null {
    return enabled ? ORG_MEMBERS_KEY : null;
}

// Returns the query result for the org members query. Returns the data if it is defined, the error if it is defined, the isLoading flag, and the status code
export function toOrgMembersQueryResult(
    data: teacherOption[] | undefined,
    error: unknown,
    isLoading: boolean,
) {
    return {
        teachers: data ?? [],
        error,
        isLoading,
        statusCode: error ? (error as { status?: number }).status ?? null : 200,
    };
}


// ADD MEMBER HELPER FUNCTIONS
type PostAddMember = (
    url: string,
    body: AddMemberPayload,
) => Promise<{ data: unknown }>;

export async function postAddMemberRequest(
    url: string,
    arg: AddMemberPayload,
    post: PostAddMember,
) {
    const response = await post(url, arg);
    return response.data;
}

export function invalidateOrgMembersAfterAdd(
    mutate: (key: string) => void,
) {
    mutate(ORG_MEMBERS_KEY);
}

export function toAddMemberHookResult<TTrigger>(
    trigger: TTrigger,
    isMutating: boolean,
    error: unknown,
    data: unknown,
) {
    return {
        addMemberClient: trigger,
        isMutating,
        error,
        data,
    };
}

// REMOVE MEMBER HELPER FUNCTIONS
export async function postRemoveMemberRequest(arg: RemoveMemberPayload) {
    const { data, error } = await authClient.organization.removeMember({
        memberIdOrEmail: arg.memberIdOrEmail,
    });
    if (error) throw error;
    return data;
}

export function invalidateOrgMembersAfterRemove(
    mutate: (key: string) => void,
) {
    mutate(ORG_MEMBERS_KEY);
}

export function toRemoveMemberHookResult<TTrigger>(
    trigger: TTrigger,
    isMutating: boolean,
    error: unknown,
    data: unknown,
) {
    return {
        removeMemberClient: trigger,
        isMutating,
        error,
        data,
    };
}
