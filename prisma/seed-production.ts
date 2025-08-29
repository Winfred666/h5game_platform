import { PrismaClient } from "@prisma/client";
import { createMinioClient, setPrismaDefaultConfig } from "../lib/dbInitUtils";
import dotenv from 'dotenv';
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

dotenv.config({ path: ".env.development" });

// Now the environment variables are available

async function main(){
    await createMinioClient();
    const prisma = new PrismaClient();
    const hashedPassword = await bcrypt.hash(process.env.DEFAULT_PASSWORD!, SALT_ROUNDS);
    setPrismaDefaultConfig(prisma, hashedPassword);
}

main();