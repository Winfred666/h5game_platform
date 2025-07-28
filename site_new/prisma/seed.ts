export {};

import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
import * as bcrypt from "bcryptjs";
import * as Minio from "minio";

// awesome that next.js 15 has sharp built-in, webp is a great format for images
import sharp from "sharp";


// WARNING: all use default environment variables, do not set in .env (.env is for production)
const DEFAULT_PASSWORD = "password123"; // WARNING: Only for development, do not use in production
const ADMIN_QQ = "10000000"; // Default admin QQ, used for the first user

const REQUIRED_BUCKETS = [
  "games",
  "unaudit-games",
  "images",
  "avatars",
] as const;

// Instantiate Prisma Client
const prisma = new PrismaClient();
const minio = await createMinioClient();

// 创建 MinIO 客户端实例的函数
async function createMinioClient(): Promise<Minio.Client | undefined> {
  const accessKey = process.env.MINIO_ACCESS_KEY || "minioadmin";
  try {
    const client = new Minio.Client({
      endPoint: "localhost",
      port: 9000, // use container bridge network, may not need internal port
      accessKey,
      secretKey: process.env.MINIO_SECRET_KEY || "minioadmin",
      useSSL: false, // only access local MinIO server, set to true if using HTTPS
    });
    // create our bucket if it does not exist.
    for (const bucketName of REQUIRED_BUCKETS) {
      // 1. 检查存储桶是否存在
      const exists = await client.bucketExists(bucketName);
      // 开发环境中可直接删除原始存储桶
      if (exists) {
        // 1. 列出所有对象并删除
        const objectsStream = client.listObjects(bucketName, "", true);
        const deletePromises = [];
        for await (const obj of objectsStream) {
          deletePromises.push(client.removeObject(bucketName, obj.name));
          console.log(`🗑️ Deleting object: ${obj.name}`);
        }

        // 2. 等待所有删除完成
        await Promise.all(deletePromises);
        await client.removeBucket(bucketName);
      }
      console.log(`Creating bucket: ${bucketName}`);
      await client.makeBucket(bucketName); // self-host, no need to specify region

      // 2. 设置访问策略
      const policy = generateBucketPolicy(
        bucketName,
        accessKey,
        bucketName === "unaudit-games"
      );
      await client.setBucketPolicy(bucketName, JSON.stringify(policy, null, 2));
    }
    console.log("✅ MinIO connection + bucket check successful");
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
    Statement: [] as unknown[],
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
    // 禁止公开访问（核心安全措施）
    policy.Statement.push(
      // 2. 禁止匿名访问
      {
        Effect: "Deny",
        Principal: "*",
        Action: "s3:*",
        Condition: {
          StringNotLike: {
            // MinIO兼容的认证标记
            "s3:authType": ["RSA-COMMON"],
          },
        },
        Resource: [
          `arn:aws:s3:::${bucketName}`,
          `arn:aws:s3:::${bucketName}/*`,
        ],
      }
    );
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

async function uploadFakeImageAndConvertToWebP(
  bucketName: (typeof REQUIRED_BUCKETS)[number], // Ensure bucketName is one of the required buckets
  objectName: string
) {
  if (!minio) throw new Error("MinIO client is not initialized.");
  // 1. Fetch a random image from a placeholder service
  // Using picsum.photos for random images.

  const imageResponse = await fetch(
    `https://picsum.photos/${bucketName === "avatars" ? "200" : "400/300"}`,
    {
      method: "GET",
      headers: {
        Accept: "image/webp", // Specify the image type you want
      },
    }
  ).then((res) => {
    if (!res.ok) {
      throw new Error(`Failed to fetch image: ${res.statusText}`);
    }
    return res.arrayBuffer();
  });

  // 2. Convert the image buffer to WebP format using Sharp
  const webpBuffer =
    bucketName === "avatars"
      ? await sharp(imageResponse)
          .resize(200, 200, {
            fit: "cover",
            position: "center",
          })
          .webp({ quality: 70 })
          .toBuffer()
      : await sharp(imageResponse)
          .webp({ quality: 80 }) // std quality for WebP
          .toBuffer();
  // 3. Upload the WebP buffer to MinIO
  await minio.putObject(bucketName, objectName, webpBuffer, undefined, {
    "Content-Type": "image/webp", // Set the correct content type for WebP
  });
  console.log(`📸 Successfully uploaded ${objectName} to bucket ${bucketName}`);
}

async function main() {
  console.log("🌱 Start seeding...");

  // ----------------------------------------
  // CLEANUP
  // ----------------------------------------
  console.log("🧹 Deleting existing data...");
  // To avoid foreign key constraint errors, we must delete models
  // that have relations to other models first. Comment depends on User and Game.
  await prisma.comment.deleteMany();
  await prisma.game.deleteMany(); // Deleting a game will also clear implicit relations
  await prisma.user.deleteMany(); // Deleting a user will also clear implicit relations
  await prisma.tag.deleteMany();
  console.log("🗑️ Existing data deleted.");

  // ----------------------------------------
  // SEED TAGS
  // ----------------------------------------
  console.log("🏷️ Seeding tags...");
  const tagNames = [
    "Action",
    "RPG",
    "Puzzle",
    "Strategy",
    "Adventure",
    "Simulation",
    "Sports",
    "MMO",
    "Indie",
    "Arcade",
    "Fighting",
    "Shooter",
    "Platformer",
    "Racing",
  ];

  await prisma.tag.createMany({
    data: tagNames.map((name) => ({ name })),
  });
  console.log(`✅ ${tagNames.length} tags created.`);

  // Fetch all created tags to get their IDs for linking later
  const allTags = await prisma.tag.findMany();

  // ----------------------------------------
  // SEED USERS
  // ----------------------------------------
  console.log("👤 Seeding users...");
  const createdUsers = [];
  const saltRounds = 10; // Standard salt rounds for bcrypt
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, saltRounds);
  console.log(`🔑 Default password for all users is "${DEFAULT_PASSWORD}"`);

  for (let i = 0; i < 15; i++) {
    const hasAvatar = faker.datatype.boolean(0.5); // 50% chance of having an avatar
    const user = await prisma.user.create({
      data: {
        qq: i==0 ? ADMIN_QQ : faker.string.uuid(), // Using UUID for guaranteed uniqueness
        name: faker.person.fullName(),
        introduction: faker.lorem.sentence(),
        hash: hashedPassword,
        hasAvatar: hasAvatar,
        // Make the first user an admin for easy testing
        isAdmin: i === 0,
      },
    });
    // make sure to upload an avatar if hasAvatar is true
    const avatarPromiseList = [];
    if (hasAvatar) {
      // STEP 1: Upload avatar image to MinIO, WARNING: no need to repeat uploading again.
      const avatarObjectName = `${user.id}.webp`;
      avatarPromiseList.push(
        uploadFakeImageAndConvertToWebP("avatars", avatarObjectName)
      );
    }
    Promise.all(avatarPromiseList)
      .then(() => {
        console.log(`✅ Avatar for user ${user.name} uploaded successfully.`);
      })
      .catch((err) => {
        console.error(`❌ Failed to upload avatar for user ${user.name}:`, err);
      });
    createdUsers.push(user);
  }
  console.log(`✅ ${createdUsers.length} users created.`);
  if (createdUsers.length > 0) {
    console.log(
      `👑 Admin user created: ${createdUsers[0].name} (${createdUsers[0].qq})`
    );
  }

  // ----------------------------------------
  // SEED GAMES
  // ----------------------------------------
  console.log("🎮 Seeding games...");
  const createdGames = [];
  for (let i = 0; i < 10; i++) {
    // 1. Select 1 to 3 random developers (users) for this game
    const numDevelopers = faker.number.int({ min: 1, max: 3 });
    const selectedDevelopers = faker.helpers
      .shuffle(createdUsers)
      .slice(0, numDevelopers);

    // 2. Select 2 to 5 random tags for this game
    const numTags = faker.number.int({ min: 2, max: 5 });
    const selectedTags = faker.helpers.shuffle(allTags).slice(0, numTags);

    // --- Create the Game record with its relations ---
    const screenshotCount = faker.number.int({ min: 0, max: 4 });
    const game = await prisma.game.create({
      data: {
        title: `${faker.hacker.adjective()} ${faker.hacker.noun()} #${i}`,
        isOnline: faker.datatype.boolean(),
        width: faker.helpers.arrayElement([1024, 1280, 1920, null]),
        height: faker.helpers.arrayElement([768, 720, 1080, null]),
        description: faker.lorem.paragraphs(2),
        isPrivate: faker.datatype.boolean(0.2), // 20% chance of being private
        size: faker.number.int({ min: 50, max: 5 * 1024 }), // 50MB to 5GB
        views: faker.number.int({ min: 0, max: 100000 }),
        downloads: faker.number.int({ min: 0, max: 25000 }),
        screenshotCount: screenshotCount,

        // --- RELATIONAL FIELDS ---
        // This is the correct implicit many-to-many connection syntax
        developers: {
          connect: selectedDevelopers.map((user) => ({ id: user.id })),
        },
        tags: {
          connect: selectedTags.map((tag) => ({ id: tag.id })),
        },
      },
    });
    // add game cover and screenshots URLs based on the game ID
    const gameId = game.id;

    // STEP 3: Upload images to MinIO using the game ID
    // Upload Cover Image
    const coverObjectName = `${gameId}/cover.webp`;
    // Upload Screenshots
    const screenshotPromise = [
      uploadFakeImageAndConvertToWebP("images", coverObjectName),
    ];

    for (let j = 0; j < screenshotCount; j++) {
      const screenshotObjectName = `${gameId}/screenshot${j}.webp`;
      screenshotPromise.push(
        uploadFakeImageAndConvertToWebP("images", screenshotObjectName)
      );
    }
    createdGames.push(game);
    Promise.all(screenshotPromise)
      .then(() => {
        console.log(`✅ Images for game ${game.title} uploaded successfully.`);
      })
      .catch((err) => {
        console.error(
          `❌ Failed to upload screenshots for game ${game.title}:`,
          err
        );
      });
  }

  console.log(`✅ ${createdGames.length} games created with relations.`);

  // ----------------------------------------
  // SEED COMMENTS (NEW)
  // ----------------------------------------
  console.log("💬 Seeding comments...");
  let commentsCreated = 0;
  if (createdGames.length > 0 && createdUsers.length > 0) {
    for (let i = 0; i < 100; i++) {
      const randomUser = faker.helpers.arrayElement(createdUsers);
      const randomGame = faker.helpers.arrayElement(createdGames);

      await prisma.comment.create({
        data: {
          content: faker.lorem.paragraph(),
          userId: randomUser.id,
          gameId: randomGame.id,
          // Or connect via relation
          // user: { connect: { id: randomUser.id } },
          // game: { connect: { id: randomGame.id } },
        },
      });
      commentsCreated++;
    }
  }
  console.log(`✅ ${commentsCreated} comments created.`);

  console.log("✨ Seeding finished.");
}

main()
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    // close the Prisma Client at the end
    await prisma.$disconnect();
  });
