-- CreateIndex
CREATE INDEX "Listing_attributes_idx" ON "Listing" USING GIN ("attributes");
