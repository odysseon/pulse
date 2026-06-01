export interface CreateReviewInput {
  readonly businessProfileId: string;
  /** Resolved user ID of the authenticated caller */
  readonly reviewerId: string;
  readonly rating: number;
  readonly comment?: string;
}

export interface UpdateReviewInput {
  readonly rating?: number;
  readonly comment?: string | null;
}

export interface GetBusinessReviewsInput {
  readonly businessProfileId: string;
  /** Cursor-based pagination — ID of the last item received */
  readonly cursor?: string;
  readonly limit?: number;
}

export interface ReviewPage {
  readonly items: ReviewWithMedia[];
  /** Pass as `cursor` in the next request. Null if no more pages. */
  readonly nextCursor: string | null;
}

export interface ReviewWithMedia {
  readonly id: string;
  readonly businessProfileId: string;
  readonly reviewerId: string;
  readonly rating: number;
  readonly comment: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  /** Ordered gallery photos attached to this review */
  readonly media: ReviewMediaItem[];
}

export interface ReviewMediaItem {
  readonly id: string;
  readonly url: string;
  readonly mediaType: string;
  readonly order: number | null;
  readonly createdAt: Date;
}
