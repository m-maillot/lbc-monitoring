export interface BuyerLocation {
  lat: number;
  lng: number;
  radiusKm?: number;
}

export interface Location {
  locationType: string;
  label?: string;
  city?: string;
  zipcode?: string;
  department_id?: string;
  region_id?: string;
  area?: {
    lat: number;
    lng: number;
    default_radius: number;
    radius?: number;
  };
}

export interface SearchConfiguration {
  name: string;
  keywords?: string;
  onlyTitle?: boolean;
  shippable?: boolean;
  locations?: (number | string | Location)[];
  category?: string;
  ownerType?: 'all' | 'pro' | 'private';
  priceMin?: number;
  priceMax?: number;
  enums?: Record<string, string[]>;
  ranges?: Record<string, { min?: number; max?: number }>;
  buyerLocation?: BuyerLocation;
  intervalMinutes?: number;
}
