import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
import * as bcrypt from "bcryptjs";
import {
  createMinioClient,
  generateAssetsType,
  setPrismaDefaultConfig,
} from "../lib/dbInitUtils";
import { MINIO_BUCKETS } from "../lib/clientConfig";

const SALT_ROUNDS = 10;

import dotenv from "dotenv";
// awesome that next.js 15 has sharp built-in, webp is old but robust for images
import sharp from "sharp";

// load env from .env.development
// WARNING: all use default environment variables, do not set in .env (.env is for production)
dotenv.config({ path: ".env.development" });

// Instantiate Prisma Client
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Start seeding...");
  const minio = await createMinioClient();

  async function uploadFakeImageAndConvertToWebP(
    bucketName: MINIO_BUCKETS, // Ensure bucketName is one of the required buckets
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
        throw new Error(`Failed to fetch image: ${res}`);
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
    console.log(
      `📸 Successfully uploaded ${objectName} to bucket ${bucketName}`
    );
  }

  // ----------------------------------------
  // SEED USERS
  // ----------------------------------------
  console.log("👤 Seeding users...");
  const createdUsers = [];
  const hashedPassword = await bcrypt.hash(
    process.env.DEFAULT_PASSWORD!,
    SALT_ROUNDS
  );
  console.log(
    `🔑 Default password for all users is "${process.env.DEFAULT_PASSWORD}"`
  );

  await setPrismaDefaultConfig(prisma, hashedPassword);

  // Fetch all created tags to get their IDs for linking later
  const allTags = await prisma.tag.findMany();

  for (let i = 0; i < 15; i++) {
    const hasAvatar = faker.datatype.boolean(0.5); // 50% chance of having an avatar
    const user = await prisma.user.create({
      data: {
        qq: faker.string.uuid(), // Using UUID for guaranteed uniqueness
        name: faker.person.fullName(),
        introduction: faker.lorem.sentence(),
        hash: hashedPassword,
        hasAvatar: hasAvatar,
        // Make the first user an admin for easy testing
        isAdmin: false,
      },
    });
    // make sure to upload an avatar if hasAvatar is true
    const avatarPromiseList = [];
    if (hasAvatar) {
      // STEP 1: Upload avatar image to MinIO, WARNING: no need to repeat uploading again.
      const avatarObjectName = `${user.id}.webp`;
      avatarPromiseList.push(
        uploadFakeImageAndConvertToWebP(MINIO_BUCKETS.AVATAR, avatarObjectName)
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

  // ----------------------------------------
  // SEED GAMES
  // ----------------------------------------
  console.log("🎮 Seeding games...");
  const createdGames = [];
  for (let i = 0; i < 21; i++) {
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
    const assetsType = generateAssetsType(
      faker.helpers.arrayElement([
        { mode: "downloadable" },
        { mode: "fullscreen", useSharedArrayBuffer: faker.datatype.boolean() },
        {
          mode: "embed",
          width: faker.helpers.arrayElement([400, 600, 800, 1080]),
          height: faker.helpers.arrayElement([400, 720, 1080]),
          useSharedArrayBuffer: false, // do not have nginx to support sab header changing at dev.
          isAutoStarted: faker.datatype.boolean(),
          hasFullscreenButton: faker.datatype.boolean(),
          enableScrollbars: faker.datatype.boolean(),
        },
        { mode: "jump", url: faker.internet.url() },
      ])
    );

    const game = await prisma.game.create({
      data: {
        title: `${faker.hacker.adjective()} ${faker.hacker.noun()} #${i}`,
        assetsType: assetsType,
        description: faker.lorem.paragraphs(2),
        isPrivate: faker.datatype.boolean(0.2), // 20% chance of being private
        size: faker.number.int({ min: 50, max: 5 * 1024 }), // 50MB to 5GB
        views: faker.number.int({ min: 0, max: 100000 }),
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
      uploadFakeImageAndConvertToWebP(MINIO_BUCKETS.IMAGE, coverObjectName),
    ];

    for (let j = 0; j < screenshotCount; j++) {
      const screenshotObjectName = `${gameId}/screenshot${j}.webp`;
      screenshotPromise.push(
        uploadFakeImageAndConvertToWebP(
          MINIO_BUCKETS.IMAGE,
          screenshotObjectName
        )
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
  // console.log("💬 Seeding comments...");
  // let commentsCreated = 0;
  // if (createdGames.length > 0 && createdUsers.length > 0) {
  //   for (let i = 0; i < 100; i++) {
  //     const randomUser = faker.helpers.arrayElement(createdUsers);
  //     const randomGame = faker.helpers.arrayElement(createdGames);

  //     await prisma.comment.create({
  //       data: {
  //         content: faker.lorem.paragraph(),
  //         userId: randomUser.id,
  //         gameId: randomGame.id,
  //         // Or connect via relation
  //         // user: { connect: { id: randomUser.id } },
  //         // game: { connect: { id: randomGame.id } },
  //       },
  //     });
  //     commentsCreated++;
  //   }
  // }
  // console.log(`✅ ${commentsCreated} comments created.`);

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
