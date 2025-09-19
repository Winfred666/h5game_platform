import type { PrismaClient } from "@prisma/client";
import { MINIO_BUCKETS } from "./clientConfig";
import * as Minio from "minio";

export async function createMinioClient(): Promise<Minio.Client | undefined> {
  if (!process.env.MINIO_ENDPOINT) {
    throw new Error("MINIO_ENDPOINT is not defined in environment variables");
  }
  const accessKey = process.env.MINIO_ACCESS_KEY || "minioadmin";
  try {
    const client = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT,
      port: 9000, // use container bridge network
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

export function generateBucketPolicy(
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

export async function setPrismaDefaultConfig(
  prisma: PrismaClient,
  hashedPassword: string
) {
  // ----------------------------------------
  // CLEANUP
  // ----------------------------------------
  console.log("🧹 Deleting existing data...");
  // To avoid foreign key constraint errors, we must delete models
  // that have relations to other models first. Comment depends on User and Game.
  // await prisma.comment.deleteMany();
  await prisma.game.deleteMany(); // Deleting a game will also clear implicit relations
  await prisma.user.deleteMany(); // Deleting a user will also clear implicit relations
  await prisma.tag.deleteMany();
  await prisma.configuration.deleteMany();
  console.log("🗑️  Existing data deleted.");

  // SET DEFAULT HASH / SWIPER / DAILY_RECOMMAND ...
  const settings = [
    { key: "DEFAULT_HASH", value: hashedPassword },
    { key: "SWIPER_ID", value: "" },
    { key: "ENABLE_DAILY_RECOMMENDATION", value: "1" },
  ];

  for (const setting of settings) {
    await prisma.configuration.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: { key: setting.key, value: setting.value },
    });
  }
  console.log("⚙️  Default configurations set.");

  await prisma.user.upsert({
    where: { qq: process.env.ADMIN_QQ! },
    update: {
      name: process.env.ADMIN_NAME!,
      hash: hashedPassword,
      isAdmin: true,
    },
    create: {
      qq: process.env.ADMIN_QQ!,
      name: process.env.ADMIN_NAME!,
      hash: hashedPassword,
      isAdmin: true,
    },
  });

  console.log(
    `🔑 Default admin user created. QQ: ${process.env.ADMIN_QQ}, Name: ${process.env.ADMIN_NAME}`
  );

  // setting tags.
  // ----------------------------------------
  // SEED TAGS
  // ----------------------------------------
  console.log("🏷️ Seeding tags...");
  const tagNames = [
    "横版跳跃",
    "休闲益智",
    "敏捷",
    "恐怖",
    "解谜",
    "视觉小说",
    "音乐节奏",
    "角色扮演",
    "竞速驾驶",
    "射击",
    "沙盒",
    "卡牌",
    "塔防",
    "回合制",
    "模拟经营",
    "即时战略",
    "Roguelike",
    "多人",
    "3D",
    "2D",
    "OR工作室-2024",
    "求是潮",
  ];
  await prisma.tag.createMany({
    data: tagNames.map((name) => ({ name })),
  });

  console.log(`✅ ${tagNames.length} tags created.`);
}

export type AssetsTypeConfig = | { mode: "downloadable" }
    | { mode: "fullscreen"; useSharedArrayBuffer: boolean }
    | {
        mode: "embed";
        useSharedArrayBuffer: boolean;
        width?: number;
        height?: number;
        isAutoStarted?: boolean;
        hasFullscreenButton?: boolean;
        enableScrollbars?: boolean;
      }
    | { mode: "jump"; url: string };
    
export function generateAssetsType(
  config: AssetsTypeConfig
): string {
  switch (config.mode) {
    case "downloadable":
      return "";
    case "fullscreen":
      return `fullscreen|${config.useSharedArrayBuffer ? 1 : 0}`;
    case "embed":
      return `embed|${config.width || 0}|${config.height || 0}|${
        config.useSharedArrayBuffer ? 1 : 0
      }|${config.isAutoStarted ? 1 : 0}|${
        config.hasFullscreenButton ? 1 : 0
      }|${config.enableScrollbars ? 1 : 0}`;
    case "jump":
      return `jump|${config.url}`;
    default: {
      const _exhaustive: never = config;
      return _exhaustive;
    }
  }
}
