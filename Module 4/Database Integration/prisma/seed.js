const prisma = require('../src/lib/prisma');
const seedPosts = require('../src/data/postSeed');

async function main() {
  let user = await prisma.user.findFirst({
    where: { name: 'Database Integration Seed User' },
  });

  if (!user) {
    user = await prisma.user.create({
      data: { name: 'Database Integration Seed User' },
    });
  }

  for (const post of seedPosts) {
    const existingPost = await prisma.post.findFirst({
      where: { title: post.title, authorId: user.id },
    });

    if (!existingPost) {
      await prisma.post.create({
        data: {
          title: post.title,
          body: post.body,
          authorId: user.id,
        },
      });
    }
  }
}

main()
  .catch((error) => {
    console.error('Database seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
