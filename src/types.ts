export type Currency = 'USD' | 'CDF';
export type ListingCategory = 'buy' | 'rent' | 'land' | 'hotel';
export type PropertyType =
  | 'Maison'
  | 'Appartement'
  | 'Terrain'
  | 'Studio'
  | 'Place commerciale'
  | 'Place industrielle'
  | 'Place agricole'
  | 'Hôtel';

export type Listing = {
  id: string;
  user_id: string;
  category: ListingCategory;
  titre: string;
  description: string;
  prix_usd: number;
  commune: string;
  adresse: string;
  verified: boolean;
  doc_type: string;
  contact_name: string;
  contact_phone: string;
  photo_1: string;
  photo_2?: string;
  photo_3?: string;
  photo_4?: string;
  photo_5?: string;
  photo_6?: string;
  photo_7?: string;
  photo_8?: string;
  photo_9?: string;
  photo_10?: string;
  property_type: PropertyType;
  bedrooms?: number;
  bathrooms?: number;
  surface_m2?: number;
  furnished?: boolean;
  land_dimensions?: string;
  land_usage?: string;
  stars?: number;
  price_per_night_usd?: number;
  available_rooms?: number;
  amenities?: string;
  max_adults?: number;
  children_allowed?: boolean;
  max_children?: number;
  province: string;
  latitude?: number;
  longitude?: number;
  deposit_months_required?: number;
  max_occupants?: number;
  created_at?: string;
};

export type ReportReason =
  | 'Informations incorrectes'
  | 'Annonce frauduleuse'
  | 'Bien déjà vendu-loué'
  | 'Autre';

export type FavoriteMap = Record<string, boolean>;
