export interface Advertisement {
  id: number;
  title: string;
  description: string;
  price: number;
  url: string;
  imageUrl: string;
  publicationDate: Date;
  location: string;
  category: string;
  distanceKm?: number;
}
