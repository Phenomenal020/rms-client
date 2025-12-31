import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";
import { createAuthMiddleware, APIError } from "better-auth/api";
import { passwordSchema } from "./validation";
import { sendPasswordResetEmail } from "./emails/send-password-reset-email";
import { sendEmailVerificationEmail } from "./emails/send-email-verification-email";
import { sendDeleteAccountVerificationEmail } from "./emails/delete-account-verification-email";
import { nextCookies } from "better-auth/next-js";

// create a new better auth instance with the prisma adapter
export const auth = betterAuth({
  // Database configuration - postgres with prisma adapter
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  // Email and Password Authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // do notrequire email verification for login
    // TODO: Use void to prevent timing attacks - don't await email sending
    sendResetPassword: async ({ user, url, token }, request) => {
      if (!user.email) {
        throw new Error("User email is required for password reset");
      }
      await sendPasswordResetEmail({
        user: {
          name: user.name,
          email: user.email,
        },
        url,
        token,
      });
    },
  },

  // User Management
  user: {
    // Additional fields in user schema
    additionalFields: {
      role: {
        type: "string",
        input: false,
      },
      firstName: {
        type: "string",
        input: true,
      },
      lastName: {
        type: "string",
        input: true,
      },
      subscription: {
        type: "string",
        input: true,
      },
    },
    // EMAIL CHANGE VERIFICATION
    changeEmail: {
      enabled: true,
      // Email change token expires in 24 hours (86400 seconds)
      sendChangeEmailVerification: async ({ user, url, newEmail }) => {
        await sendEmailVerificationEmail({
          user: { ...user, email: newEmail },
          url,
        });
      },
    },
    deleteUser: {
      enabled: true,
      sendDeleteAccountVerification: async ({ user, url }) => {
        await sendDeleteAccountVerificationEmail({ user, url });
      },
    },
  },

  // EMAIL VERIFICATION ON SIGN UP
  emailVerification: {
    autoSignInAfterVerification: false,
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmailVerificationEmail({ user, url });
    },
  },

  // PASSWORD VALIDATION (server-side)
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (
        ctx.path === "/sign-up/email" ||
        ctx.path === "/reset-password" ||
        ctx.path === "/change-password"
      ) {
        const password = ctx.body as {
          password?: string;
          newPassword?: string;
        };
        const { error } = passwordSchema.safeParse(
          password.password || password.newPassword
        );
        if (error) {
          throw new APIError("BAD_REQUEST", {
            message: error.message,
          });
        }
      }
    }),

    // after: createAuthMiddleware(async (ctx) => {
    //   if (ctx.path.startsWith("/signup")) {
    //     const session = ctx.context.newSession; // when session is immediately available
    //     let user: { name: string; email?: string } | undefined;
    //     if (session?.user) {
    //       user = session.user; // when session is not immediately available (pending email verification)
    //     } else if (
    //       ctx.body &&
    //       typeof ctx.body === "object" &&
    //       "name" in ctx.body &&
    //       "email" in ctx.body &&
    //       typeof ctx.body.name === "string" &&
    //       typeof ctx.body.email === "string"
    //     ) {
    //       user = { name: ctx.body.name, email: ctx.body.email };
    //     }
    //     if (user?.email) {
    //       await sendWelcomeEmail({ name: user.name, email: user.email });
    //     }
    //   }
    // }),
  },

  // trusted origins
    // trustedOrigins: ['http://localhost:3001'],

  // social providers
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },

  plugins: [nextCookies()],
});

// if using typescript
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
