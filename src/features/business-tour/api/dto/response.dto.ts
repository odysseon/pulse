import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  BusinessTourStatus,
  BusinessTourMediaItem,
} from '../../domain/types/business-tour.entity.js';
import {
  PaginatedBusinessTours,
  BusinessTourView,
} from '../../domain/types/business-tour.types.js';

export class BusinessTourHighlightDto {
  @ApiProperty() id: string;
  @ApiProperty() value: string;

  private constructor(h: { id: string; value: string }) {
    this.id = h.id;
    this.value = h.value;
  }

  static from(h: { id: string; value: string }) {
    return new BusinessTourHighlightDto(h);
  }
}

export class BusinessTourMediaItemDto {
  @ApiProperty() id: string;
  @ApiProperty() url: string;
  @ApiProperty() mediaType: string;
  @ApiPropertyOptional({ nullable: true }) order: number | null;
  @ApiProperty() createdAt: string;

  private constructor(m: BusinessTourMediaItem) {
    this.id = m.id;
    this.url = m.url;
    this.mediaType = m.mediaType;
    this.order = m.order;
    this.createdAt = m.createdAt.toISOString();
  }

  static from(m: BusinessTourMediaItem): BusinessTourMediaItemDto {
    return new BusinessTourMediaItemDto(m);
  }
}

export class BusinessTourResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() businessProfileId: string;
  @ApiProperty() title: string;
  @ApiPropertyOptional({ nullable: true }) summary: string | null;
  @ApiProperty() visitDate: string;
  @ApiProperty({ enum: BusinessTourStatus }) status: BusinessTourStatus;
  @ApiPropertyOptional({ nullable: true }) publishedAt: string | null;
  @ApiProperty() createdById: string;
  @ApiProperty() createdAt: string;
  @ApiProperty() updatedAt: string;
  @ApiProperty({ type: [BusinessTourHighlightDto] }) highlights: BusinessTourHighlightDto[];
  @ApiProperty({ type: [BusinessTourMediaItemDto] }) media: BusinessTourMediaItemDto[];

  private constructor(tour: BusinessTourView) {
    this.id = tour.id;
    this.businessProfileId = tour.businessProfileId;
    this.title = tour.title;
    this.summary = tour.summary;
    this.visitDate = tour.visitDate.toISOString();
    this.status = tour.status;
    this.publishedAt = tour.publishedAt ? tour.publishedAt.toISOString() : null;
    this.createdById = tour.createdById;
    this.createdAt = tour.createdAt.toISOString();
    this.updatedAt = tour.updatedAt.toISOString();
    this.highlights = tour.highlights.map((h) => BusinessTourHighlightDto.from(h));
    this.media = tour.media.map((m) => BusinessTourMediaItemDto.from(m));
  }

  static from(tour: BusinessTourView): BusinessTourResponseDto {
    return new BusinessTourResponseDto(tour);
  }
}

export class PaginatedBusinessToursResponseDto {
  @ApiProperty({ type: [BusinessTourResponseDto] }) items: BusinessTourResponseDto[];
  @ApiProperty() total: number;
  @ApiProperty() page: number;
  @ApiProperty() limit: number;

  private constructor(paginated: PaginatedBusinessTours) {
    this.items = paginated.items.map((i) => BusinessTourResponseDto.from(i));
    this.total = paginated.total;
    this.page = paginated.page;
    this.limit = paginated.limit;
  }

  static from(paginated: PaginatedBusinessTours): PaginatedBusinessToursResponseDto {
    return new PaginatedBusinessToursResponseDto(paginated);
  }
}
