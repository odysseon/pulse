/*
  Warnings:

  - You are about to drop the column `storeTourId` on the `media` table. All the data in the column will be lost.
  - You are about to drop the `store_tour_highlights` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `store_tours` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "BusinessTourStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- DropForeignKey
ALTER TABLE "media" DROP CONSTRAINT "media_storeTourId_fkey";

-- DropForeignKey
ALTER TABLE "store_tour_highlights" DROP CONSTRAINT "store_tour_highlights_storeTourId_fkey";

-- DropForeignKey
ALTER TABLE "store_tours" DROP CONSTRAINT "store_tours_businessProfileId_fkey";

-- DropForeignKey
ALTER TABLE "store_tours" DROP CONSTRAINT "store_tours_createdById_fkey";

-- DropIndex
DROP INDEX "media_storeTourId_idx";

-- AlterTable
ALTER TABLE "media" DROP COLUMN "storeTourId",
ADD COLUMN     "businessTourId" TEXT;

-- DropTable
DROP TABLE "store_tour_highlights";

-- DropTable
DROP TABLE "store_tours";

-- DropEnum
DROP TYPE "StoreTourStatus";

-- CreateTable
CREATE TABLE "business_tours" (
    "id" TEXT NOT NULL,
    "businessProfileId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "visitDate" TIMESTAMP(3) NOT NULL,
    "status" "BusinessTourStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_tours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_tour_highlights" (
    "id" TEXT NOT NULL,
    "businessTourId" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "business_tour_highlights_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "business_tours_businessProfileId_idx" ON "business_tours"("businessProfileId");

-- CreateIndex
CREATE INDEX "business_tours_status_idx" ON "business_tours"("status");

-- CreateIndex
CREATE INDEX "business_tour_highlights_businessTourId_idx" ON "business_tour_highlights"("businessTourId");

-- CreateIndex
CREATE INDEX "media_businessTourId_idx" ON "media"("businessTourId");

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_businessTourId_fkey" FOREIGN KEY ("businessTourId") REFERENCES "business_tours"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_tours" ADD CONSTRAINT "business_tours_businessProfileId_fkey" FOREIGN KEY ("businessProfileId") REFERENCES "business_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_tours" ADD CONSTRAINT "business_tours_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_tour_highlights" ADD CONSTRAINT "business_tour_highlights_businessTourId_fkey" FOREIGN KEY ("businessTourId") REFERENCES "business_tours"("id") ON DELETE CASCADE ON UPDATE CASCADE;
