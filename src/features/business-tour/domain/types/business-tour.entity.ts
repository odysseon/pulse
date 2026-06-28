export enum BusinessTourStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

export interface BusinessTourHighlight {
  readonly id: string;
  readonly value: string;
}

export interface BusinessTourMediaItem {
  readonly id: string;
  readonly url: string;
  readonly mediaType: 'IMAGE' | 'VIDEO';
  readonly order: number | null;
  readonly createdAt: Date;
}

export interface BusinessTour {
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
