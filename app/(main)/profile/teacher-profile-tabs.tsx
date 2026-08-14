'use client';

import { TeacherProfileForm } from "./teacher-profile-form";
import { PasswordForm } from "./password-form";
import { Preferences } from "./preferences";
import { getUserAccounts } from "@/fetcher/queries";
import { AccountSectionSkeleton, PasswordSectionSkeleton } from "./loading";
import { useUser } from "@/contexts/user-context";

export default function TeacherProfileTabs() {
    const { user, isLoading: isUserLoading, error: userError } = useUser();
    const {
        hasPasswordAccount,
        error: accountsError,
        isLoading: isAccountsLoading,
    } = getUserAccounts(!!user);

    return (
        <div className="w-full space-y-6">
            {/* Account section */}
            {isUserLoading ? (
                <AccountSectionSkeleton />
            ) : userError ? (
                <p className="text-center text-sm text-destructive">
                    Could not load profile information.
                </p>
            ) : user ? (
                <TeacherProfileForm user={user} />
            ) : null}

            {/* Password section */}
            {isUserLoading || isAccountsLoading ? (
                <PasswordSectionSkeleton />
            ) : accountsError ? (
                <p className="text-center text-sm text-destructive">
                    Could not load password settings.
                </p>
            ) : (
                <PasswordForm hasPasswordAccount={hasPasswordAccount} />
            )}

            {/* Settings section — local state only, no async fetch */}
            <Preferences />
        </div>
    );
}
