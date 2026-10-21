export type UserData = {
    firstName: string;
    lastName: string;
    name: string;
    subscription: string;
    role: string;
    image: string | null;
    twoFactorEnabled: boolean;
}

export type FullUserData = {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    name: string;
    subscription: string;
    role: string;
    image: string | null;
}