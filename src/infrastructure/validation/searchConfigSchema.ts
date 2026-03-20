import { z } from 'zod';

export const BuyerLocationSchema = z.object({
  lat: z.number().min(-90, 'La latitude doit être entre -90 et 90').max(90, 'La latitude doit être entre -90 et 90'),
  lng: z.number().min(-180, 'La longitude doit être entre -180 et 180').max(180, 'La longitude doit être entre -180 et 180'),
  radiusKm: z.number().min(0, 'Le rayon doit être positif').optional(),
});

export const LocationSchema = z.object({
  locationType: z.string(),
  label: z.string().optional(),
  city: z.string().optional(),
  zipcode: z.string().optional(),
  department_id: z.string().optional(),
  region_id: z.string().optional(),
  area: z.object({
    lat: z.number(),
    lng: z.number(),
    default_radius: z.number(),
    radius: z.number().optional(),
  }).optional(),
});

export const SearchConfigurationSchema = z.object({
  name: z.string().min(1, 'Le nom de la recherche est obligatoire'),
  keywords: z.string().optional(),
  onlyTitle: z.boolean().optional(),
  shippable: z.boolean().optional(),
  locations: z.array(z.union([z.number(), z.string(), LocationSchema])).optional(),
  category: z.string().optional(),
  ownerType: z.enum(['all', 'pro', 'private']).optional(),
  priceMin: z.number().min(0, 'Le prix minimum doit être positif').optional(),
  priceMax: z.number().min(0, 'Le prix maximum doit être positif').optional(),
  enums: z.record(z.array(z.string())).optional(),
  ranges: z.record(z.object({
    min: z.number().optional(),
    max: z.number().optional(),
  })).optional(),
  buyerLocation: BuyerLocationSchema.optional(),
}).refine(
  (data) => {
    if (data.priceMin !== undefined && data.priceMax !== undefined) {
      return data.priceMin <= data.priceMax;
    }
    return true;
  },
  {
    message: 'Le prix minimum doit être inférieur ou égal au prix maximum',
    path: ['priceMin'],
  }
);

export const SearchConfigFileSchema = z.object({
  searches: z.array(SearchConfigurationSchema).min(1, 'Au moins une recherche doit être définie'),
});

export type SearchConfigFile = z.infer<typeof SearchConfigFileSchema>;
