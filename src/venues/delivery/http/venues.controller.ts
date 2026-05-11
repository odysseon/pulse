import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { VenuesService } from '../../use-cases/venues.service.js';
import { CurrentIdentity, Public, type RequestIdentity } from '@odysseon/whoami-adapter-nestjs';
import { CreateVenueDto, GetVenuesFilterDto, UpdateVenueDto } from './dto/index.js';

/**
 * Controller for venue discovery and management.
 *
 * Provides public endpoints for venue discovery and detailed viewing,
 * as well as authenticated endpoints for venue owners to create and
 * manage their venue listings.
 *
 * @public Endpoints marked with {@link Public} are accessible without authentication
 * @requires Authentication for management endpoints via {@link CurrentIdentity}
 */
@ApiTags('Venues')
@Controller('venues')
export class VenuesController {
  /**
   * Creates an instance of VenuesController.
   *
   * @param venuesService - Service handling venue business logic, including
   *   discovery, retrieval, creation, and updates with ownership validation
   */
  constructor(private readonly venuesService: VenuesService) {}

  /**
   * Discovery: Public endpoint to search and filter venues.
   *
   * Returns a paginated, filtered list of venues based on the provided
   * filter criteria. This endpoint is publicly accessible without
   * authentication.
   *
   * @public
   * @param filters - Query parameters for filtering venues by criteria such as
   *   location, capacity, amenities, availability, and price range
   * @returns A promise resolving to the filtered venue results
   */
  @Public()
  @Get()
  async getVenues(@Query() filters: GetVenuesFilterDto) {
    return this.venuesService.discoverVenues(filters);
  }

  /**
   * Details: Public endpoint to view a specific venue.
   *
   * Retrieves comprehensive details for a single venue by its unique
   * identifier, including gallery images, amenities, and availability
   * information. This endpoint is publicly accessible without authentication.
   *
   * @public
   * @param id - The unique identifier of the venue to retrieve
   * @returns A promise resolving to the detailed venue information
   */
  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get full venue details by ID' })
  async getVenue(@Param('id') id: string) {
    return await this.venuesService.getVenue(id);
  }

  /**
   * Management: Create a new venue (Venue Owners only).
   *
   * Creates a new venue listing associated with the authenticated user's
   * account. The caller's identity is extracted from the request context
   * to set ownership.
   *
   * @param payload - The venue creation data including name, location,
   *   capacity, amenities, and other venue attributes
   * @param identity - The authenticated user's request identity, automatically
   *   resolved by the {@link CurrentIdentity} decorator
   * @returns A promise resolving to the created venue entity
   */
  @Post()
  async createVenue(@Body() payload: CreateVenueDto, @CurrentIdentity() identity: RequestIdentity) {
    return this.venuesService.createVenue(identity.accountId, payload);
  }

  /**
   * Management: Update venue details and gallery.
   *
   * Updates an existing venue identified by its ID. Performs ownership
   * verification to ensure only the venue owner can modify the listing,
   * and handles internal storage cleanup for replaced or removed gallery
   * assets.
   *
   * @param id - The unique identifier of the venue to update
   * @param payload - The partial venue update data containing only the
   *   fields that should be modified; omitted fields remain unchanged
   * @param identity - The authenticated user's request identity, used to
   *   verify ownership of the venue before applying updates
   * @returns A promise resolving to the updated venue entity
   * @throws ForbiddenException if the authenticated user is not the owner
   *   of the specified venue
   */
  @Patch(':id')
  async updateVenue(
    @Param('id') id: string,
    @Body() payload: UpdateVenueDto,
    @CurrentIdentity() identity: RequestIdentity,
  ) {
    return await this.venuesService.updateVenue(id, identity.accountId, payload);
  }
}
