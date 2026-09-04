'use client';

import { TeacherProfileForm } from "./teacher-profile-form";
import { PasswordForm } from "./password-form";
import { Preferences } from "./preferences";
import { getUserAccounts } from "@/fetcher/queries";
import { AccountSectionSkeleton, PasswordSectionSkeleton } from "./loading";
import { useUser } from "@/contexts/user-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shadcn/ui/tabs";

export default function TeacherProfileTabs() {
    const { user, isLoading: isUserLoading, error: userError } = useUser();
    const {
        hasPasswordAccount,
        error: accountsError,
        isLoading: isAccountsLoading,
    } = getUserAccounts(!!user);

    return (
        <Tabs defaultValue="account" className="mt-0 pt-0">
            {/* Tabs List */}
            <TabsList variant="line">
                <TabsTrigger value="account" className="cursor-pointer">Account</TabsTrigger>
                <TabsTrigger value="password" className="cursor-pointer">Password</TabsTrigger>
                <TabsTrigger value="preferences" className="cursor-pointer">Preferences</TabsTrigger>
            </TabsList>

            {/* Tabs Content: Account section */}
            <TabsContent value="account" className="mt-2">
                {isUserLoading ? (
                    <AccountSectionSkeleton />
                ) : userError ? (
                    <p className="text-center text-sm text-destructive">
                        Could not load profile information.
                    </p>
                ) : user ? (
                    <TeacherProfileForm user={user} />
                ) : null}
            </TabsContent>

            {/* Tabs Content: Password section */}
            <TabsContent value="password" className="mt-2">
                {isUserLoading || isAccountsLoading ? (
                    <PasswordSectionSkeleton />
                ) : accountsError ? (
                    <p className="text-center text-sm text-destructive">
                        Could not load password settings.
                    </p>
                ) : (
                    <PasswordForm hasPasswordAccount={hasPasswordAccount} />
                )}
            </TabsContent>

            {/* Tabs Content: Settings section — local state only, no async fetch */}
            <TabsContent value="preferences" className="mt-2">
                <Preferences />
            </TabsContent>
        </Tabs>
    );
}
