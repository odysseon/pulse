import { GetVenuesFilterDto } from '../../delivery/http/dto/get-venues-filter.dto.js';
import { CreateVenueDto } from '../../delivery/http/dto/create-venue.dto.js';

export const VENUE_REPOSITORY_TOKEN = Symbol('VENUE_REPOSITORY_TOKEN');

export interface IVenueRepository {
  /**
   * Retrieves a paginated and filtered list of venues for public discovery.
   */
  findMany(filters: GetVenuesFilterDto): Promise<{ data: any[]; total: number }>;

  /**
   * Persists a newly created venue associated with a specific owner.
   */
  create(ownerId: string, payload: CreateVenueDto): Promise<any>;
}
