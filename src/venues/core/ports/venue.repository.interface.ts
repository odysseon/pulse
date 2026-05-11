import { GetVenuesFilterDto } from '../../delivery/http/dto/get-venues-filter.dto.js';
import { CreateVenueDto } from '../../delivery/http/dto/create-venue.dto.js';
import { EventCentreDiscoveryEntity, EventCentreDetailedEntity } from '../domain/venue.types.js';

export const VENUE_REPOSITORY_TOKEN = Symbol('VENUE_REPOSITORY_TOKEN');

export interface IVenueRepository {
  /**
   * Retrieves a paginated and filtered list of venues for public discovery.
   */
  findMany(filters: GetVenuesFilterDto): Promise<{
    data: EventCentreDiscoveryEntity[];
    total: number;
  }>;

  /**
   * Persists a newly created venue associated with a specific owner.
   */
  create(accountId: string, payload: CreateVenueDto): Promise<EventCentreDetailedEntity>;

  /**
   * Retrieves detailed information about a specific venue by its ID.
   */
  findById(venueId: string): Promise<EventCentreDetailedEntity | null>;

  /**
   * Updates the details of an existing venue.
   */
  update(
    venueId: string,
    accountId: string,
    payload: Partial<CreateVenueDto>,
  ): Promise<EventCentreDetailedEntity>;
}
