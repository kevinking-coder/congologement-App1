import { type Listing } from '@/src/db/types';

export const COMMUNES = [
  'Bandalungwa',
  'Barumbu',
  'Bumbu',
  'Gombe',
  'Kalamu',
  'Kasa-Vubu',
  'Kimbanseke',
  'Kinshasa',
  'Kintambo',
  'Kisenso',
  'Lemba',
  'Limete',
  'Lingwala',
  'Makala',
  'Maluku',
  'Masina',
  'Matete',
  'Mont-Ngafula',
  'Ndjili',
  'Ngaba',
  'Ngaliema',
  'Ngiri-Ngiri',
  'Nsele',
  'Selembao',
];

export const CDF_RATE = 2800;

export type Currency = 'USD' | 'CDF';

export function formatPrice(usd: number, currency: Currency): string {
  if (currency === 'CDF') {
    const cdf = Math.round(usd * CDF_RATE);
    return `${cdf.toLocaleString('fr-FR')} CDF`;
  }
  return `${usd.toLocaleString('fr-FR')} USD`;
}

export type Badge =
  | { kind: 'verified'; label: 'Vérifié'; color: 'green' }
  | { kind: 'partial'; label: 'Partiellement documenté'; color: 'amber' }
  | { kind: 'unverified'; label: 'Non vérifié'; color: 'gray' };

export function getBadge(listing: Listing): Badge {
  if (listing.verified) return { kind: 'verified', label: 'Vérifié', color: 'green' };
  const hasDoc = listing.doc_type && listing.doc_type.trim() !== '' && listing.doc_type.trim() !== 'Aucun';
  if (hasDoc) return { kind: 'partial', label: 'Partiellement documenté', color: 'amber' };
  return { kind: 'unverified', label: 'Non vérifié', color: 'gray' };
}

export const CATEGORY_LABELS: Record<string, string> = {
  buy: 'Acheter',
  rent: 'Louer',
  land: 'Terrain',
  hotel: 'Hôtels',
};

// Property types per category. These are the single source of truth used by
// both the Explore filter panel and the Publier une annonce form (and anywhere
// else a category's type selector appears) — update here once, not per screen.
// "Terrain" appears in both; "Hôtel" (selling a hotel building) is Buy-only and
// is unrelated to the Hôtels tab (booking stays). "Compound" has been removed.
export const BUY_PROPERTY_TYPES = [
  'Maison',
  'Appartement',
  'Terrain',
  'Studio',
  'Place commerciale',
  'Place industrielle',
  'Place agricole',
  'Hôtel',
] as const;

export const RENT_PROPERTY_TYPES = [
  'Maison',
  'Appartement',
  'Terrain',
  'Studio',
  'Place commerciale',
  'Place industrielle',
  'Place agricole',
] as const;

export const LAND_USAGES = ['Résidentiel', 'Commercial', 'Agricole'] as const;

// Whether a property type shows residential fields (chambres, salles de bain,
// superficie, meublé). Non-residential types (places, Terrain, Hôtel) hide them.
export function isResidentialType(type: string, category: string): boolean {
  void category;
  return type === 'Maison' || type === 'Appartement' || type === 'Studio';
}

// Whether a property type shows land-specific fields (dimensions, usage).
export function isLandType(type: string): boolean {
  return type === 'Terrain';
}

export function allPhotos(listing: Listing): string[] {
  return [
    listing.photo_1,
    listing.photo_2,
    listing.photo_3,
    listing.photo_4,
    listing.photo_5,
    listing.photo_6,
    listing.photo_7,
    listing.photo_8,
    listing.photo_9,
    listing.photo_10,
  ].filter((p): p is string => !!p);
}

export function featuredPhoto(listing: Listing): string | null {
  return allPhotos(listing)[0] ?? null;
}
