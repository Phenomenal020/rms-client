import { canManage } from "../../shared-components/can-manage";

// A dummy org admin with 2FA enabled and a verified email
export const orgAdminCanManage: canManage = {
    role: "orgadmin",
    twoFactorEnabled: true,
    emailVerified: true,
};