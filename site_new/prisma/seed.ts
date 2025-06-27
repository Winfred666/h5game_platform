import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcryptjs';

// Instantiate Prisma Client
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Start seeding...');

  // ----------------------------------------
  // CLEANUP
  // ----------------------------------------
  console.log('🧹 Deleting existing data...');
  // To avoid foreign key constraint errors, we must delete models
  // that have relations to other models first. Comment depends on User and Game.
  await prisma.comment.deleteMany();
  await prisma.game.deleteMany(); // Deleting a game will also clear implicit relations
  await prisma.user.deleteMany(); // Deleting a user will also clear implicit relations
  await prisma.tag.deleteMany();
  console.log('🗑️ Existing data deleted.');

  // ----------------------------------------
  // SEED TAGS
  // ----------------------------------------
  console.log('🏷️ Seeding tags...');
  const tagNames = [
    'Action', 'RPG', 'Puzzle', 'Strategy', 'Adventure',
    'Simulation', 'Sports', 'MMO', 'Indie', 'Arcade',
    'Fighting', 'Shooter', 'Platformer', 'Racing',
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
  console.log('👤 Seeding users...');
  const createdUsers = [];
  const saltRounds = 10; // Standard salt rounds for bcrypt
  const defaultPassword = 'password123'; // WARNING: Only for development.
  const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);
  console.log(`🔑 Default password for all users is "${defaultPassword}"`);

  for (let i = 0; i < 15; i++) {
    const user = await prisma.user.create({
      data: {
        qq: faker.string.uuid(), // Using UUID for guaranteed uniqueness
        name: faker.person.fullName(),
        introduction: faker.lorem.sentence(),
        hash: hashedPassword,
        // Make the first user an admin for easy testing
        isAdmin: i === 0,
      },
    });
    createdUsers.push(user);
  }
  console.log(`✅ ${createdUsers.length} users created.`);
  if (createdUsers.length > 0) {
    console.log(`👑 Admin user created: ${createdUsers[0].name} (${createdUsers[0].qq})`);
  }

  // ----------------------------------------
  // SEED GAMES
  // ----------------------------------------
  console.log('🎮 Seeding games...');
  const createdGames = [];
  for (let i = 0; i < 50; i++) {
    // 1. Select 1 to 3 random developers (users) for this game
    const numDevelopers = faker.number.int({ min: 1, max: 3 });
    const selectedDevelopers = faker.helpers.shuffle(createdUsers).slice(0, numDevelopers);
    
    // 2. Select 2 to 5 random tags for this game
    const numTags = faker.number.int({ min: 2, max: 5 });
    const selectedTags = faker.helpers.shuffle(allTags).slice(0, numTags);

    // --- Create the Game record with its relations ---
    const screenshotCount = faker.number.int({ min: 0, max: 3 });
    const game = await prisma.game.create({
      data: {
        title: `${faker.hacker.adjective()} ${faker.hacker.noun()} #${i}`,
        isOnline: faker.datatype.boolean(),
        width: faker.helpers.arrayElement([1024, 1280, 1920, null]),
        height: faker.helpers.arrayElement([768, 720, 1080, null]),
        description: faker.lorem.paragraphs(2),
        isPrivate: faker.datatype.boolean(0.2), // 20% chance of being private
        size: faker.number.int({ min: 50 * 1024, max: 5 * 1024 * 1024 }), // 50MB to 5GB in KB
        views: faker.number.int({ min: 0, max: 100000 }),
        downloads: faker.number.int({ min: 0, max: 25000 }),
        screenshotCount: screenshotCount,
        
        // --- RELATIONAL FIELDS ---
        // This is the correct implicit many-to-many connection syntax
        developers: {
          connect: selectedDevelopers.map(user => ({ id: user.id })),
        },
        tags: {
          connect: selectedTags.map(tag => ({ id: tag.id })),
        },
      },
    });
    // add game cover and screenshots URLs based on the game ID
    
    createdGames.push(game);
  }
  console.log(`✅ ${createdGames.length} games created with relations.`);

  // ----------------------------------------
  // SEED COMMENTS (NEW)
  // ----------------------------------------
  console.log('💬 Seeding comments...');
  let commentsCreated = 0;
  if(createdGames.length > 0 && createdUsers.length > 0) {
    for(let i=0; i<100; i++) {
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
        }
      });
      commentsCreated++;
    }
  }
  console.log(`✅ ${commentsCreated} comments created.`);


  console.log('✨ Seeding finished.');
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