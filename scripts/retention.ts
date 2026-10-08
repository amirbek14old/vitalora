/* Data-retention job. Also exposed as /api/cron/retention for Vercel Cron. */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { runRetention } from "../src/lib/retention";

try { process.loadEnvFile?.(".env"); } catch { /* optional */ }
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
runRetention(db).then((r) => { console.log(r); return db.$disconnect(); });
