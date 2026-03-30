import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "@travel-with-me/env/server";

import { Prisma, PrismaClient } from "../prisma/generated/client";

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export { Prisma };
export default prisma;
