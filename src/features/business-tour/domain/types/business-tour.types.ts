import {
  BusinessTourStatus,
  BusinessTourHighlight,
  BusinessTourMediaItem,
} from './business-tour.entity.js';

export interface CreateBusinessTourInput {
  readonly businessProfileId: string;
  readonly title: string;
  readonly summary?: string;
  readonly visitDate: Date;
  readonly highlights?: string[];
  readonly createdById: string;
}

export interface UpdateBusinessTourInput {
  readonly title?: string;
  readonly summary?: string | null;
  readonly visitDate?: Date;
  readonly highlights?: string[];
  readonly status?: BusinessTourStatus;
}

export interface BusinessTourView {
  readonly id: string;
  readonly businessProfileId: string;
  readonly title: string;
  readonly summary: string | null;
  readonly visitDate: Date;
  readonly status: BusinessTourStatus;
  readonly publishedAt: Date | null;
  readonly createdById: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly highlights: BusinessTourHighlight[];
  readonly media: BusinessTourMediaItem[];
}

export interface DiscoverBusinessToursInput {
  readonly businessProfileId?: string;
  readonly status?: BusinessTourStatus;
  readonly search?: string;
  readonly lat?: number;
  readonly lng?: number;
  readonly radiusInKm?: number;
  readonly page: number;
  readonly limit: number;
}

export interface BusinessTourSummary {
  readonly id: string;
  readonly businessProfileId: string;
  readonly businessProfileSlug: string;
  readonly title: string;
  readonly summary: string | null;
  readonly visitDate: Date;
  readonly status: BusinessTourStatus;
  readonly publishedAt: Date | null;
  readonly coverUrl?: string;
  readonly distanceKm?: number;
}

export interface PaginatedBusinessTours {
  readonly items: BusinessTourView[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
}

export interface PaginatedBusinessToursSummary {
  readonly items: BusinessTourSummary[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
}
