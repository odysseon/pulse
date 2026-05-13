import { Inject, Injectable } from '@nestjs/common';
import {
  LISTING_REPOSITORY_TOKEN,
  type IListingRepository,
} from '../core/ports/listing.repository.interface.js';

@Injectable()
export class DeleteListingUseCase {
  constructor(
    @Inject(LISTING_REPOSITORY_TOKEN)
    private readonly repository: IListingRepository,
  ) {}

  async execute(listingId: string, accountId: string): Promise<void> {
    return this.repository.delete(listingId, accountId);
  }
}
