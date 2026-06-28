export interface SavedListingView {
  id: string;
  userId: string;
  listingId: string;
  createdAt: Date;
  listing: any; // We'll refine this later
}

export interface SavedBusinessView {
  id: string;
  userId: string;
  businessProfileId: string;
  createdAt: Date;
  businessProfile: any; // We'll refine this later
}

export abstract class ISavesRepository {
  abstract saveListing(userId: string, listingId: string): Promise<void>;
  abstract unsaveListing(userId: string, listingId: string): Promise<void>;
  abstract saveBusiness(userId: string, businessProfileId: string): Promise<void>;
  abstract unsaveBusiness(userId: string, businessProfileId: string): Promise<void>;

  abstract isListingSaved(userId: string, listingId: string): Promise<boolean>;
  abstract isBusinessSaved(userId: string, businessProfileId: string): Promise<boolean>;

  abstract getSavedListings(
    userId: string,
    skip: number,
    take: number,
  ): Promise<{ items: SavedListingView[]; total: number }>;
  abstract getSavedBusinesses(
    userId: string,
    skip: number,
    take: number,
  ): Promise<{ items: SavedBusinessView[]; total: number }>;
}
