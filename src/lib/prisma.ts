import { PrismaClient } from '../generated/prisma/client';   // import the generated prisma client
import { PrismaPg } from "@prisma/adapter-pg";   // import the prisma pg adapter since we are using postgres

// create a new prisma pg adapter with the connection string from the environment variables
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

// create a global for prisma to avoid multiple instances of the prisma client
const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

// create a prisma client with the adapter (for production) or reuse an existing one (for development)
const prisma =
  globalForPrisma.prisma || new PrismaClient({
    adapter,
  });

// if we are not in production, set the global prisma client to the new one
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// export the prisma client
export default prisma;