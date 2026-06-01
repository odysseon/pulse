import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentIdentity } from '@odysseon/whoami-adapter-nestjs';
import type { RequestIdentity } from '@odysseon/whoami-adapter-nestjs';
import { PrismaService } from '../../../../prisma/prisma.service.js';
import { CreateReviewUseCase } from '../../application/use-cases/create-review.use-case.js';
import { UpdateReviewUseCase } from '../../application/use-cases/update-review.use-case.js';
import { DeleteReviewUseCase } from '../../application/use-cases/delete-review.use-case.js';
import { GetBusinessReviewsUseCase } from '../../application/use-cases/get-business-reviews.use-case.js';
import { CreateReviewDto, UpdateReviewDto, GetBusinessReviewsQueryDto } from '../dto/request.dto.js';
import {
  ReviewResponseDto,
  ReviewPageDto,
} from '../dto/response.dto.js';

@ApiTags('Reviews')
@Controller()
export class ReviewController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createReview: CreateReviewUseCase,
    private readonly updateReview: UpdateReviewUseCase,
    private readonly deleteReview: DeleteReviewUseCase,
    private readonly getBusinessReviews: GetBusinessReviewsUseCase,
  ) {}

  /**
   * POST /business-profiles/:businessProfileId/reviews
   * Submit a review for a business profile.
   */
  @Post('business-profiles/:businessProfileId/reviews')
  async create(
    @CurrentIdentity() identity: RequestIdentity,
    @Param('businessProfileId') businessProfileId: string,
    @Body() dto: CreateReviewDto,
  ): Promise<ReviewResponseDto> {
    const reviewerId = await this.resolveUserId(identity.accountId);
    const review = await this.createReview.execute({
      businessProfileId,
      reviewerId,
      rating: dto.rating,
      comment: dto.comment,
    });
    return ReviewResponseDto.from(review);
  }

  /**
   * GET /business-profiles/:businessProfileId/reviews
   * Public — paginated list of reviews with embedded media.
   */
  @Get('business-profiles/:businessProfileId/reviews')
  async listByBusiness(
    @Param('businessProfileId') businessProfileId: string,
    @Query() query: GetBusinessReviewsQueryDto,
  ): Promise<ReviewPageDto> {
    const page = await this.getBusinessReviews.execute({
      businessProfileId,
      cursor: query.cursor,
      limit: query.limit,
    });
    return ReviewPageDto.from(page);
  }

  /**
   * PATCH /reviews/:id
   * Update own review's rating and/or comment.
   */
  @Patch('reviews/:id')
  async update(
    @CurrentIdentity() identity: RequestIdentity,
    @Param('id') id: string,
    @Body() dto: UpdateReviewDto,
  ): Promise<ReviewResponseDto> {
    const requesterId = await this.resolveUserId(identity.accountId);
    const review = await this.updateReview.execute(id, requesterId, {
      rating: dto.rating,
      comment: dto.comment,
    });
    return ReviewResponseDto.from(review);
  }

  /**
   * DELETE /reviews/:id
   * Reviewer or ADMIN can delete.
   */
  @Delete('reviews/:id')
  async delete(
    @CurrentIdentity() identity: RequestIdentity,
    @Param('id') id: string,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { accountId: identity.accountId },
      select: { id: true, role: true },
    });
    if (!user) throw new NotFoundException('User not found.');

    const isAdmin = user.role === 'ADMIN';
    await this.deleteReview.execute(id, user.id, isAdmin);
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private async resolveUserId(accountId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { accountId },
      select: { id: true },
    });
    if (!user) throw new NotFoundException('User not found.');
    return user.id;
  }
}
