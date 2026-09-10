import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { ConfigService } from '@nestjs/config';
import { describe, beforeAll, afterAll, it, expect } from 'vitest';
import { Redis } from 'ioredis';
import { MailAdapter } from '../src/mail/mail.adapter.js';

// Utility to sleep for a bit to allow async events to process
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function cleanDatabase(prisma: PrismaService) {
  const tablenames = await prisma.$queryRaw<Array<{ tablename: string }>>`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== '_prisma_migrations')
    .filter((name) => name !== 'spatial_ref_sys') // PostGIS stuff
    .filter((name) => !['categories', 'category_attributes', 'category_discovery_policies', 'business_categories', 'tags'].includes(name))
    .map((name) => `"public"."${name}"`)
    .join(', ');

  try {
    if (tables.length > 0) {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
    }
  } catch (error) {
    console.error('Failed to clean database', error);
  }
}

describe('Listing Publication Flow (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let httpServer: any;
  let redisClient: Redis;

  // State shared between tests
  let businessToken: string;
  let followerToken: string;
  let businessId: string;
  let listingId: string;
  let categoryId: string;
  let categorySlug: string;
  const runId = Math.random().toString(36).substring(7);
  const businessEmail = `biz_${runId}@example.com`;
  const followerEmail = `foll_${runId}@example.com`;
  const password = 'Password123!';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(MailAdapter)
      .useValue({
        sendMail: async () => {},
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    const configService = app.get(ConfigService);
    app.setGlobalPrefix(configService.get<string>('GLOBAL_PREFIX') || 'api');
    await app.init();
    
    prisma = app.get<PrismaService>(PrismaService);
    httpServer = app.getHttpServer();
    redisClient = new Redis(); // default redis connection to fetch OTP

    // Clear DB before we start
    await cleanDatabase(prisma);
    
    // Clear Redis cache (this was causing the "No categories found" error since Redis cached the empty tree)
    await redisClient.flushall();
  });

  afterAll(async () => {
    // Clear DB after we finish
    await cleanDatabase(prisma);
    await redisClient.quit();
    await app.close();
  });

  it('1. Register User A (Business)', async () => {
    // Register
    const regRes = await request(httpServer)
      .post('/api/accounts/register')
      .send({ email: businessEmail, password, username: 'businessowner' });
      
    if (regRes.status !== 201) throw new Error(JSON.stringify(regRes.body));
    
    // Login
    const loginRes = await request(httpServer)
      .post('/api/auth/login')
      .send({ email: businessEmail, password });
      
    if (loginRes.status !== 200) throw new Error(JSON.stringify(loginRes.body));
    
    businessToken = loginRes.body.token;
    expect(businessToken).toBeDefined();
  });

  it('2. Create and Publish Business Profile', async () => {
    const catRes = await request(httpServer).get('/api/categories');
    if (catRes.status !== 200) throw new Error(JSON.stringify(catRes.body));
    
    // Pick the first leaf category
    categoryId = catRes.body[0]?.children?.[0]?.id || catRes.body[0]?.id;
    categorySlug = catRes.body[0]?.children?.[0]?.slug || catRes.body[0]?.slug;
    if (!categoryId) throw new Error('No categories found.');

    // Create Profile
    const profileRes = await request(httpServer)
      .post('/api/business')
      .set('Authorization', `Bearer ${businessToken}`)
      .send({
        name: `E2E Electronics ${runId}`,
        description: 'Best electronics in town.',
        businessType: 'PHYSICAL',
        contactPhone: '+2348000000000',
        whatsapp: '+2348000000000',
        contactEmail: businessEmail,
        location: 'Lagos, Nigeria',
        latitude: 40.7128,
        longitude: -74.006,
        primaryCategoryId: categoryId
      });
      
    if (profileRes.status !== 201) throw new Error(JSON.stringify(profileRes.body));
    
    businessId = profileRes.body.id;
    
    // Inject a cover URL to bypass cover photo requirement
    await prisma.media.create({
      data: {
        fileId: `cover-${businessId}`,
        mediaType: 'IMAGE',
        role: 'BANNER',
        mimeType: 'image/jpeg',
        provider: 'CLOUDINARY',
        businessProfileId: businessId,
      }
    });
    
    // Invalidate the cache since we updated DB directly
    await redisClient.del(`businessProfile:id:${businessId}`);
    
    // Publish
    const verifyRes = await request(httpServer)
      .post(`/api/business/${businessId}/publish`)
      .set('Authorization', `Bearer ${businessToken}`);
    if (verifyRes.status !== 200) throw new Error(JSON.stringify(verifyRes.body));
  });

  it('3. Register User B (Follower)', async () => {
    // Register
    const regRes = await request(httpServer)
      .post('/api/accounts/register')
      .send({ email: followerEmail, password, username: 'loyalfollower' });
      
    if (regRes.status !== 201) throw new Error(JSON.stringify(regRes.body));
    
    // Login
    const loginRes = await request(httpServer)
      .post('/api/auth/login')
      .send({ email: followerEmail, password });
    if (loginRes.status !== 200) throw new Error(JSON.stringify(loginRes.body));
    
    followerToken = loginRes.body.token;
    expect(followerToken).toBeDefined();
  });

  it('4. User B follows Business A', async () => {
    const followRes = await request(httpServer)
      .post(`/api/v1/follows/business/${businessId}`)
      .set('Authorization', `Bearer ${followerToken}`);
    if (followRes.status !== 201) throw new Error(JSON.stringify(followRes.body));
  });

  it('5. Business A publishes a listing', async () => {
    // Fetch attributes for category
    const attrRes = await request(httpServer).get(`/api/categories/${categorySlug}/attributes`);
    const attributesPayload: Record<string, string | number> = {};
    if (attrRes.status === 200 && Array.isArray(attrRes.body)) {
      attrRes.body.forEach((attr: any) => {
        if (attr.isRequired) {
          if (attr.type === 'NUMBER') {
            attributesPayload[attr.key] = attr.min ?? 1;
          } else if (attr.type === 'SELECT' || attr.type === 'MULTI_SELECT') {
            attributesPayload[attr.key] = attr.options[0];
          } else {
            attributesPayload[attr.key] = 'Mock Value';
          }
        }
      });
    }

    // Create Draft Listing
    const listRes = await request(httpServer)
      .post('/api/listings')
      .set('Authorization', `Bearer ${businessToken}`)
      .send({
        title: `PlayStation 5 - ${runId}`,
        description: 'Brand new console',
        categoryId,
        price: { minPrice: 800000, isNegotiable: false, currencyCode: 'NGN' },
        attributes: attributesPayload,
      });
      
    if (listRes.status !== 201) throw new Error(JSON.stringify(listRes.body));
      
    listingId = listRes.body.id;
    
    // Inject a cover URL to bypass listing cover photo requirement
    await prisma.media.create({
      data: {
        fileId: `cover-${listingId}`,
        mediaType: 'IMAGE',
        role: 'COVER',
        mimeType: 'image/jpeg',
        provider: 'CLOUDINARY',
        listingId: listingId,
      }
    });
    
    // Invalidate the cache since we updated DB directly
    await redisClient.del(`listing:id:${listingId}`);
    
    // Publish Listing
    const pubRes = await request(httpServer)
      .patch(`/api/listings/${listingId}/status`)
      .set('Authorization', `Bearer ${businessToken}`)
      .send({ status: 'PUBLISHED' });
    if (pubRes.status !== 200) throw new Error(JSON.stringify(pubRes.body));
  });

  it('6. Follower receives notification and feed updates', async () => {
    // Wait for BullMQ/events to process
    console.log('Waiting for background events to process...');
    
    let notificationFound = false;
    let feedFound = false;
    
    // Poll for up to 5 seconds
    for (let i = 0; i < 10; i++) {
      await sleep(500); // Wait 500ms
      
      // Check Notifications
      if (!notificationFound) {
        const notifRes = await request(httpServer)
          .get('/api/notifications')
          .set('Authorization', `Bearer ${followerToken}`);
          
        if (notifRes.status === 200) {
          const items = notifRes.body.items || [];
          if (items.length > 0) {
            notificationFound = true;
          }
        }
      }
      
      // Check Feed
      if (!feedFound) {
        // Match the business location to be within 50km feed radius
        const feedRes = await request(httpServer)
          .get('/api/feed?lat=40.7128&lng=-74.006')
          .set('Authorization', `Bearer ${followerToken}`);
          
        if (feedRes.status === 200) {
          const items = feedRes.body || [];
          const hasListing = items.some((item: any) => item.listing?.id === listingId);
          if (hasListing) {
            feedFound = true;
          }
        }
      }
      
      if (notificationFound && feedFound) {
        break;
      }
    }
    
    expect(notificationFound).toBe(true);
    expect(feedFound).toBe(true);
  }, 10000); // Increase timeout for polling
});
