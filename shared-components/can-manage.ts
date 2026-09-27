export type canManage = {
    role?: string;
    twoFactorEnabled?: boolean;
    emailVerified?: boolean;
} | undefined;

// Checks if the user is an org admin with 2FA and a verified email (Converted to a function to be)
export function canManage(user: canManage): boolean {
    return user?.role === "orgadmin" && user?.twoFactorEnabled === true && user?.emailVerified === true;
}