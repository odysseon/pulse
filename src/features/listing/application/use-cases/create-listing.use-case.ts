import { Injectable, ConflictException } from '@nestjs/common';
import slugify from 'slugify';
import { IListingRepository } from '../../domain/ports/listing.repository.port.js';
import { CreateListingInput } from '../../domain/types/listing.types.js';
import { Listing } from '../../domain/types/listing.entity.js';

@Injectable()
export class CreateListingUseCase {
  constructor(private readonly repo: IListingRepository) {}

  async execute(input: CreateListingInput): Promise<Listing> {
    const slug = await this.deriveUniqueSlug(input.businessProfileId, input.title);
    return this.repo.create(input, slug);
  }

  private async deriveUniqueSlug(businessProfileId: string, title: string): Promise<string> {
    const base = slugify(title, { lower: true, strict: true });

    if (!(await this.repo.isSlugTaken(businessProfileId, base))) {
      return base;
    }

    for (let i = 0; i < 5; i++) {
      const candidate = `${base}-${Math.random().toString(36).slice(2, 7)}`;
      if (!(await this.repo.isSlugTaken(businessProfileId, candidate))) {
        return candidate;
      }
    }

    throw new ConflictException('Could not generate a unique slug. Please try a different title.');
  }
}
