import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import { StatusBar } from 'expo-status-bar';
import {
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from './src/lib/supabase';

type Currency = 'USD' | 'CDF';
type ListingCategory = 'buy' | 'rent' | 'land' | 'hotel';
type PropertyType =
  | 'Maison'
  | 'Appartement'
  | 'Terrain'
  | 'Studio'
  | 'Place commerciale'
  | 'Place industrielle'
  | 'Place agricole'
  | 'Hôtel';

type Listing = {
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

type ReportReason =
  | 'Informations incorrectes'
  | 'Annonce frauduleuse'
  | 'Bien déjà vendu-loué'
  | 'Autre';

const brandBlue = '#132C6B';
const darkAccent = '#0C2A5E';
const gold = '#F7D618';
const lightBlue = '#1E6FE0';
const red = '#CE1021';
const muted = '#6B7280';

const provinces: Record<string, string[]> = {
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

const fakePhotos = [
  'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1556035511-3168381ea4d4?auto=format&fit=crop&w=900&q=80',
];

const mockListings: Listing[] = [
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

const favoriteInitials: string[] = ['2'];

function getVerificationBadge(listing: Listing) {
  if (listing.verified) {
    return { label: 'Vérifié', color: '#22C55E' };
  }
  if (listing.doc_type && listing.doc_type.trim() !== '') {
    return { label: 'Partiellement documenté', color: '#F59E0B' };
  }
  return { label: 'Non vérifié', color: '#9CA3AF' };
}

function formatPhone(value: string) {
  const normalized = value.replace(/\s+/g, '');
  return /^\+243[0-9]{9}$/.test(normalized);
}

const AppContext = createContext<{
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatPrice: (value: number) => string;
  favorites: string[];
  toggleFavorite: (listingId: string) => void;
  user: { id: string; email?: string; user_metadata?: { full_name?: string; phone?: string } } | null;
} | null>(null);

function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('AppContext missing');
  }
  return context;
}

function AppProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>('USD');
  const [favorites, setFavorites] = useState<string[]>(favoriteInitials);
  const [user, setUser] = useState<{ id: string; email?: string; user_metadata?: { full_name?: string; phone?: string } } | null>(null);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setUser(data.session?.user ?? null);
    });
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const formatPrice = (value: number) => {
    const usdValue = Number(value ?? 0);
    if (currency === 'USD') {
      return `${usdValue.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} $`;
    }
    return `${Math.round(usdValue * 2800).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} CDF`;
  };

  const toggleFavorite = (listingId: string) => {
    setFavorites((current) =>
      current.includes(listingId) ? current.filter((id) => id !== listingId) : [...current, listingId],
    );
  };

  const value = useMemo(
    () => ({
      currency,
      setCurrency,
      formatPrice,
      favorites,
      toggleFavorite,
      user,
    }),
    [currency, favorites, user],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

const Tabs = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function LogoMark() {
  return (
    <View style={styles.logoBadge}>
      <View style={styles.logoGradient} />
      <Ionicons name="home" size={24} color="white" style={styles.logoIcon} />
    </View>
  );
}

function BrandHeader() {
  return (
    <View style={styles.brandHeader}>
      <LogoMark />
      <View style={styles.brandWords}>
        <Text style={styles.wordmark}>Congo Logement</Text>
        <Text style={styles.tagline}>PROPERTY 243</Text>
      </View>
    </View>
  );
}

function ListingCard({ item, navigation }: { item: Listing; navigation: any }) {
  const { favorites, toggleFavorite, formatPrice } = useAppContext();
  const isFavorite = favorites.includes(item.id);

  return (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ListingDetail', { listing: item })}>
      <View style={styles.cardImageWrap}>
        <Image source={{ uri: item.photo_1 || fakePhotos[0] }} style={styles.cardImage} />
        <TouchableOpacity style={styles.favoriteChip} onPress={() => toggleFavorite(item.id)}>
          <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={18} color={isFavorite ? '#CE1021' : '#fff'} />
        </TouchableOpacity>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.titre}</Text>
          <Text style={styles.priceText}>{formatPrice(item.prix_usd ?? item.price_per_night_usd ?? 0)}</Text>
        </View>
        <Text style={styles.metaText}>{item.commune} • {item.province}</Text>
        <Text style={styles.metaText} numberOfLines={2}>{item.description}</Text>
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: getVerificationBadge(item).color }]}>
            <Text style={styles.badgeText}>{getVerificationBadge(item).label}</Text>
          </View>
          <Text style={styles.typeText}>{item.property_type}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function HomeScreen({ navigation }: any) {
  const { formatPrice } = useAppContext();
  const [featured, setFeatured] = useState<Listing[]>(mockListings);
  const [searchText, setSearchText] = useState('');

  React.useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('listings').select('*').limit(5);
      if (Array.isArray(data) && data.length > 0) {
        setFeatured(data as Listing[]);
      }
    };

    load();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screenPad}>
        <BrandHeader />
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={muted} />
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={() => navigation.navigate('HomeTabs', { screen: 'Explorer', params: { search: searchText } })}
            returnKeyType="search"
            style={styles.searchInput}
            placeholder="Ville, commune ou bien"
            placeholderTextColor={muted}
          />
        </View>

        <View style={styles.heroPanel}>
          <Text style={styles.heroTitle}>Trouvez votre bien au bon endroit.</Text>
          <Text style={styles.heroText}>Appartements, maisons, terrains et hôtels sur le marché immobilier du DRC.</Text>
        </View>

        <View style={styles.categoryGrid}>
          {[
            { label: 'Acheter', icon: 'cash' },
            { label: 'Louer', icon: 'key' },
            { label: 'Hôtels', icon: 'bed' },
            { label: 'Terrain', icon: 'map' },
          ].map((item) => (
            <TouchableOpacity key={item.label} style={styles.categoryTile} onPress={() => navigation.navigate('HomeTabs', { screen: 'Explorer' })}>
              <Ionicons name={item.icon as any} size={26} color={brandBlue} />
              <Text style={styles.categoryLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Annonces récentes vérifiées</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Explorer')}>
            <Text style={styles.linkText}>Voir tout</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={featured}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.horizontalCard} onPress={() => navigation.navigate('ListingDetail', { listing: item })}>
              <Image source={{ uri: item.photo_1 || fakePhotos[0] }} style={styles.horizontalImage} />
              <View style={styles.horizontalBody}>
                <Text style={styles.horizontalTitle} numberOfLines={1}>{item.titre}</Text>
                <Text style={styles.horizontalPrice}>{formatPrice(item.prix_usd)}</Text>
                <View style={[styles.badge, { backgroundColor: getVerificationBadge(item).color }]}>
                  <Text style={styles.badgeText}>{getVerificationBadge(item).label}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingVertical: 8 }}
        />

        <View style={styles.trustStats}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>1.2k+</Text>
            <Text style={styles.statLabel}>Annonces actives</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>94%</Text>
            <Text style={styles.statLabel}>Utilisateurs satisfaits</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>24/7</Text>
            <Text style={styles.statLabel}>Support local</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ExplorerScreen({ navigation, route }: any) {
  const { formatPrice } = useAppContext();
  const [listings, setListings] = useState<Listing[]>(mockListings);
  const [segment, setSegment] = useState<ListingCategory>('buy');
  const [province, setProvince] = useState('');
  const [commune, setCommune] = useState('');
  const [searchText, setSearchText] = useState(route.params?.search ?? '');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'price'>('newest');

  React.useEffect(() => {
    if (route.params?.search !== undefined) setSearchText(route.params.search);
  }, [route.params?.search]);

  React.useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('listings').select('*').order('created_at', { ascending: false });
      if (Array.isArray(data) && data.length > 0) setListings(data as Listing[]);
    };
    load();
  }, []);

  const filtered = listings.filter((listing) => {
    const categoryMatch = listing.category === segment;
    const provinceMatch = !province || listing.province === province;
    const communeMatch = !commune || listing.commune === commune;
    const verifiedMatch = !verifiedOnly || listing.verified;
    const searchMatch = !searchText.trim() || `${listing.titre} ${listing.description} ${listing.commune} ${listing.province} ${listing.property_type}`.toLocaleLowerCase('fr').includes(searchText.trim().toLocaleLowerCase('fr'));
    return categoryMatch && provinceMatch && communeMatch && verifiedMatch && searchMatch;
  });

  const sorted = [...filtered].sort((a, b) =>
    sortBy === 'price'
      ? (a.prix_usd ?? a.price_per_night_usd ?? 0) - (b.prix_usd ?? b.price_per_night_usd ?? 0)
      : new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime(),
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screenPad}>
        <BrandHeader />

        <View style={styles.segmentControl}>
          {(['buy', 'rent', 'land', 'hotel'] as ListingCategory[]).map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.segmentButton, segment === item && styles.segmentButtonActive]}
              onPress={() => setSegment(item)}
            >
              <Text style={[styles.segmentText, segment === item && styles.segmentTextActive]}>{item === 'buy' ? 'Acheter' : item === 'rent' ? 'Louer' : item === 'land' ? 'Terrain' : 'Hôtels'}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.filterCard}>
          <TextInput value={searchText} onChangeText={setSearchText} style={styles.input} placeholder="Mot-clé" />
          <Text style={styles.filterLabel}>Province</Text>
          <TextInput value={province} onChangeText={setProvince} style={styles.input} placeholder="Province" />
          <Text style={styles.filterLabel}>Commune</Text>
          <TextInput value={commune} onChangeText={setCommune} style={styles.input} placeholder="Commune" />

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Uniquement vérifiées</Text>
            <Switch value={verifiedOnly} onValueChange={setVerifiedOnly} />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Voir sur la carte</Text>
            <Switch value={showMap} onValueChange={setShowMap} />
          </View>

          <Text style={styles.filterLabel}>Trier par</Text>
          <View style={styles.inlineButtons}>
            {['newest', 'price'].map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.inlineBtn, sortBy === option && styles.inlineBtnActive]}
                onPress={() => setSortBy(option as 'newest' | 'price')}
              >
                <Text style={[styles.inlineBtnText, sortBy === option && styles.inlineBtnTextActive]}>{option === 'newest' ? 'Le plus récent' : 'Prix'}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {showMap && (
          <View style={styles.mapPanel}>
            <Text style={styles.mapText}>Carte de résultats active</Text>
            <View style={styles.mapBubbleRow}>
              {sorted.slice(0, 3).map((item) => (
                <View key={item.id} style={styles.mapPin}>
                  <Text style={styles.mapPinText}>{item.commune}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.resultsHeader}>
          <Text style={styles.sectionTitle}>{sorted.length} résultats</Text>
        </View>

        {sorted.map((listing) => (
          <ListingCard key={listing.id} item={listing} navigation={navigation} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function PublishScreen({ navigation }: any) {
  const { user } = useAppContext();
  const [category, setCategory] = useState<ListingCategory>('buy');
  const [propertyType, setPropertyType] = useState<PropertyType>('Maison');
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [prix, setPrix] = useState('');
  const [province, setProvince] = useState('Kinshasa');
  const [commune, setCommune] = useState('Gombe');
  const [adresse, setAdresse] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [depositMonth, setDepositMonth] = useState('');
  const [maxOccupants, setMaxOccupants] = useState('');

  const submit = async () => {
    if (!user) {
      Alert.alert('Connexion requise', 'Connectez-vous pour publier une annonce.');
      navigation.navigate('Connexion');
      return;
    }

    if (!titre || !description || !prix || !province || !commune || !contactPhone || !contactName) {
      Alert.alert('Champs requis', 'Veuillez remplir les informations obligatoires.');
      return;
    }

    if (!formatPhone(contactPhone)) {
      Alert.alert('Téléphone invalide', 'Le numéro doit être au format +243 suivi de 9 chiffres.');
      return;
    }

    const payload: Partial<Listing> = {
      user_id: user.id,
      category,
      titre,
      description,
      prix_usd: Number(prix),
      province,
      commune,
      adresse,
      contact_name: contactName,
      contact_phone: contactPhone,
      property_type: propertyType,
      verified: false,
      doc_type: '',
      photo_1: fakePhotos[0],
    };

    if (category === 'rent') {
      payload.deposit_months_required = Number(depositMonth || 0);
    }

    if (propertyType === 'Maison' && category === 'rent') {
      payload.max_occupants = Number(maxOccupants || 0);
    }

    const { error } = await supabase.from('listings').insert([payload]);
    if (error) {
      Alert.alert('Erreur', error.message);
      return;
    }

    Alert.alert('Annonce publiée', 'Votre annonce a été enregistrée dans votre compte.');
    navigation.navigate('HomeTabs', { screen: 'Mes annonces' });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screenPad}>
        <BrandHeader />
        <Text style={styles.sectionTitle}>Publier une annonce</Text>

        <Text style={styles.filterLabel}>Catégorie</Text>
        <View style={styles.inlineButtons}>
          {['buy', 'rent', 'land', 'hotel'].map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.inlineBtn, category === item && styles.inlineBtnActive]}
              onPress={() => setCategory(item as ListingCategory)}
            >
              <Text style={[styles.inlineBtnText, category === item && styles.inlineBtnTextActive]}>{item === 'buy' ? 'Acheter' : item === 'rent' ? 'Louer' : item === 'land' ? 'Terrain' : 'Hôtels'}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.filterLabel}>Type de bien</Text>
        <View style={styles.inlineButtonsInlineWrap}>
          {['Maison', 'Appartement', 'Terrain', 'Studio', 'Place commerciale', 'Hôtel'].map((type) => (
            <TouchableOpacity key={type} style={[styles.chip, propertyType === type && styles.chipActive]} onPress={() => setPropertyType(type as PropertyType)}>
              <Text style={[styles.chipText, propertyType === type && styles.chipTextActive]}>{type}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput style={styles.input} value={titre} onChangeText={setTitre} placeholder="Titre de l'annonce" />
        <TextInput style={[styles.input, styles.textArea]} multiline value={description} onChangeText={setDescription} placeholder="Description" />
        <TextInput style={styles.input} value={prix} onChangeText={setPrix} keyboardType="numeric" placeholder="Prix en USD" />

        <TextInput style={styles.input} value={province} onChangeText={setProvince} placeholder="Province" />
        <TextInput style={styles.input} value={commune} onChangeText={setCommune} placeholder="Commune / Ville" />
        <TextInput style={styles.input} value={adresse} onChangeText={setAdresse} placeholder="Adresse" />

        <TextInput style={styles.input} value={contactName} onChangeText={setContactName} placeholder="Nom du contact" />
        <TextInput style={styles.input} value={contactPhone} onChangeText={setContactPhone} placeholder="+243XXXXXXXXX" />

        {category === 'rent' && (
          <>
            <TextInput style={styles.input} value={depositMonth} onChangeText={setDepositMonth} keyboardType="numeric" placeholder="Nombre de mois de garantie" />
            <TextInput style={styles.input} value={maxOccupants} onChangeText={setMaxOccupants} keyboardType="numeric" placeholder="Nombre de personnes autorisées (si maison)" />
          </>
        )}

        <TouchableOpacity style={styles.primaryButton} onPress={submit}>
          <Text style={styles.primaryButtonText}>Publier</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function MyListingsScreen({ navigation }: any) {
  const { user } = useAppContext();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const load = async () => {
      if (!user) {
        setListings([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data, error } = await supabase.from('listings').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (error) Alert.alert('Erreur', error.message);
      setListings((data ?? []) as Listing[]);
      setLoading(false);
    };

    load();
  }, [user]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screenPad}>
        <BrandHeader />
        <Text style={styles.sectionTitle}>Mes annonces</Text>
        {!user ? <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('Connexion')}><Text style={styles.primaryButtonText}>Se connecter</Text></TouchableOpacity> : null}
        {loading ? <Text style={styles.emptyText}>Chargement…</Text> : null}
        {!loading && user && listings.length === 0 ? <Text style={styles.emptyText}>Vous n’avez pas encore publié d’annonce.</Text> : null}
        {listings.map((listing) => (
          <ListingCard key={listing.id} item={listing} navigation={navigation} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function AccountScreen({ navigation }: any) {
  const { currency, setCurrency, formatPrice, user } = useAppContext();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screenPad}>
        <BrandHeader />
        <View style={styles.accountCard}>
          <Text style={styles.accountName}>{user ? user.user_metadata?.full_name || 'Mon compte' : 'Bienvenue'}</Text>
          {user?.email ? <Text style={styles.accountMeta}>{user.email}</Text> : <Text style={styles.accountMeta}>Connectez-vous pour gérer vos annonces et favoris.</Text>}
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Devise</Text>
          <View style={styles.inlineButtons}>
            {['USD', 'CDF'].map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.inlineBtn, currency === option && styles.inlineBtnActive]}
                onPress={() => setCurrency(option as Currency)}
              >
                <Text style={[styles.inlineBtnText, currency === option && styles.inlineBtnTextActive]}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Exemple de conversion</Text>
        <Text style={styles.priceExample}>{formatPrice(1200)}</Text>

        <TouchableOpacity style={styles.listRow} onPress={() => navigation.navigate('SavedSearches')}>
          <Text style={styles.listRowText}>Recherches sauvegardées</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.listRow} onPress={() => navigation.navigate('Favorites')}>
          <Text style={styles.listRowText}>Favoris</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.listRow} onPress={() => navigation.navigate('HomeTabs', { screen: 'Mes annonces' })}>
          <Text style={styles.listRowText}>Mes annonces</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.listRow} onPress={() => navigation.navigate('Legal')}>
          <Text style={styles.listRowText}>Mentions légales</Text>
        </TouchableOpacity>
        {user ? (
          <TouchableOpacity style={styles.primaryButton} onPress={async () => {
            const { error } = await supabase.auth.signOut();
            if (error) Alert.alert('Déconnexion', error.message);
          }}>
            <Text style={styles.primaryButtonText}>Se déconnecter</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('Connexion')}>
            <Text style={styles.primaryButtonText}>Se connecter</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ListingDetailScreen({ route, navigation }: any) {
  const listing: Listing = route.params.listing;
  const { favorites, toggleFavorite, formatPrice, user } = useAppContext();
  const [reportVisible, setReportVisible] = useState(false);
  const [reportReason, setReportReason] = useState<ReportReason>('Informations incorrectes');
  const [reportDetails, setReportDetails] = useState('');
  const [copied, setCopied] = useState(false);

  const photos = [listing.photo_1, listing.photo_2, listing.photo_3, listing.photo_4, listing.photo_5, listing.photo_6, listing.photo_7, listing.photo_8, listing.photo_9, listing.photo_10].filter(Boolean) as string[];

  const handleCopy = async () => {
    await Clipboard.setStringAsync(listing.contact_phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const shareListing = async () => {
    await Share.share({ message: `${listing.titre} - ${listing.commune} - ${listing.prix_usd ?? 0} USD` });
  };

  const reportListing = async () => {
    if (!user) {
      setReportVisible(false);
      Alert.alert('Connexion requise', 'Connectez-vous pour signaler cette annonce.', [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Se connecter', onPress: () => navigation.navigate('Connexion') },
      ]);
      return;
    }

    const payload = {
      listing_id: listing.id,
      user_id: user.id,
      reason: reportReason,
      details: reportDetails,
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('reports').insert([payload]);
    if (error) {
      Alert.alert('Erreur', error.message);
      return;
    }

    setReportVisible(false);
    Alert.alert('Annonce signalée', 'Merci pour votre signalement.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {photos.map((photo, index) => (
            <Image key={`${photo}-${index}`} source={{ uri: photo }} style={styles.galleryImage} />
          ))}
        </ScrollView>

        <View style={styles.detailContent}>
          <View style={styles.detailHeaderRow}>
            <Text style={styles.detailTitle}>{listing.titre}</Text>
            <TouchableOpacity onPress={() => toggleFavorite(listing.id)}>
              <Ionicons name={favorites.includes(listing.id) ? 'heart' : 'heart-outline'} size={28} color={favorites.includes(listing.id) ? '#CE1021' : brandBlue} />
            </TouchableOpacity>
          </View>

          <Text style={styles.detailPrice}>{formatPrice(listing.prix_usd ?? listing.price_per_night_usd ?? 0)}</Text>
          <View style={[styles.badge, { backgroundColor: getVerificationBadge(listing).color }]}>
            <Text style={styles.badgeText}>{getVerificationBadge(listing).label}</Text>
          </View>

          {user?.id === listing.user_id && (
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('EditListing', { listing })}>
                <Text style={styles.secondaryButtonText}>Modifier</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => Alert.alert('Supprimer l’annonce', 'Cette action est définitive.', [
                { text: 'Annuler', style: 'cancel' },
                { text: 'Supprimer', style: 'destructive', onPress: async () => {
                  const { error } = await supabase.from('listings').delete().eq('id', listing.id).eq('user_id', user.id);
                  if (error) {
                    Alert.alert('Erreur', error.message);
                    return;
                  }
                  navigation.goBack();
                } },
              ])}>
                <Text style={styles.secondaryButtonText}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.descriptionText}>{listing.description}</Text>

          <View style={styles.gridSpecs}>
            <Text style={styles.specItem}>Province: {listing.province}</Text>
            <Text style={styles.specItem}>Commune: {listing.commune}</Text>
            <Text style={styles.specItem}>Adresse: {listing.adresse}</Text>
            {listing.property_type && <Text style={styles.specItem}>Type: {listing.property_type}</Text>}
            {listing.bedrooms && <Text style={styles.specItem}>Chambres: {listing.bedrooms}</Text>}
            {listing.bathrooms && <Text style={styles.specItem}>Salles de bain: {listing.bathrooms}</Text>}
            {listing.surface_m2 && <Text style={styles.specItem}>Surface: {listing.surface_m2} m²</Text>}
            {listing.land_dimensions && <Text style={styles.specItem}>Dimensions: {listing.land_dimensions}</Text>}
            {listing.land_usage && <Text style={styles.specItem}>Usage: {listing.land_usage}</Text>}
            {listing.stars && <Text style={styles.specItem}>Étoiles: {listing.stars}</Text>}
            {listing.max_adults && <Text style={styles.specItem}>Adultes max: {listing.max_adults}</Text>}
          </View>

          {listing.category === 'rent' && listing.deposit_months_required && (
            <View style={styles.depositBox}>
              <Text style={styles.depositTitle}>Calcul du dépôt</Text>
              <Text style={styles.depositText}>{formatPrice(listing.prix_usd ?? 0)} × {listing.deposit_months_required} mois = {formatPrice((listing.prix_usd ?? 0) * (listing.deposit_months_required ?? 0))}</Text>
            </View>
          )}

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.secondaryButton} onPress={shareListing}>
              <Text style={styles.secondaryButtonText}>Partager</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => setReportVisible(true)}>
              <Text style={styles.secondaryButtonText}>Signaler</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.contactBox}>
            <Text style={styles.contactTitle}>Contact</Text>
            <Text style={styles.contactName}>{listing.contact_name}</Text>
            <Text style={styles.contactPhone}>{listing.contact_phone}</Text>
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.primaryButtonMini} onPress={handleCopy}>
                <Text style={styles.primaryButtonText}>{copied ? 'Copié !' : 'Copier le numéro'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryButtonMini} onPress={() => Linking.openURL(`tel:${listing.contact_phone}`)}>
                <Text style={styles.primaryButtonText}>Appeler</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('SellerProfile', { sellerName: listing.contact_name })}>
            <Text style={styles.linkText}>Voir toutes les annonces de ce vendeur</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Annonces similaires</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={mockListings.filter((item) => item.id !== listing.id).slice(0, 3)}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.horizontalCardSmall} onPress={() => navigation.push('ListingDetail', { listing: item })}>
                <Image source={{ uri: item.photo_1 || fakePhotos[0] }} style={styles.horizontalImageSmall} />
                <Text style={styles.horizontalTitle}>{item.titre}</Text>
                <Text style={styles.horizontalPrice}>{formatPrice(item.prix_usd ?? item.price_per_night_usd ?? 0)}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </ScrollView>

      <Modal visible={reportVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.sectionTitle}>Signaler cette annonce</Text>
            <TextInput value={reportReason} onChangeText={(value) => setReportReason(value as ReportReason)} style={styles.input} />
            <TextInput style={[styles.input, styles.textArea]} multiline value={reportDetails} onChangeText={setReportDetails} placeholder="Détails" />
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => setReportVisible(false)}>
                <Text style={styles.secondaryButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryButtonMini} onPress={reportListing}>
                <Text style={styles.primaryButtonText}>Envoyer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      Alert.alert('Connexion', error.message);
      return;
    }
    navigation.navigate('HomeTabs', { screen: 'Accueil' });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screenPad}>
        <BrandHeader />
        <Text style={styles.sectionTitle}>Connexion</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" autoCapitalize="none" />
        <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Mot de passe" secureTextEntry />
        <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
          <Text style={styles.primaryButtonText}>Se connecter</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.linkText}>Mot de passe oublié ?</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('Inscription')}>
          <Text style={styles.linkText}>Créer un compte</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function SignUpScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSignUp = async () => {
    if (!fullName.trim() || !email.trim() || password.length < 8) {
      Alert.alert('Informations requises', 'Indiquez votre nom, un email valide et un mot de passe de 8 caractères minimum.');
      return;
    }

    if (!formatPhone(phone)) {
      Alert.alert('Téléphone invalide', 'Le numéro doit être au format +243 suivi de 9 chiffres.');
      return;
    }

    const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName, phone } } });
    if (error) {
      Alert.alert('Inscription', error.message);
      return;
    }
    Alert.alert('Inscription', 'Votre compte a bien été créé.');
    navigation.navigate('Connexion');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screenPad}>
        <BrandHeader />
        <Text style={styles.sectionTitle}>Inscription</Text>
        <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Nom complet" />
        <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" autoCapitalize="none" />
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="+243XXXXXXXXX" />
        <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Mot de passe" secureTextEntry />
        <TouchableOpacity style={styles.primaryButton} onPress={handleSignUp}>
          <Text style={styles.primaryButtonText}>Créer le compte</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');

  const submit = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      Alert.alert('Réinitialisation', error.message);
      return;
    }
    Alert.alert('Réinitialisation', 'Un email de réinitialisation a été envoyé.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screenPad}>
        <BrandHeader />
        <Text style={styles.sectionTitle}>Mot de passe oublié</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" autoCapitalize="none" />
        <TouchableOpacity style={styles.primaryButton} onPress={submit}>
          <Text style={styles.primaryButtonText}>Envoyer</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function SellerProfileScreen({ route }: any) {
  const sellerName = route.params.sellerName || 'Vendeur';
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screenPad}>
        <Text style={styles.sectionTitle}>{sellerName}</Text>
        {mockListings.map((item) => (
          <ListingCard key={item.id} item={item} navigation={null as any} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function FavoritesScreen({ navigation }: any) {
  const { favorites } = useAppContext();
  const items = mockListings.filter((item) => favorites.includes(item.id));

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screenPad}>
        <BrandHeader />
        <Text style={styles.sectionTitle}>Favoris</Text>
        {items.length === 0 ? <Text style={styles.emptyText}>Aucun favori enregistré.</Text> : items.map((item) => <ListingCard key={item.id} item={item} navigation={navigation} />)}
      </ScrollView>
    </SafeAreaView>
  );
}

function SavedSearchesScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screenPad}>
        <BrandHeader />
        <Text style={styles.sectionTitle}>Recherches sauvegardées</Text>
        <View style={styles.accountCard}>
          <Text style={styles.actionText}>Aucune recherche sauvegardée pour le moment.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function LegalScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screenPad}>
        <BrandHeader />
        <Text style={styles.sectionTitle}>Mentions légales</Text>
        <Text style={styles.legalText}>Nous collectons les données nécessaires au bon fonctionnement du service, notamment : nom complet, numéro de téléphone, adresse e-mail et photos de biens publiés. Ces informations sont utilisées pour la gestion des comptes, la sécurité, la communication avec les acheteurs et les vendeurs, ainsi que pour la conformité des annonces immobilières.</Text>
        <Text style={styles.legalText}>Nous ne partageons pas vos informations personnelles avec des tiers non autorisés, sauf si la loi l'exige. En publiant une annonce, vous acceptez que votre nom, votre téléphone et les photos du bien soient visibles dans le cadre du service Congo Logement.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function EditListingScreen({ route, navigation }: any) {
  const listing = route.params.listing as Listing;
  const [titre, setTitre] = useState(listing.titre);
  const [description, setDescription] = useState(listing.description);
  const [prix, setPrix] = useState(String(listing.prix_usd));
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const price = Number(prix);
    if (!titre.trim() || !description.trim() || !Number.isFinite(price) || price <= 0) {
      Alert.alert('Informations invalides', 'Vérifiez le titre, la description et le prix.');
      return;
    }

    setSaving(true);
    const { error } = await supabase.from('listings').update({ titre: titre.trim(), description: description.trim(), prix_usd: price }).eq('id', listing.id);
    setSaving(false);
    if (error) {
      Alert.alert('Erreur', error.message);
      return;
    }
    Alert.alert('Annonce modifiée', 'Vos modifications ont été enregistrées.');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screenPad}>
        <BrandHeader />
        <Text style={styles.sectionTitle}>Modifier une annonce</Text>
        <TextInput style={styles.input} value={titre} onChangeText={setTitre} placeholder="Titre" />
        <TextInput style={[styles.input, styles.textArea]} multiline value={description} onChangeText={setDescription} placeholder="Description" />
        <TextInput style={styles.input} value={prix} onChangeText={setPrix} keyboardType="numeric" placeholder="Prix en USD" />
        <TouchableOpacity style={styles.primaryButton} onPress={save} disabled={saving}>
          <Text style={styles.primaryButtonText}>{saving ? 'Enregistrement…' : 'Enregistrer'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: string = 'home';
          if (route.name === 'Accueil') iconName = 'home';
          if (route.name === 'Explorer') iconName = 'search';
          if (route.name === 'Publier') iconName = 'add-circle';
          if (route.name === 'Mes annonces') iconName = 'list';
          if (route.name === 'Compte') iconName = 'person';
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        headerShown: false,
        tabBarActiveTintColor: gold,
        tabBarInactiveTintColor: '#B9C4D8',
        tabBarStyle: { backgroundColor: darkAccent, borderTopWidth: 0, height: 72, paddingTop: 8 },
      })}
    >
      <Tabs.Screen name="Accueil" component={HomeScreen} />
      <Tabs.Screen name="Explorer" component={ExplorerScreen} />
      <Tabs.Screen name="Publier" component={PublishScreen} />
      <Tabs.Screen name="Mes annonces" component={MyListingsScreen} />
      <Tabs.Screen name="Compte" component={AccountScreen} />
    </Tabs.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <Stack.Navigator initialRouteName="HomeTabs" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="HomeTabs" component={MainTabs} />
            <Stack.Screen name="ListingDetail" component={ListingDetailScreen} />
            <Stack.Screen name="Connexion" component={LoginScreen} />
            <Stack.Screen name="Inscription" component={SignUpScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="EditListing" component={EditListingScreen} />
            <Stack.Screen name="SellerProfile" component={SellerProfileScreen} />
            <Stack.Screen name="Favorites" component={FavoritesScreen} />
            <Stack.Screen name="SavedSearches" component={SavedSearchesScreen} />
            <Stack.Screen name="Legal" component={LegalScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  screenPad: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    paddingTop: 8,
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: '#1E6FE0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  logoGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1E6FE0',
  },
  logoIcon: {
    position: 'absolute',
    zIndex: 1,
  },
  brandWords: {
    flexShrink: 1,
  },
  wordmark: {
    color: brandBlue,
    fontSize: 26,
    fontWeight: '700',
  },
  tagline: {
    color: '#4B7FE7',
    fontSize: 11,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    paddingVertical: 0,
    color: '#111827',
    fontSize: 14,
  },
  searchPlaceholder: {
    marginLeft: 8,
    color: muted,
    fontSize: 14,
  },
  heroPanel: {
    backgroundColor: darkAccent,
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
  },
  heroText: {
    color: '#D8E4FF',
    fontSize: 14,
    lineHeight: 20,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  categoryTile: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryLabel: {
    marginTop: 8,
    fontSize: 15,
    color: brandBlue,
    fontWeight: '600',
  },
  sectionTitle: {
    color: brandBlue,
    fontSize: 20,
    fontWeight: '700',
    marginVertical: 12,
  },
  linkText: {
    color: lightBlue,
    fontWeight: '600',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  horizontalCard: {
    width: 220,
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  horizontalImage: {
    width: '100%',
    height: 120,
  },
  horizontalBody: {
    padding: 10,
  },
  horizontalTitle: {
    color: brandBlue,
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 4,
  },
  horizontalPrice: {
    color: brandBlue,
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 6,
  },
  trustStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statNumber: {
    color: brandBlue,
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    color: muted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 14,
  },
  cardImageWrap: {
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: 180,
  },
  favoriteChip: {
    position: 'absolute',
    right: 12,
    top: 12,
    backgroundColor: 'rgba(12,42,94,0.7)',
    borderRadius: 20,
    padding: 8,
  },
  cardBody: {
    padding: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardTitle: {
    color: brandBlue,
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  priceText: {
    color: brandBlue,
    fontSize: 15,
    fontWeight: '800',
  },
  metaText: {
    color: muted,
    fontSize: 13,
    marginTop: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  typeText: {
    color: brandBlue,
    fontWeight: '600',
    fontSize: 12,
  },
  segmentControl: {
    flexDirection: 'row',
    backgroundColor: '#EAF1FF',
    borderRadius: 12,
    padding: 4,
    marginBottom: 14,
  },
  segmentButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  segmentButtonActive: {
    backgroundColor: brandBlue,
  },
  segmentText: {
    color: brandBlue,
    fontWeight: '700',
  },
  segmentTextActive: {
    color: '#fff',
  },
  filterCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  filterLabel: {
    color: brandBlue,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
    color: '#111827',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  switchLabel: {
    color: brandBlue,
    fontWeight: '600',
  },
  inlineButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  inlineButtonsInlineWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  inlineBtn: {
    backgroundColor: '#EAF1FF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  inlineBtnActive: {
    backgroundColor: brandBlue,
  },
  inlineBtnText: {
    color: brandBlue,
    fontWeight: '700',
  },
  inlineBtnTextActive: {
    color: '#fff',
  },
  mapPanel: {
    backgroundColor: '#EAF1FF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  mapText: {
    color: brandBlue,
    fontWeight: '700',
    marginBottom: 8,
  },
  mapBubbleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  mapPin: {
    backgroundColor: gold,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  mapPinText: {
    color: darkAccent,
    fontWeight: '700',
    fontSize: 12,
  },
  resultsHeader: {
    marginVertical: 8,
  },
  primaryButton: {
    backgroundColor: gold,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  primaryButtonMini: {
    backgroundColor: gold,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  primaryButtonText: {
    color: darkAccent,
    fontWeight: '800',
    fontSize: 15,
  },
  secondaryButton: {
    backgroundColor: '#EAF1FF',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  secondaryButtonText: {
    color: brandBlue,
    fontWeight: '700',
  },
  accountCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  accountName: {
    color: brandBlue,
    fontSize: 22,
    fontWeight: '700',
  },
  accountMeta: {
    color: muted,
    marginTop: 6,
  },
  priceExample: {
    color: brandBlue,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 12,
  },
  listRow: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  listRowText: {
    color: brandBlue,
    fontWeight: '700',
    fontSize: 15,
  },
  detailContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  galleryImage: {
    width: 260,
    height: 220,
    marginRight: 8,
    borderRadius: 14,
  },
  detailHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
  },
  detailTitle: {
    color: brandBlue,
    fontWeight: '800',
    fontSize: 24,
    flex: 1,
  },
  detailPrice: {
    color: brandBlue,
    fontSize: 22,
    fontWeight: '800',
    marginVertical: 8,
  },
  descriptionText: {
    color: '#374151',
    fontSize: 15,
    lineHeight: 22,
    marginVertical: 10,
  },
  gridSpecs: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  specItem: {
    color: brandBlue,
    fontSize: 14,
    marginBottom: 6,
  },
  depositBox: {
    backgroundColor: '#EEF7FF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  depositTitle: {
    color: brandBlue,
    fontWeight: '700',
    marginBottom: 5,
  },
  depositText: {
    color: '#1F2937',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  contactBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    marginVertical: 12,
  },
  contactTitle: {
    color: brandBlue,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 5,
  },
  contactName: {
    color: '#111827',
    fontWeight: '600',
  },
  contactPhone: {
    color: muted,
    marginBottom: 12,
  },
  linkButton: {
    marginVertical: 8,
  },
  emptyText: {
    color: muted,
    textAlign: 'center',
    marginTop: 20,
  },
  legalText: {
    color: '#374151',
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 12,
  },
  actionText: {
    color: brandBlue,
    fontSize: 15,
  },
  horizontalCardSmall: {
    width: 180,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingBottom: 8,
  },
  horizontalImageSmall: {
    width: '100%',
    height: 110,
  },
  chip: {
    backgroundColor: '#EAF1FF',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: {
    backgroundColor: brandBlue,
  },
  chipText: {
    color: brandBlue,
    fontWeight: '700',
  },
  chipTextActive: {
    color: '#fff',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 18,
  },
});
