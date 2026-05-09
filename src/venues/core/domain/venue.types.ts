export type DomainMediaType = 'IMAGE' | 'VIDEO';

export interface VenueMediaEntity {
  id: string;
  url: string;
  type: DomainMediaType;
  caption: string | null;
  order: number;
  eventCentreId: string;
}

export interface PerkEntity {
  id: string;
  title: string;
  description: string | null;
  eventCentreId: string;
}

export interface AmenityEntity {
  id: string;
  name: string;
}

export interface EventCentreEntity {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  location: string;
  address: string;
  capacity: number;
  priceRangeMin: number | null;
  priceRangeMax: number | null;
  contactPhone: string | null;
  contactWhatsapp: string | null;
  isVerified: boolean;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

// The shape returned for public discovery lists
export interface EventCentreDiscoveryEntity extends EventCentreEntity {
  media: VenueMediaEntity[];
  amenities: AmenityEntity[];
}

// The shape returned when a venue is created or fully fetched
export interface EventCentreDetailedEntity extends EventCentreEntity {
  media: VenueMediaEntity[];
  perks: PerkEntity[];
  amenities: AmenityEntity[];
}
