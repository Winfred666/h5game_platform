import { PrismaClient } from "@prisma/client";
import { setPrismaDefaultConfig } from "../lib/dbInitUtils";
import dotenv from 'dotenv';
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

dotenv.config({ path: ".env.production" });

// Now the environment variables are available

async function main(){
    // defer to init bucket for minio, only when get it during runtime.
    // await createMinioClient();
    const prisma = new PrismaClient();
    const hashedPassword = await bcrypt.hash(process.env.DEFAULT_PASSWORD!, SALT_ROUNDS);
    await setPrismaDefaultConfig(prisma, hashedPassword);
}

main();