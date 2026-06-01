import { Review } from '../types/review.entity.js';
import {
  CreateReviewInput,
  UpdateReviewInput,
  ReviewPage,
  GetBusinessReviewsInput,
  ReviewWithMedia,
} from '../types/review.types.js';

export abstract class IReviewRepository {
  abstract create(input: CreateReviewInput): Promise<Review>;

  abstract findById(id: string): Promise<Review | null>;

  abstract findByIdWithMedia(id: string): Promise<ReviewWithMedia | null>;

  /**
   * Returns true if a review already exists for the given
   * (businessProfileId, reviewerId) pair.
   */
  abstract existsByBusinessAndReviewer(
    businessProfileId: string,
    reviewerId: string,
  ): Promise<boolean>;

  /**
   * Paginated list of reviews for a business, newest first.
   * Each item includes its attached media gallery.
   */
  abstract findByBusiness(input: GetBusinessReviewsInput): Promise<ReviewPage>;

  abstract update(id: string, input: UpdateReviewInput): Promise<Review>;

  abstract delete(id: string): Promise<void>;
}
