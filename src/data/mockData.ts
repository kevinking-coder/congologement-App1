import { Listing, PropertyType } from '../types';

export const provinces: Record<string, string[]> = {
  'Bas-Uélé': ['Aketi', 'Ango', 'Bondo', 'Buta', 'Poko'],
  'Équateur': ['Bikoro', 'Bolomba', 'Bomongo', 'Ingende', 'Mbandaka'],
  'Haut-Katanga': ['Lubumbashi', 'Likasi', 'Kasumbalesa', 'Kambove', 'Kasenga', 'Kipushi', 'Mitwaba', 'Pweto', 'Sakania'],
  'Haut-Lomami': ['Bukama', 'Kabongo', 'Kamina', 'Kanda-Kanda', 'Malemba-Nkulu'],
  'Haut-Uélé': ['Dungu', 'Faradje', 'Isiro', 'Niangara', 'Rungu', 'Wamba'],
  Ituri: ['Bunia', 'Aru', 'Djugu', 'Irumu', 'Mahagi', 'Mambasa'],
  Kasaï: ['Dekese', 'Ilebo', 'Luebo', 'Mweka', 'Tshikapa'],
  'Kasaï-Central': ['Demba', 'Dibaya', 'Dimbelenge', 'Kananga', 'Kazumba', 'Luiza'],
  'Kasaï-Oriental': ['Kabeya-Kamwanga', 'Katanda', 'Mbuji-Mayi', 'Miabi', 'Lupatapata', 'Tshilenge'],
  Kinshasa: ['Bandalungwa', 'Barumbu', 'Bumbu', 'Gombe', 'Kalamu', 'Kasa-Vubu', 'Kimbanseke', 'Kinshasa', 'Kintambo', 'Kisenso', 'Lemba', 'Limete', 'Lingwala', 'Makala', 'Maluku', 'Masina', 'Matete', 'Mont-Ngafula', 'Ndjili', 'Ngaba', 'Ngaliema', 'Ngiri-Ngiri', 'Nsele', 'Selembao'],
  'Kongo Central': ['Boma', 'Matadi', 'Moanda', 'Mbanza-Ngungu', 'Lukula', 'Luozi', 'Madimba', 'Seke-Banza'],
  Kwango: ['Feshi', 'Kahemba', 'Kenge', 'Kasongo-Lunda', 'Popokabaka'],
  Kwilu: ['Bandundu', 'Kikwit', 'Bagata', 'Bulungu', 'Gungu', 'Idiofa', 'Masi-Manimba'],
  Lomami: ['Kabinda', 'Mwene-Ditu', 'Gombe Matadi', 'Luilu', 'Lubao', 'Ngandajika'],
  Lualaba: ['Kolwezi', 'Kasaji', 'Dilolo', 'Kapanga', 'Lubudi', 'Mutshatsha', 'Sandoa'],
  'Mai-Ndombe': ['Inongo', 'Bolobo', 'Kutu', 'Kwamouth', 'Kiri', 'Oshwe', 'Yumbi'],
  Maniema: ['Kindu', 'Kabambare', 'Kasongo', 'Kibombo', 'Lubutu', 'Pangi', 'Punia'],
  Mongala: ['Lisala', 'Bumba', 'Basankusu', 'Bongandanga'],
  'Nord-Kivu': ['Goma', 'Beni', 'Butembo', 'Oicha', 'Lubero', 'Masisi', 'Nyiragongo', 'Rutshuru', 'Walikale'],
  'Nord-Ubangi': ['Gbadolite', 'Businga', 'Mobayi-Mbongo', 'Yakoma'],
  Sankuru: ['Lusambo', 'Lodja', 'Katako-Kombe', 'Kole', 'Lomela', 'Lubefu'],
  'Sud-Kivu': ['Bukavu', 'Uvira', 'Baraka', 'Kamituga', 'Fizi', 'Kalehe', 'Kabare', 'Mwenga', 'Shabunda', 'Walungu'],
  'Sud-Ubangi': ['Gemena', 'Zongo', 'Budjala', 'Kungu', 'Libenge'],
  Tanganyika: ['Kalemie', 'Kabalo', 'Kongolo', 'Manono', 'Moba', 'Nyunzu'],
  Tshopo: ['Kisangani', 'Bafwaboli', 'Basoko', 'Isangi', 'Opala', 'Ubundu', 'Yahuma'],
  Tshuapa: ['Boende', 'Befale', 'Bokungu', 'Djolu', 'Ikela'],
};

export const fakePhotos = [
  'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1556035511-3168381ea4d4?auto=format&fit=crop&w=900&q=80',
];

export const mockListings: Listing[] = [
  {
    id: '1',
    user_id: '11111111-1111-1111-1111-111111111111',
    category: 'buy',
    titre: 'Maison familiale à Kinshasa',
    description: 'Belle maison avec jardin, 3 chambres, salon, cuisine moderne.',
    prix_usd: 58000,
    commune: 'Gombe',
    adresse: 'Avenue de la Libération 14',
    verified: true,
    doc_type: 'Carte d’identité',
    contact_name: 'Maya M.',
    contact_phone: '+243812345678',
    photo_1: fakePhotos[0],
    photo_2: fakePhotos[1],
    photo_3: fakePhotos[2],
    property_type: 'Maison',
    bedrooms: 3,
    bathrooms: 2,
    surface_m2: 180,
    furnished: true,
    province: 'Kinshasa',
    created_at: '2026-09-29T10:00:00Z',
  },
  {
    id: '2',
    user_id: '22222222-2222-2222-2222-222222222222',
    category: 'rent',
    titre: 'Appartement meublé en location',
    description: 'Appartement lumineux proche du centre, calme et sécurisé.',
    prix_usd: 1300,
    commune: 'Ngaliema',
    adresse: 'Boulevard du 30 juin',
    verified: false,
    doc_type: '',
    contact_name: 'Nadia K.',
    contact_phone: '+243815678901',
    photo_1: fakePhotos[3],
    photo_2: fakePhotos[4],
    property_type: 'Appartement',
    bedrooms: 2,
    bathrooms: 2,
    surface_m2: 95,
    furnished: true,
    province: 'Kinshasa',
    deposit_months_required: 3,
    max_occupants: 6,
    created_at: '2026-09-27T12:00:00Z',
  },
  {
    id: '3',
    user_id: '33333333-3333-3333-3333-333333333333',
    category: 'land',
    titre: 'Terrain résidentiel à Matadi',
    description: 'Terrain plat et bien desservi, idéal pour construction.',
    prix_usd: 22000,
    commune: 'Matadi',
    adresse: 'Route de la rivière',
    verified: true,
    doc_type: 'Titre foncier',
    contact_name: 'François B.',
    contact_phone: '+243897654321',
    photo_1: fakePhotos[5],
    property_type: 'Terrain',
    land_dimensions: '22m x 40m',
    land_usage: 'Résidentiel',
    province: 'Kongo Central',
    created_at: '2026-09-20T08:00:00Z',
  },
  {
    id: '4',
    user_id: '44444444-4444-4444-4444-444444444444',
    category: 'hotel',
    titre: 'Hôtel de charme à Lubumbashi',
    description: 'Séjour confortable avec piscine, petit-déjeuner et service complet.',
    prix_usd: 110,
    commune: 'Lubumbashi',
    adresse: 'Avenue Kasaï',
    verified: false,
    doc_type: 'Pièce justificative',
    contact_name: 'Sophie T.',
    contact_phone: '+243850123456',
    photo_1: fakePhotos[1],
    photo_2: fakePhotos[2],
    property_type: 'Hôtel',
    stars: 4,
    price_per_night_usd: 110,
    available_rooms: 8,
    amenities: 'Piscine, parking, Wi-Fi',
    max_adults: 3,
    children_allowed: true,
    max_children: 2,
    province: 'Haut-Katanga',
    created_at: '2026-09-18T08:00:00Z',
  },
];

export const propertyTypesByCategory: Record<string, PropertyType[]> = {
  buy: ['Maison', 'Appartement', 'Terrain', 'Studio', 'Place commerciale', 'Place industrielle', 'Place agricole', 'Hôtel'],
  rent: ['Maison', 'Appartement', 'Terrain', 'Studio', 'Place commerciale', 'Place industrielle', 'Place agricole'],
  hotel: ['Hôtel'],
};

export function getVerificationBadge(listing: Listing) {
  if (listing.verified) {
    return { label: 'Vérifié', color: '#22C55E' };
  }
  if (listing.doc_type && listing.doc_type.trim() !== '') {
    return { label: 'Partiellement documenté', color: '#F59E0B' };
  }
  return { label: 'Non vérifié', color: '#9CA3AF' };
}

export function isValidPhone(value: string) {
  const normalized = value.replace(/\s+/g, '');
  return /^\+243[0-9]{9}$/.test(normalized);
}
