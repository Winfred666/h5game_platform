import "server-only";

import { PrismaClient } from "@prisma/client";
import * as Minio from "minio";
import { GameExtension, TagExtension, UserExtension } from "./dbExtensions";
import { MINIO_BUCKETS } from "./clientConfig";

// This declaration extends the global scope with our prisma instance.
// type ModelRelationMap = Map<string, string[]>;
declare global {
  // We use `var` here because `let` and `const` have block scope.
  // The global object is not affected by Hot Module Replacement (HMR).
  var prisma: ReturnType<typeof createExtendedPrismaClient> | undefined;
  var minio: Minio.Client | undefined;
  var topGamesInitialized: boolean | undefined;
}

// If globalThis.prisma exists, use it. Otherwise, create a new PrismaClient.
// This prevents creating new connections on every hot-reload in development.
export const db = globalThis.prisma || createExtendedPrismaClient();

// Only initialize once using global flag
if (!globalThis.topGamesInitialized) {
  globalThis.topGamesInitialized = true;
  setTimeout(async () => {
    try {
      const { startAutoTopGamesCalc } = await import("./services/dailyTopGame");
      await startAutoTopGamesCalc();
    } catch (error) {
      console.error('❌ Failed to start top games calculation:', error);
      globalThis.topGamesInitialized = false; // Reset on failure
    }
  }, 3000);
}

// Add lazy minio getter
let _minioClient: Minio.Client | undefined;
export async function getMinio(): Promise<Minio.Client | undefined> {
  if (_minioClient) return _minioClient;
  if (globalThis.minio) {
    _minioClient = globalThis.minio;
    return _minioClient;
  }
  _minioClient = await createMinioClient();
  return _minioClient;
}

  

function createExtendedPrismaClient() {
  const prisma = new PrismaClient({
    omit: {
      user: {
        hash: true, // ALWAYS omit password hash
        qq: true, // omit qq number for security, only admin can see it
        isAdmin: true,
      },
      // need to expose game.isPrivate for smart URL gen.
      tag: {
        hide: true, // hide is only for admin
      }
    },
  })
    .$extends(GameExtension)
    .$extends(UserExtension)
    .$extends(TagExtension);
    
  // Fix: assign to global BEFORE returning
  if (process.env.NODE_ENV !== "production") {
    globalThis.prisma = prisma;
  }
  
  return prisma;
}

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
    // create our bucket if it does not exist (seed when deploy)
    for (const bucketName of Object.values(MINIO_BUCKETS)) {
      // 1. 检查存储桶是否存在
      const exists = await client.bucketExists(bucketName);
      if (!exists) {
        console.log(`Creating bucket: ${bucketName}`);
        await client.makeBucket(bucketName); // self-host, no need to specify region
        // 2. 设置访问策略
        const policy = generateBucketPolicy(
          bucketName,
          accessKey,
          bucketName === MINIO_BUCKETS.UNAUDIT_GAME
        );
        await client.setBucketPolicy(bucketName, JSON.stringify(policy));
      }
    }
    console.log("✅ MinIO connection + bucket check successful");
    
    // Fix: assign the client, not undefined minio variable
    if (process.env.NODE_ENV !== "production") {
      globalThis.minio = client;
    }
    
    return client;
  } catch (error) {
    console.error("❌ MinIO connection failed", error);
    if (process.env.NODE_ENV === "production")
      throw new Error("Failed to connect to MinIO or bucket does not exist");
  }
}

function generateBucketPolicy(
  bucketName: string,
  adminAccessKey: string,
  isPrivate: boolean = false
) {
  const bucketArn = `arn:aws:s3:::${bucketName}`;
  const objectArn = `${bucketArn}/*`;

  const policy = {
    Version: "2012-10-17",
    Statement: [] as any[],
  };

  // 1. 管理员权限（保持不变）
  policy.Statement.push({
    Effect: "Allow",
    Principal: { AWS: [adminAccessKey] },
    Action: ["s3:*"],
    Resource: [bucketArn, objectArn],
  });

  // 2. 私有桶的特殊配置
  if (isPrivate) {
    policy.Statement.push({
      Effect: "Allow",
      Principal: { AWS: ["*"] },
      Action: ["s3:GetObject"],
      Resource: [objectArn],
    });
    // // TODO: 禁止公开访问（核心安全措施），实现困难，just using semi-public
    // policy.Statement.push({
    //   Effect: "Deny",
    //   Principal: "*",
    //   Action: ["s3:*"],
    //   Resource: [bucketArn, objectArn],
    //   Condition: {
    //     Bool: {
    //       "aws:SecureTransport": "false",
    //     },
    //   },
    // });
  } else {
    // 3. 公共读取权限（如果不是私有桶）
    policy.Statement.push({
      Effect: "Allow",
      Principal: { AWS: ["*"] },
      Action: ["s3:GetObject"],
      Resource: [objectArn],
    });
  }
  return policy;
}
