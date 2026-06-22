import { PrismaService } from '../src/prisma/prisma.service.js';

const prisma = new PrismaService();

async function main() {
  const users = await prisma.user.findMany();
  console.log('Total Users:', users.length);
  console.log('Users:', users.map(u => ({ id: u.id, name: u.name, accountId: u.accountId })));

  const listings = await prisma.listing.findMany({ select: { id: true, title: true } });
  console.log('Total Listings:', listings.length);
  console.log('Listings:', listings);

  const saves = await prisma.savedListing.findMany();
  console.log('Total Saved Listings:', saves.length);
  console.log('Saved Listings:', saves);

  const savedBusinesses = await prisma.savedBusiness.findMany();
  console.log('Total Saved Businesses:', savedBusinesses.length);
  console.log('Saved Businesses:', savedBusinesses);
}

main().catch(console.error).finally(() => prisma.$disconnect());
