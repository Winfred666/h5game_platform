import { PrismaClient } from "@prisma/client";
import * as Minio from "minio";
import { GameExtension, UserExtension } from "./dbExtensions";
const REQUIRED_BUCKETS = ["games", "images", "photo"];

// This declaration extends the global scope with our prisma instance.
// type ModelRelationMap = Map<string, string[]>;
declare global {
  // We use `var` here because `let` and `const` have block scope.
  // The global object is not affected by Hot Module Replacement (HMR).
  var prisma: ReturnType<typeof createExtendedPrismaClient> | undefined;
  var minio: Minio.Client | undefined;
  // var relationFields: Map<string, string[]> | undefined;
}

// If globalThis.prisma exists, use it. Otherwise, create a new PrismaClient.
// This prevents creating new connections on every hot-reload in development.
export const db = globalThis.prisma || createExtendedPrismaClient();
export const minio = globalThis.minio || (await createMinioClient());

// In non-production environments, we assign the client to the global object.
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
  globalThis.minio = minio;
}

function createExtendedPrismaClient() {
  return new PrismaClient({
    omit: {
      user: {
        hash: true, // omit password hash
      },
    },
  })
    .$extends(GameExtension)
    .$extends(UserExtension);
}

// 创建 MinIO 客户端实例的函数
async function createMinioClient(): Promise<Minio.Client | undefined> {
  if (!process.env.MINIO_ENDPOINT) {
    throw new Error("MINIO_ENDPOINT is not defined in environment variables");
  }
  const accessKey = process.env.MINIO_ACCESS_KEY || "minioadmin";
  try {
    const client = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT,
      port: process.env.MINIO_PORT ? parseInt(process.env.MINIO_PORT) : 9000, // use container bridge network, may not need internal port
      accessKey,
      secretKey: process.env.MINIO_SECRET_KEY || "minioadmin",
      useSSL: false, // only access local MinIO server, set to true if using HTTPS
    });
    // create our bucket if it does not exist.
    for (const bucketName of REQUIRED_BUCKETS) {
      // 1. 检查存储桶是否存在
      const exists = await client.bucketExists(bucketName);
      if (!exists) {
        console.log(`Creating bucket: ${bucketName}`);
        await client.makeBucket(bucketName); // self-host, no need to specify region
      }
      // 2. 设置访问策略
      const policy = generateBucketPolicy(bucketName, accessKey);
      await client.setBucketPolicy(bucketName, JSON.stringify(policy));
    }
    console.log("✅ MinIO connection + bucket check successful");
    return client;
  } catch (error) {
    console.error("❌ MinIO connection failed:", error);
    if (process.env.NODE_ENV === "production")
      throw new Error("Failed to connect to MinIO or bucket does not exist");
  }
}

function generateBucketPolicy(bucketName: string, adminAccessKey: string) {
  const bucketArn = `arn:aws:s3:::${bucketName}`;
  const objectArn = `${bucketArn}/*`;
  return {
    Version: "2012-10-17",
    Statement: [
      // 公共读取权限
      {
        Effect: "Allow",
        Principal: { AWS: ["*"] },
        Action: ["s3:GetObject"],
        Resource: [objectArn],
      },
      // 管理员权限
      {
        Effect: "Allow",
        Principal: {
          AWS: [adminAccessKey],
        },
        Action: ["s3:*"],
        Resource: [bucketArn, objectArn],
      },
    ],
  };
}
