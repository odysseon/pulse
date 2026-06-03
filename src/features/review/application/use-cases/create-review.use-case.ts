import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { IReviewRepository } from '../../domain/ports/review.repository.port.js';
import { Review } from '../../domain/types/review.entity.js';
import { CreateReviewInput } from '../../domain/types/review.types.js';
import { PrismaService } from '../../../../prisma/prisma.service.js';
import { Prisma } from '../../../../../generated/prisma/client.js';

@Injectable()
export class CreateReviewUseCase {
  constructor(
    private readonly reviewRepo: IReviewRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(input: CreateReviewInput): Promise<Review> {
    // 1. Validate rating range
    if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
      throw new BadRequestException('Rating must be an integer between 1 and 5.');
    }

    // 2. Ensure the business profile exists
    const business = await this.prisma.businessProfile.findUnique({
      where: { id: input.businessProfileId },
      select: { id: true },
    });
    if (!business) {
      throw new NotFoundException('Business profile not found.');
    }

    // 3. Ensure the listing exists and belongs to the business if listingId is provided
    if (input.listingId) {
      const listing = await this.prisma.listing.findUnique({
        where: { id: input.listingId },
        select: { businessProfileId: true },
      });
      if (!listing) {
        throw new NotFoundException('Listing not found.');
      }
      if (listing.businessProfileId !== input.businessProfileId) {
        throw new BadRequestException(
          'The specified listing does not belong to this business profile.',
        );
      }
    }

    // 4. Enforce one-review-per-business-or-listing-per-user
    const alreadyReviewed = await this.reviewRepo.existsByBusinessAndReviewer(
      input.businessProfileId,
      input.reviewerId,
      input.listingId ?? null,
    );
    if (alreadyReviewed) {
      if (input.listingId) {
        throw new ConflictException(
          'You have already submitted a review for this specific listing.',
        );
      } else {
        throw new ConflictException(
          'You have already submitted a general review for this business.',
        );
      }
    }

    try {
      return await this.reviewRepo.create(input);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('You have already submitted a review for this business.');
      }
      throw error;
    }
  }
}
