import type { Prisma } from "@/src/generated/prisma/client";

// Type for the user data selected from Prisma
// Used across multiple profile components
export type UserData = Prisma.UserGetPayload<{
  select: {
    id: true;
    name: true;
    firstName: true;
    lastName: true;
    email: true;
    emailVerified: true;
    image: true;
    role: true;
    subscription: true;
  };
}>;