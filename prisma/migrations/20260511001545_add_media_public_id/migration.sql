/*
  Warnings:

  - A unique constraint covering the columns `[publicId]` on the table `VenueMedia` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `publicId` to the `VenueMedia` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VenueMedia" ADD COLUMN     "publicId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "VenueMedia_publicId_key" ON "VenueMedia"("publicId");
