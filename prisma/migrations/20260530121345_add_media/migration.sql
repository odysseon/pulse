/*
  Warnings:

  - You are about to drop the column `bannerId` on the `business_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `bannerUrl` on the `business_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `businessType` on the `business_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `logoId` on the `business_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `logoUrl` on the `business_profiles` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'PAUSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('NGN', 'USD', 'GBP', 'EUR');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO');

-- CreateEnum
CREATE TYPE "MediaResourceType" AS ENUM ('LISTING', 'BUSINESS_PROFILE');

-- CreateEnum
CREATE TYPE "MediaRole" AS ENUM ('LOGO', 'BANNER', 'COVER', 'GALLERY');

-- AlterTable
ALTER TABLE "business_profiles" DROP COLUMN "bannerId",
DROP COLUMN "bannerUrl",
DROP COLUMN "businessType",
DROP COLUMN "logoId",
DROP COLUMN "logoUrl";

-- DropEnum
DROP TYPE "BusinessType";

-- CreateTable
CREATE TABLE "listings" (
    "id" TEXT NOT NULL,
    "businessProfileId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "status" "ListingStatus" NOT NULL DEFAULT 'DRAFT',
    "minPrice" DECIMAL(18,2),
    "maxPrice" DECIMAL(18,2),
    "currency" "Currency",
    "isNegotiable" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media" (
    "id" TEXT NOT NULL,
    "resourceType" "MediaResourceType" NOT NULL,
    "resourceId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "mediaType" "MediaType" NOT NULL,
    "role" "MediaRole" NOT NULL,
    "order" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "listings_businessProfileId_idx" ON "listings"("businessProfileId");

-- CreateIndex
CREATE INDEX "listings_status_idx" ON "listings"("status");

-- CreateIndex
CREATE INDEX "listings_currency_idx" ON "listings"("currency");

-- CreateIndex
CREATE INDEX "listings_minPrice_idx" ON "listings"("minPrice");

-- CreateIndex
CREATE INDEX "listings_maxPrice_idx" ON "listings"("maxPrice");

-- CreateIndex
CREATE INDEX "listings_isNegotiable_idx" ON "listings"("isNegotiable");

-- CreateIndex
CREATE UNIQUE INDEX "listings_businessProfileId_slug_key" ON "listings"("businessProfileId", "slug");

-- CreateIndex
CREATE INDEX "media_resourceType_resourceId_idx" ON "media"("resourceType", "resourceId");

-- CreateIndex
CREATE INDEX "media_resourceType_resourceId_order_idx" ON "media"("resourceType", "resourceId", "order");

-- CreateIndex
CREATE INDEX "media_resourceType_resourceId_role_idx" ON "media"("resourceType", "resourceId", "role");

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_businessProfileId_fkey" FOREIGN KEY ("businessProfileId") REFERENCES "business_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
