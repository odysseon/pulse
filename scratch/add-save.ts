import { PrismaService } from '../src/prisma/prisma.service.js';

const prisma = new PrismaService();

async function main() {
  const userId = 'cmqozdcs80002stfxlzth6wmo';
  const listingId = 'cmqozddd3001ostfxmc77065k';

  const save = await prisma.savedListing.create({
    data: {
      userId,
      listingId,
    }
  });
  console.log('Saved listing manually:', save);
}

main().catch(console.error).finally(() => prisma.$disconnect());
