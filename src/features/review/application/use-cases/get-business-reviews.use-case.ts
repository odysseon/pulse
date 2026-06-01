import { Injectable } from '@nestjs/common';
import { IReviewRepository } from '../../domain/ports/review.repository.port.js';
import { GetBusinessReviewsInput, ReviewPage } from '../../domain/types/review.types.js';

const DEFAULT_PAGE_LIMIT = 20;
const MAX_PAGE_LIMIT = 50;

@Injectable()
export class GetBusinessReviewsUseCase {
  constructor(private readonly reviewRepo: IReviewRepository) {}

  async execute(input: GetBusinessReviewsInput): Promise<ReviewPage> {
    const limit = Math.min(input.limit ?? DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT);
    return this.reviewRepo.findByBusiness({ ...input, limit });
  }
}
