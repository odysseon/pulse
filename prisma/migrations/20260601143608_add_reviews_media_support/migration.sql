-- AlterEnum
ALTER TYPE "MediaResourceType" ADD VALUE 'REVIEW';

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_review_fk" FOREIGN KEY ("resourceId") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;
