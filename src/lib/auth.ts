import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import prisma from './prisma'

// create a new better auth instance with the prisma adapter
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',   // use the postgresql provider since we are using postgres
  }),
  emailAndPassword: {
    enabled: true,
  },
//   trustedOrigins: ['http://localhost:3001'],
})