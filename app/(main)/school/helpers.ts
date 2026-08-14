import { getErrorMessage } from "@/fetcher/mutations";
import { authClient } from "@/src/auth-client";
import type { OrganizationFormValues } from "./school-form";

// Better Auth errors expose .message and .status directly (not axios-shaped used by the rest of the api)
export function getBetterAuthHttpStatus(err: unknown): number | undefined {
    const status = (err as { status?: number })?.status
        ?? (err as { response?: { status?: number } })?.response?.status;
    return typeof status === "number" ? status : undefined;
}
// Get the better auth error message from the error based on the status
export function getBetterAuthErrorMessage(
    err: unknown,
    fallback = "An unexpected error occurred. Please try again.",
): string {
    const status = getBetterAuthHttpStatus(err);
    if (status === 401) return "Your session has expired. Please sign in again.";
    if (status === 403) return "You don't have permission to perform this action.";
    const message = (err as { message?: string })?.message;
    return message || getErrorMessage(err, fallback); // if there is no message, use the fallback
}
type ActiveOrganisation = NonNullable<  // drop null and undefined --> ActiveOrganisation(T) only is left
    ReturnType<typeof authClient.useActiveOrganization>["data"]  // Just the data field (null or undefined are T)
>;

// Map the active organisation to the form values. The required fields: id, name, slug, metadata.address are populated on approval of onboarding request.
export function organisationToFormValues(org: ActiveOrganisation): OrganizationFormValues {
    return {
        // required fields: id, name, slug, metadata.address
        id: org.id,  
        name: org.name,
        slug: org.slug,
        metadata: {
            address: org.metadata?.address,
            // optional fields: metadata.motto, metadata.telephone, metadata.email
            motto: org.metadata?.motto ?? "",
            telephone: org.metadata?.telephone ?? "",
            email: org.metadata?.email ?? "",
        },
    };
}

// Build the metadata payload for the update/create request.
export function buildMetadataPayload(metadata: OrganizationFormValues["metadata"]) {
    return {
        // address: metadata?.address?.trim(),
        motto: metadata?.motto?.trim() || null,
        telephone: metadata?.telephone?.trim() || null,
        email: metadata?.email?.trim() || null,
    };
}