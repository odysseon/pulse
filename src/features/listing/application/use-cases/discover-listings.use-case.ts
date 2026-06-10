import { Injectable } from '@nestjs/common';
import { IListingRepository } from '../../domain/ports/listing.repository.port.js';

import {
  DiscoverListingsInput,
  PaginatedListingSummaries,
} from '../../domain/types/listing.types.js';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

@Injectable()
export class DiscoverListingsUseCase {
  constructor(private readonly repo: IListingRepository) {}

  async execute(raw: {
    businessProfileId?: string;
    currencyCode?: string;
    minPrice?: string;
    maxPrice?: string;
    isNegotiable?: string;
    search?: string;
    page?: string;
    limit?: string;
  }): Promise<PaginatedListingSummaries> {
    const input: DiscoverListingsInput = {
      businessProfileId: raw.businessProfileId,
      currencyCode: raw.currencyCode,
      minPrice: this.#parseNumber(raw.minPrice),
      maxPrice: this.#parseNumber(raw.maxPrice),
      isNegotiable:
        raw.isNegotiable === 'true' ? true : raw.isNegotiable === 'false' ? false : undefined,
      search: raw.search,
      page: this.#parsePage(raw.page),
      limit: this.#parseLimit(raw.limit),
    };

    return this.repo.discover(input);
  }

  #parseNumber(raw: string | undefined): number | undefined {
    if (raw === undefined) return undefined;
    const n = Number(raw);
    return Number.isFinite(n) ? n : undefined;
  }

  #parsePage(raw: string | undefined): number {
    const n = Number.parseInt(raw ?? '', 10);
    return Number.isFinite(n) && n > 0 ? n : DEFAULT_PAGE;
  }

  #parseLimit(raw: string | undefined): number {
    const n = Number.parseInt(raw ?? '', 10);
    if (!Number.isFinite(n) || n < 1) return DEFAULT_LIMIT;
    return Math.min(n, MAX_LIMIT);
  }
}
