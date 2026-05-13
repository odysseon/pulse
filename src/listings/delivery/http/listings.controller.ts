import { Controller, Get, Post, Body, Query, Param, Patch, Delete } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ListingsService } from '../../use-cases/listings.service.js';
import { GetListingsFilterDto } from './dto/get-listings-filter.dto.js';
import { CreateListingDto } from './dto/create-listing.dto.js';
import { ListingResponseDto, PaginatedListingsResponseDto } from './dto/listing-response.dto.js';
import { Public, CurrentIdentity, type RequestIdentity } from '@odysseon/whoami-adapter-nestjs';
import { UpdateListingDto } from './dto/update-listing.dto.js';

@ApiTags('Listings')
@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  /**
   * Search across the entire catalog with dynamic attribute support.
   */
  @Public()
  @Get()
  async getListings(@Query() filters: GetListingsFilterDto): Promise<PaginatedListingsResponseDto> {
    return this.listingsService.discoverListings(filters);
  }

  /**
   * Retrieve full details for a listing using its slug.
   */
  @Public()
  @Get(':slug')
  async getListing(@Param('slug') slug: string): Promise<ListingResponseDto> {
    return this.listingsService.getListingBySlug(slug);
  }

  /**
   * Register a new listing. Attributes are validated against the category blueprint.
   */
  @Post()
  async createListing(
    @Body() payload: CreateListingDto,
    @CurrentIdentity() identity: RequestIdentity,
  ): Promise<ListingResponseDto> {
    return this.listingsService.createListing(identity.accountId, payload);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateListingDto,
    @CurrentIdentity() identity: RequestIdentity,
  ) {
    return await this.listingsService.updateListing(id, identity.accountId, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentIdentity() identity: RequestIdentity) {
    return this.listingsService.deleteListing(id, identity.accountId);
  }
}
