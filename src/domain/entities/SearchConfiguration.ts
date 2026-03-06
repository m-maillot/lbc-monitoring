export interface BuyerLocation {
  lat: number;
  lng: number;
}

export interface SearchConfiguration {
  name: string;
  keywords?: string;
  onlyTitle?: boolean;
  shippable?: boolean;
  locations?: (number | string)[];
  category?: string;
  ownerType?: 'all' | 'pro' | 'private';
  priceMin?: number;
  priceMax?: number;
  enums?: Record<string, string[]>;
  ranges?: Record<string, { min?: number; max?: number }>;
  buyerLocation?: BuyerLocation;
}
