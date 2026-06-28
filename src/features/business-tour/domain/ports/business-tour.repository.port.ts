import { BusinessTour } from '../types/business-tour.entity.js';
import {
  CreateBusinessTourInput,
  DiscoverBusinessToursInput,
  PaginatedBusinessTours,
  PaginatedBusinessToursSummary,
  UpdateBusinessTourInput,
  BusinessTourView,
} from '../types/business-tour.types.js';

export abstract class IBusinessTourRepository {
  abstract create(input: CreateBusinessTourInput): Promise<BusinessTour>;
  abstract findById(id: string): Promise<BusinessTourView | null>;
  abstract update(id: string, input: UpdateBusinessTourInput): Promise<BusinessTour>;
  abstract delete(id: string): Promise<void>;
  abstract discover(input: DiscoverBusinessToursInput): Promise<PaginatedBusinessTours>;
  abstract discoverGlobal(input: DiscoverBusinessToursInput): Promise<PaginatedBusinessToursSummary>;
}
