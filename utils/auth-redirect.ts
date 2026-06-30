import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { toast } from "sonner";
import { getHttpStatus } from "@/fetcher/mutations";

type AuthRedirectOptions = {
    router: Pick<AppRouterInstance, "replace">;
    pathname: string;
};

// Returns true if a 401/403 redirect was performed (skip generic error toasts).
export function handleAuthRedirect(
    err: unknown,
    { router, pathname }: AuthRedirectOptions,
): boolean {
    const status = getHttpStatus(err);
    if (status === 401) {
        toast.error("You are not authenticated. Please sign in to continue");
        router.replace(`/sign-in?redirect=${pathname}`);
        return true;
    }
    if (status === 403) {
        toast.error(
            "You are not authorised to access this page. Please contact your admin if you believe this is an error.",
        );
        router.replace("/forbidden");
        return true;
    }
    return false;
}
