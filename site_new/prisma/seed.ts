import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

// Instantiate Prisma Client
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Start seeding...');

  // ----------------------------------------
  // CLEANUP
  // ----------------------------------------
  console.log('🧹 Deleting existing data...');
  // The order of deletion matters to avoid foreign key constraint errors.
  // Delete Game records first, as they have relations to User.
  await prisma.game.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tag.deleteMany();
  console.log('🗑️ Existing data deleted.');

  // ----------------------------------------
  // SEED TAGS
  // ----------------------------------------
  console.log('🏷️ Seeding tags...');
  const tagNames = [
    'Action',
    'RPG',
    'Puzzle',
    'Strategy',
    'Adventure',
    'Simulation',
    'Sports',
    'MMO',
    'Indie',
    'Arcade',
  ];

  await prisma.tag.createMany({
    data: tagNames.map((name) => ({ name })),
  });
  console.log(`✅ ${tagNames.length} tags created.`);

  // ----------------------------------------
  // SEED USERS
  // ----------------------------------------
  console.log('👤 Seeding users...');
  const users = [];
  for (let i = 0; i < 10; i++) {
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        name: faker.person.fullName(),
      },
    });
    users.push(user);
  }
  console.log(`✅ ${users.length} users created.`);

  // ----------------------------------------
  // SEED GAMES
  // ----------------------------------------
  console.log('🎮 Seeding games...');
  for (let i = 0; i < 25; i++) {
    // Select 1 to 3 random authors for this game
    const numAuthors = faker.number.int({ min: 1, max: 3 });
    const authorConnects = faker.helpers
      .shuffle(users)
      .slice(0, numAuthors)
      .map((user) => ({ id: user.id }));

    // Select 2 to 4 random tags for this game and format as "a,b,c"
    const numTags = faker.number.int({ min: 2, max: 4 });
    const gameTagsString = faker.helpers
      .shuffle(tagNames)
      .slice(0, numTags)
      .join(',');

    await prisma.game.create({
      data: {
        title: `${faker.hacker.adjective()} ${faker.hacker.noun()} Game #${i}`,
        isOnline: faker.datatype.boolean(),
        width: faker.helpers.arrayElement([1024, 1280, 1920]),
        height: faker.helpers.arrayElement([768, 720, 1080]),
        description: faker.lorem.paragraph(),
        isPrivate: faker.datatype.boolean(0.2), // 20% chance of being private
        size: faker.number.int({ min: 100000000/1024, max: 99000000000/1024 }),
        views: faker.number.int({ min: 0, max: 1000000 }),
        downloads: faker.number.int({ min: 0, max: 250000 }),
        // --- RELATIONAL & CUSTOM FIELDS ---
        tags: gameTagsString,
        developers: {
          // This is how you connect a many-to-many relationship in Prisma
          connect: authorConnects,
        },
      },
    });
  }
  console.log('✅ 25 games created.');

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