import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { IReviewRepository } from '../../domain/ports/review.repository.port.js';
import { Review } from '../../domain/types/review.entity.js';
import { UpdateReviewInput } from '../../domain/types/review.types.js';

@Injectable()
export class UpdateReviewUseCase {
  constructor(private readonly reviewRepo: IReviewRepository) {}

  async execute(id: string, requesterId: string, input: UpdateReviewInput): Promise<Review> {
    const review = await this.reviewRepo.findById(id);
    if (!review) {
      throw new NotFoundException('Review not found.');
    }

    if (review.reviewerId !== requesterId) {
      throw new ForbiddenException('You can only edit your own reviews.');
    }

    if (input.rating !== undefined) {
      if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
        throw new BadRequestException('Rating must be an integer between 1 and 5.');
      }
    }

    return this.reviewRepo.update(id, input);
  }
}
