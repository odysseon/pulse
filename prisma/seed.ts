import { PrismaClient, PlatformRole } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { Argon2PasswordHasher } from "@odysseon/whoami-adapter-argon2";
import "dotenv/config";

// Create and configure the PrismaClient instance
const adapter = new PrismaPg({
  connectionString: process.env["DATABASE_URL"],
});

export const prisma = new PrismaClient({ adapter });
const hasher = new Argon2PasswordHasher();
const password = process.env["ADMIN_PASSWORD"];
const email = process.env["ADMIN_EMAIL"];

// ---------------------------------------------------------------------------
// Category taxonomy
// ---------------------------------------------------------------------------

const taxonomy: {
  name: string;
  slug: string;
  description?: string;
  order: number;
  children: { name: string; slug: string; description?: string; order: number }[];
}[] = [
  {
    name: "Food & Beverage",
    slug: "food-and-beverage",
    description: "Restaurants, caterers, food producers, and drink vendors",
    order: 0,
    children: [
      { name: "Restaurants", slug: "restaurants", order: 0 },
      { name: "Bakeries & Pastries", slug: "bakeries-and-pastries", order: 1 },
      { name: "Catering Services", slug: "catering-services", order: 2 },
      { name: "Beverages & Drinks", slug: "beverages-and-drinks", order: 3 },
    ],
  },
  {
    name: "Professional Services",
    slug: "professional-services",
    description: "Legal, financial, consulting, and advisory firms",
    order: 1,
    children: [
      { name: "Legal", slug: "legal", order: 0 },
      { name: "Accounting & Finance", slug: "accounting-and-finance", order: 1 },
      { name: "Consulting", slug: "consulting", order: 2 },
      { name: "HR & Recruitment", slug: "hr-and-recruitment", order: 3 },
    ],
  },
  {
    name: "Logistics & Transport",
    slug: "logistics-and-transport",
    description: "Freight, delivery, warehousing, and courier services",
    order: 2,
    children: [
      { name: "Freight & Haulage", slug: "freight-and-haulage", order: 0 },
      { name: "Last-Mile Delivery", slug: "last-mile-delivery", order: 1 },
      { name: "Warehousing", slug: "warehousing", order: 2 },
      { name: "Courier Services", slug: "courier-services", order: 3 },
    ],
  },
  {
    name: "Retail & Trade",
    slug: "retail-and-trade",
    description: "Shops, traders, and consumer goods vendors",
    order: 3,
    children: [
      { name: "Fashion & Apparel", slug: "fashion-and-apparel", order: 0 },
      { name: "Electronics", slug: "electronics", order: 1 },
      { name: "Building Materials", slug: "building-materials", order: 2 },
      { name: "Groceries & Supermarkets", slug: "groceries-and-supermarkets", order: 3 },
    ],
  },
  {
    name: "Health & Wellness",
    slug: "health-and-wellness",
    description: "Clinics, pharmacies, fitness, and beauty",
    order: 4,
    children: [
      { name: "Clinics & Hospitals", slug: "clinics-and-hospitals", order: 0 },
      { name: "Pharmacies", slug: "pharmacies", order: 1 },
      { name: "Fitness & Gyms", slug: "fitness-and-gyms", order: 2 },
      { name: "Beauty & Personal Care", slug: "beauty-and-personal-care", order: 3 },
    ],
  },
  {
    name: "Technology",
    slug: "technology",
    description: "Software, IT support, digital marketing, and data services",
    order: 5,
    children: [
      { name: "Software Development", slug: "software-development", order: 0 },
      { name: "IT Support & Repairs", slug: "it-support-and-repairs", order: 1 },
      { name: "Digital Marketing", slug: "digital-marketing", order: 2 },
      { name: "Data & Analytics", slug: "data-and-analytics", order: 3 },
    ],
  },
  {
    name: "Education & Training",
    slug: "education-and-training",
    description: "Schools, tutors, vocational training, and online courses",
    order: 6,
    children: [
      { name: "Schools & Tutoring", slug: "schools-and-tutoring", order: 0 },
      { name: "Vocational Training", slug: "vocational-training", order: 1 },
      { name: "Online Courses", slug: "online-courses", order: 2 },
    ],
  },
  {
    name: "Real Estate",
    slug: "real-estate",
    description: "Residential, commercial, and land property",
    order: 7,
    children: [
      { name: "Residential Property", slug: "residential-property", order: 0 },
      { name: "Commercial Property", slug: "commercial-property", order: 1 },
      { name: "Land & Property", slug: "land-and-property", order: 2 },
    ],
  },
  {
    name: "Events & Hospitality",
    slug: "events-and-hospitality",
    description: "Event planning, hotels, and entertainment venues",
    order: 8,
    children: [
      { name: "Event Planning", slug: "event-planning", order: 0 },
      { name: "Hotels & Lodging", slug: "hotels-and-lodging", order: 1 },
      { name: "Entertainment & Venues", slug: "entertainment-and-venues", order: 2 },
    ],
  },
  {
    name: "Agriculture",
    slug: "agriculture",
    description: "Farming, livestock, and agro-processing",
    order: 9,
    children: [
      { name: "Crop Farming", slug: "crop-farming", order: 0 },
      { name: "Livestock & Poultry", slug: "livestock-and-poultry", order: 1 },
      { name: "Agro-processing", slug: "agro-processing", order: 2 },
    ],
  },
];

async function main() {
  if (!password || !email) {
    throw new Error("ADMIN_PASSWORD environment variable is not set");
  }
  const hashedPassword = await hasher.hash(password);

  console.log("🌱 Seeding Admin Account and User profile...");

  const account = await prisma.account.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash: {
        create: {
          hash: hashedPassword,
        },
      },
      user: {
        create: {
          name: "Steven Aanu",
          role: PlatformRole.ADMIN,
          avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Steven",
        },
      },
    },
    include: {
      user: true,
      passwordHash: true,
    },
  });

  console.log(`✅ Admin created with ID: ${account.id}`);
  console.log(`✅ User profile linked: ${account.user?.name}`);

  // -------------------------------------------------------------------------
  // Category taxonomy — idempotent (upsert by slug)
  // -------------------------------------------------------------------------
  console.log("\n🌱 Seeding category taxonomy...");

  for (const root of taxonomy) {
    const rootRecord = await (prisma as any).category.upsert({
      where: { slug: root.slug },
      update: { name: root.name, description: root.description ?? null, order: root.order },
      create: {
        name: root.name,
        slug: root.slug,
        description: root.description ?? null,
        order: root.order,
        parentId: null,
      },
    });

    console.log(`  ✅ Root: ${root.name}`);

    for (const leaf of root.children) {
      await (prisma as any).category.upsert({
        where: { slug: leaf.slug },
        update: { name: leaf.name, description: leaf.description ?? null, order: leaf.order },
        create: {
          name: leaf.name,
          slug: leaf.slug,
          description: leaf.description ?? null,
          order: leaf.order,
          parentId: rootRecord.id,
        },
      });
      console.log(`    └── ${leaf.name}`);
    }
  }

  console.log("\n✅ Category taxonomy seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
