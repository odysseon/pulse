import { Controller, Get, Param, Query, NotFoundException, Req } from '@nestjs/common';
import { Public } from '@odysseon/whoami-adapter-nestjs';
import { DiscoverListingsUseCase } from '../../application/use-cases/discover-listings.use-case.js';
import { GetPublicListingUseCase } from '../../application/use-cases/get-public-listing.use-case.js';
import { GetListingsQueryDto } from '../dto/request.dto.js';
import { ListingResponseDto, PaginatedListingsResponseDto } from '../dto/response.dto.js';
import { ApiTags } from '@nestjs/swagger';
import { IBusinessProfileRepository } from '../../../business-profile/domain/ports/business-profile.repository.port.js';
import { PrismaService } from '../../../../prisma/prisma.service.js';

@ApiTags('Listing Public Surface')
@Public()
@Controller()
export class PublicListingController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly discoverListings: DiscoverListingsUseCase,
    private readonly getPublicListing: GetPublicListingUseCase,
    private readonly businessRepo: IBusinessProfileRepository,
  ) {}

  /**
   * GET /listings
   * Global discovery — all published listings across all businesses.
   */
  @Get('listings')
  async discover(@Req() req: any, @Query() query: GetListingsQueryDto): Promise<PaginatedListingsResponseDto> {
    const currentUserId = await this.resolveUserId(req);
    const result = await this.discoverListings.execute({
      ...query,
      ...(currentUserId ? { currentUserId } : {})
    });
    return PaginatedListingsResponseDto.from(result);
  }

  /**
   * GET /businesses/:businessSlug/listings
   * Discovery scoped to a specific business profile.
   */
  @Get('businesses/:businessSlug/listings')
  async discoverByBusiness(
    @Req() req: any,
    @Param('businessSlug') businessSlug: string,
    @Query() query: GetListingsQueryDto,
  ): Promise<PaginatedListingsResponseDto> {
    const businessProfileId = await this.resolveBusinessSlug(businessSlug);
    const currentUserId = await this.resolveUserId(req);
    const result = await this.discoverListings.execute({
      ...query,
      ...(businessProfileId ? { businessProfileId } : {}),
      ...(currentUserId ? { currentUserId } : {})
    });
    return PaginatedListingsResponseDto.from(result);
  }

  private async resolveUserId(req: any): Promise<string | undefined> {
    const accountId = req.identity?.accountId;
    if (accountId) {
      const user = await this.prisma.user.findUnique({
        where: { accountId },
        select: { id: true },
      });
      return user?.id;
    }
    return undefined;
  }

  private async resolveBusinessSlug(slug: string): Promise<string> {
    const profile = await this.businessRepo.findBySlug(slug);

    if (!profile) {
      throw new NotFoundException('Business profile not found.');
    }

    return profile.id;
  }

  /**
   * GET /listings/:slug
   * Public listing detail page.
   */
  @Get('listings/:slug')
  async getBySlug(@Param('slug') slug: string): Promise<ListingResponseDto> {
    const listing = await this.getPublicListing.execute(slug);
    return ListingResponseDto.from(listing);
  }
}
