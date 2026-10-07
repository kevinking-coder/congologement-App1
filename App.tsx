import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { File } from 'expo-file-system/next';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import * as Linking from 'expo-linking';
import { StatusBar } from 'expo-status-bar';
import { ResizeMode, Video } from 'expo-av';
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TextInput as NativeTextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Svg, { ClipPath, Defs, Path } from 'react-native-svg';
import { supabase } from './src/lib/supabase';

type Currency = 'USD' | 'CDF';
type ListingCategory = 'buy' | 'rent' | 'hotel';
type ListingRecordCategory = ListingCategory | 'land';
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
  category: ListingRecordCategory;
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
  video_1?: string;
  video_2?: string;
  video_3?: string;
  video_4?: string;
  video_5?: string;
  video_6?: string;
  video_7?: string;
  video_8?: string;
  video_9?: string;
  video_10?: string;
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
  available_from?: string;
  available_until?: string;
  province: string;
  latitude?: number;
  longitude?: number;
  deposit_months_required?: number;
  max_occupants?: number;
  compound_houses_count?: number;
  building_apartments_count?: number;
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
const listingPhotosBucket = 'listing-photos';
const listingVideosBucket = 'listing-video';
const maxListingPhotos = 10;
const listingVideoColumns = [
  'video_1',
  'video_2',
  'video_3',
  'video_4',
  'video_5',
  'video_6',
  'video_7',
  'video_8',
  'video_9',
  'video_10',
] as const;
const maxListingVideos = listingVideoColumns.length;
const maxVideoSizeBytes = 100 * 1024 * 1024;
const maxVideoDurationMs = 60 * 1000;
const themeStorageKey = 'congo-logement-theme';
const congoBlue = '#007FFF';
const congoYellow = '#F7D618';

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

function decodeBase64Image(base64: string) {
  const encoded = base64.includes(',') ? base64.slice(base64.indexOf(',') + 1) : base64;
  const binary = globalThis.atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

async function uploadListingPhotos(photos: ImagePicker.ImagePickerAsset[], userId: string) {
  const uploadedPaths: string[] = [];
  const photoUrls: string[] = [];

  try {
    for (const photo of photos) {
      let file: Uint8Array;
      try {
        const compressed = await ImageManipulator.manipulateAsync(
          photo.uri,
          [{ resize: { width: 1600 } }],
          { compress: 0.78, format: ImageManipulator.SaveFormat.JPEG },
        );
        file = await new File(compressed.uri).bytes();
      } catch (error) {
        if (!photo.base64) {
          throw new Error(
            `Impossible de traiter la photo sélectionnée. Téléchargez-la sur votre téléphone puis réessayez. Détail : ${error instanceof Error ? error.message : 'erreur inconnue'}`,
          );
        }

        file = decodeBase64Image(photo.base64);
      }

      if (file.byteLength > 10 * 1024 * 1024) {
        throw new Error('Cette photo dépasse la limite de 10 Mo. Choisissez une image plus petite.');
      }

      const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
      const { error } = await supabase.storage
        .from(listingPhotosBucket)
        .upload(path, file, {
          contentType: 'image/jpeg',
          upsert: false,
        });
      if (error) throw error;

      uploadedPaths.push(path);
      photoUrls.push(supabase.storage.from(listingPhotosBucket).getPublicUrl(path).data.publicUrl);
    }
    return { photoUrls, uploadedPaths };
  } catch (error) {
    if (uploadedPaths.length > 0) {
      const { error: cleanupError } = await supabase.storage.from(listingPhotosBucket).remove(uploadedPaths);
      if (cleanupError) {
        throw new Error(`${error instanceof Error ? error.message : 'Échec de l’envoi des photos.'} Le nettoyage des photos incomplètes a également échoué : ${cleanupError.message}`);
      }
    }
    throw error;
  }
}

async function uploadListingVideo(video: ImagePicker.ImagePickerAsset, userId: string) {
  if (!Number.isFinite(video.duration) || Number(video.duration) <= 0 || Number(video.duration) > maxVideoDurationMs) {
    throw new Error('La vidéo doit durer au maximum 1 minute.');
  }
  const file = await new File(video.uri).bytes();
  if (file.byteLength > maxVideoSizeBytes) {
    throw new Error('La vidéo dépasse la limite de 100 Mo. Choisissez une vidéo plus courte ou plus légère.');
  }

  const contentType = video.mimeType || 'video/mp4';
  const extension = contentType === 'video/quicktime' ? 'mov' : 'mp4';
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
  const { error } = await supabase.storage.from(listingVideosBucket).upload(path, file, {
    contentType,
    upsert: false,
  });
  if (error) throw error;
  return {
    path,
    videoUrl: supabase.storage.from(listingVideosBucket).getPublicUrl(path).data.publicUrl,
  };
}

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function getPhotoUploadErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : 'Une erreur inattendue est survenue.';
  if (/bucket.*not found/i.test(message)) {
    return `Le stockage des photos n’est pas configuré. Exécutez supabase/storage-setup.sql dans le SQL Editor de votre projet Supabase. Détail : ${message}`;
  }
  if (/row-level security|permission denied|not authorized/i.test(message)) {
    return `Supabase a refusé l’envoi. Vérifiez que vous êtes connecté et que les règles du bucket listing-photos sont configurées avec supabase/storage-setup.sql. Détail : ${message}`;
  }
  if (/impossible de traiter la photo|dépasse la limite de 10 mo/i.test(message)) {
    return message;
  }
  return `Échec de l’envoi de la photo. Vérifiez votre connexion et la configuration du bucket listing-photos dans Supabase. Détail : ${message}`;
}

const AppContext = createContext<{
  currency: Currency;
  setCurrency: (c: Currency) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  formatPrice: (value: number) => string;
  favorites: string[];
  toggleFavorite: (listingId: string) => void;
  user: { id: string; email?: string; user_metadata?: { full_name?: string; phone?: string } } | null;
} | null>(null);

type Theme = 'light' | 'dark';
let activeTheme: Theme = 'light';

function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('AppContext missing');
  }
  return context;
}

function TextInput(props: TextInputProps) {
  return (
    <NativeTextInput
      {...props}
      placeholderTextColor={props.placeholderTextColor ?? (activeTheme === 'dark' ? '#94A3B8' : muted)}
    />
  );
}

function AppProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>('USD');
  const [theme, setTheme] = useState<Theme>('light');
  const [themeLoaded, setThemeLoaded] = useState(false);
  activeTheme = theme;
  const [favorites, setFavorites] = useState<string[]>([]);
  const [user, setUser] = useState<{ id: string; email?: string; user_metadata?: { full_name?: string; phone?: string } } | null>(null);

  useEffect(() => {
    let active = true;
    let authEventReceived = false;
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      authEventReceived = true;
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data, error }) => {
      if (active && !authEventReceived) setUser(data.session?.user ?? null);
      if (active && error) Alert.alert('Session', error.message);
    }).catch((error: unknown) => {
      if (active) Alert.alert('Session', error instanceof Error ? error.message : 'Impossible de vérifier la session.');
    });
    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(themeStorageKey).then((savedTheme) => {
      if (active && (savedTheme === 'light' || savedTheme === 'dark')) setTheme(savedTheme);
      if (active) setThemeLoaded(true);
    }).catch((error: unknown) => {
      if (active) {
        Alert.alert('Thème', error instanceof Error ? error.message : 'Impossible de charger le thème enregistré.');
        setThemeLoaded(true);
      }
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    activeTheme = theme;
    if (!themeLoaded) return;
    AsyncStorage.setItem(themeStorageKey, theme).catch((error: unknown) => {
      Alert.alert('Thème', error instanceof Error ? error.message : 'Impossible d’enregistrer le thème choisi.');
    });
  }, [theme, themeLoaded]);

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
      theme,
      setTheme,
      formatPrice,
      favorites,
      toggleFavorite,
      user,
    }),
    [currency, favorites, theme, user],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

const Tabs = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function LogoMark() {
  return (
    <View style={styles.logoBadge}>
      <Svg width={52} height={52} viewBox="0 0 52 52">
        <Defs>
          <ClipPath id="drcLogoClip">
            <Path d="M26 0a26 26 0 1 0 0 52a26 26 0 1 0 0-52z" />
          </ClipPath>
        </Defs>
        <Path d="M26 0a26 26 0 1 0 0 52a26 26 0 1 0 0-52z" fill={congoBlue} />
        <Path d="M-6 40 40 -6h18L6 58H-6z" fill={congoYellow} clipPath="url(#drcLogoClip)" />
        <Path d="M-3 42 42 -3h13L3 55H-3z" fill={red} clipPath="url(#drcLogoClip)" />
        <Path d="M11 24.5 26 12l15 12.5h-4V40H15V24.5z" fill="#fff" fillRule="evenodd" />
        <Path d="M23 31h6v9h-6z" fill={brandBlue} />
      </Svg>
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

function FormInput({
  label,
  required = false,
  style,
  ...inputProps
}: { label: string; required?: boolean } & TextInputProps) {
  return (
    <View>
      <Text style={styles.formFieldLabel}>
        {label}{required ? ' *' : ''}
      </Text>
      <TextInput
        {...inputProps}
        accessibilityLabel={label}
        style={[styles.input, style]}
        placeholderTextColor={activeTheme === 'dark' ? '#94A3B8' : muted}
      />
    </View>
  );
}

function ListingCard({ item, navigation }: { item: Listing; navigation: any }) {
  const { favorites, toggleFavorite, formatPrice } = useAppContext();
  const isFavorite = favorites.includes(item.id);

  return (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ListingDetail', { listing: item })}>
      <View style={styles.cardImageWrap}>
        <ListingThumbnail item={item} variant="card" />
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

function ListingThumbnail({
  item,
  variant,
}: {
  item: Listing;
  variant: 'card' | 'horizontal' | 'small';
}) {
  const imageStyle = variant === 'card'
    ? styles.cardImage
    : variant === 'horizontal'
      ? styles.horizontalImage
      : styles.horizontalImageSmall;
  const hasVideo = listingVideoColumns.some((column) => Boolean(item[column]));

  if (item.photo_1) {
    return <Image source={{ uri: item.photo_1 }} style={imageStyle} />;
  }

  if (hasVideo) {
    return (
      <View style={[imageStyle, styles.videoAvailablePlaceholder]}>
        <Ionicons name="play" size={variant === 'small' ? 26 : 32} color="#fff" />
        <Text style={styles.videoAvailableText}>Vidéo disponible.</Text>
      </View>
    );
  }

  return (
    <View style={[imageStyle, styles.photoPlaceholder]}>
      <Ionicons name="home-outline" size={variant === 'small' ? 30 : variant === 'card' ? 38 : 34} color="#8EA5C7" />
    </View>
  );
}

function HomeScreen({ navigation }: any) {
  const { formatPrice } = useAppContext();
  const [featured, setFeatured] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  React.useEffect(() => {
    let active = true;
    const load = async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      if (!active) return;
      if (error) {
        Alert.alert('Chargement des annonces', error.message);
      } else {
        setFeatured((data ?? []) as Listing[]);
      }
      setLoading(false);
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screenPad}>
        <BrandHeader />
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={activeTheme === 'dark' ? '#94A3B8' : muted} />
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={() => navigation.navigate('HomeTabs', { screen: 'Explorer', params: { search: searchText } })}
            returnKeyType="search"
            style={styles.searchInput}
            placeholder="Ville, commune ou bien"
            placeholderTextColor={activeTheme === 'dark' ? '#94A3B8' : muted}
          />
        </View>

        <View style={styles.heroPanel}>
          <Text style={styles.heroTitle}>Trouvez votre bien au bon endroit.</Text>
          <Text style={styles.heroText}>Appartements, maisons, terrains et hôtels sur le marché immobilier de la RDC.</Text>
        </View>

        <View style={styles.categoryGrid}>
          {[
            { label: 'Acheter', icon: 'cash', category: 'buy' },
            { label: 'Louer', icon: 'key', category: 'rent' },
            { label: 'Hôtels', icon: 'bed', category: 'hotel' },
          ].map((item) => (
            <TouchableOpacity key={item.label} style={styles.categoryTile} onPress={() => navigation.navigate('HomeTabs', { screen: 'Explorer', params: { category: item.category } })}>
              <Ionicons name={item.icon as any} size={26} color={activeTheme === 'dark' ? lightBlue : brandBlue} />
              <Text style={styles.categoryLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Annonces récentes</Text>
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
              <ListingThumbnail item={item} variant="horizontal" />
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
        {loading ? <Text style={styles.emptyText}>Chargement des annonces…</Text> : null}
        {!loading && featured.length === 0 ? <Text style={styles.emptyText}>Aucune annonce disponible pour le moment.</Text> : null}

      </ScrollView>
    </SafeAreaView>
  );
}

function ExplorerScreen({ navigation, route }: any) {
  const { formatPrice } = useAppContext();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [segment, setSegment] = useState<ListingCategory>(route.params?.category === 'rent' || route.params?.category === 'hotel' ? route.params.category : 'buy');
  const [province, setProvince] = useState('');
  const [commune, setCommune] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [minimumPrice, setMinimumPrice] = useState('');
  const [maximumPrice, setMaximumPrice] = useState('');
  const [minimumBedrooms, setMinimumBedrooms] = useState('');
  const [minimumBathrooms, setMinimumBathrooms] = useState('');
  const [maximumDeposit, setMaximumDeposit] = useState('');
  const [minimumStars, setMinimumStars] = useState('');
  const [guestAdults, setGuestAdults] = useState('');
  const [travelingWithChildren, setTravelingWithChildren] = useState(false);
  const [guestChildren, setGuestChildren] = useState('');
  const [arrivalDate, setArrivalDate] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [searchText, setSearchText] = useState(route.params?.search ?? '');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'price'>('newest');

  React.useEffect(() => {
    if (route.params?.search !== undefined) setSearchText(route.params.search);
  }, [route.params?.search]);

  React.useEffect(() => {
    if (route.params?.category) {
      setSegment(route.params.category === 'rent' || route.params.category === 'hotel' ? route.params.category : 'buy');
      setPropertyType('');
    }
  }, [route.params?.category]);

  React.useEffect(() => {
    let active = true;
    const load = async () => {
      const { data, error } = await supabase.from('listings').select('*').order('created_at', { ascending: false });
      if (!active) return;
      if (error) {
        Alert.alert('Chargement des annonces', error.message);
      } else {
        setListings((data ?? []) as Listing[]);
      }
      setLoading(false);
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const filtered = listings.filter((listing) => {
    const categoryMatch = segment === 'buy'
      ? listing.category === 'buy' || listing.category === 'land'
      : listing.category === segment;
    const provinceMatch = !province || listing.province?.toLocaleLowerCase('fr') === province.toLocaleLowerCase('fr');
    const communeMatch = !commune || listing.commune?.toLocaleLowerCase('fr') === commune.toLocaleLowerCase('fr');
    const propertyTypeMatch = !propertyType || listing.property_type === propertyType;
    const price = Number(listing.prix_usd ?? listing.price_per_night_usd ?? 0);
    const minimumPriceMatch = !minimumPrice || price >= Number(minimumPrice);
    const maximumPriceMatch = !maximumPrice || price <= Number(maximumPrice);
    const hasRooms = ['Maison', 'Appartement', 'Studio'].includes(listing.property_type);
    const roomFiltersApply = segment !== 'hotel' && (!propertyType || ['Maison', 'Appartement', 'Studio'].includes(propertyType));
    const bedroomsMatch = !roomFiltersApply || !minimumBedrooms || (hasRooms && Number(listing.bedrooms ?? -1) >= Number(minimumBedrooms));
    const bathroomsMatch = !roomFiltersApply || !minimumBathrooms || (hasRooms && Number(listing.bathrooms ?? -1) >= Number(minimumBathrooms));
    const depositMatch = segment !== 'rent' || !maximumDeposit
      || (listing.deposit_months_required != null && listing.deposit_months_required <= Number(maximumDeposit));
    const starsMatch = segment !== 'hotel' || !minimumStars
      || (listing.stars != null && listing.stars >= Number(minimumStars));
    const adultCapacityMatch = segment !== 'hotel' || !guestAdults
      || (listing.max_adults != null && listing.max_adults >= Number(guestAdults));
    const childCapacityMatch = segment !== 'hotel' || !travelingWithChildren
      || (listing.children_allowed === true && listing.max_children != null && listing.max_children >= Number(guestChildren || 1));
    const availabilityFrom = listing.available_from ? String(listing.available_from).slice(0, 10) : '';
    const availabilityUntil = listing.available_until ? String(listing.available_until).slice(0, 10) : '';
    const datesMatch = segment !== 'hotel' || (!arrivalDate && !departureDate) || (
      Boolean(availabilityFrom && availabilityUntil)
      && (!arrivalDate || (isValidDate(arrivalDate) && arrivalDate >= availabilityFrom && arrivalDate <= availabilityUntil))
      && (!departureDate || (isValidDate(departureDate) && departureDate >= availabilityFrom && departureDate <= availabilityUntil))
      && (!arrivalDate || !departureDate || arrivalDate <= departureDate)
    );
    const verifiedMatch = !verifiedOnly || listing.verified;
    const searchMatch = !searchText.trim() || `${listing.titre} ${listing.description} ${listing.commune} ${listing.province} ${listing.property_type}`.toLocaleLowerCase('fr').includes(searchText.trim().toLocaleLowerCase('fr'));
    return categoryMatch && provinceMatch && communeMatch && propertyTypeMatch && minimumPriceMatch && maximumPriceMatch
      && bedroomsMatch && bathroomsMatch && depositMatch && starsMatch && adultCapacityMatch && childCapacityMatch
      && datesMatch && verifiedMatch && searchMatch;
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
          {(['buy', 'rent', 'hotel'] as ListingCategory[]).map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.segmentButton, segment === item && styles.segmentButtonActive]}
              onPress={() => { setSegment(item); setPropertyType(''); }}
            >
              <Text style={[styles.segmentText, segment === item && styles.segmentTextActive]}>{item === 'buy' ? 'Acheter' : item === 'rent' ? 'Louer' : 'Hôtels'}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.filterCard}>
          <TextInput value={searchText} onChangeText={setSearchText} style={styles.input} placeholder="Mot-clé" />
          <Text style={styles.filterLabel}>Province</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterOptions}>
            <TouchableOpacity style={[styles.chip, !province && styles.chipActive]} onPress={() => { setProvince(''); setCommune(''); }}>
              <Text style={[styles.chipText, !province && styles.chipTextActive]}>Toutes</Text>
            </TouchableOpacity>
            {Object.keys(provinces).map((item) => (
              <TouchableOpacity key={item} style={[styles.chip, province === item && styles.chipActive]} onPress={() => { setProvince(item); setCommune(''); }}>
                <Text style={[styles.chipText, province === item && styles.chipTextActive]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={styles.filterLabel}>Commune</Text>
          {!province ? <Text style={styles.filterHint}>Choisissez une province pour filtrer par commune.</Text> : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterOptions}>
              <TouchableOpacity style={[styles.chip, !commune && styles.chipActive]} onPress={() => setCommune('')}>
                <Text style={[styles.chipText, !commune && styles.chipTextActive]}>Toutes</Text>
              </TouchableOpacity>
              {(provinces[province] ?? []).map((item) => (
                <TouchableOpacity key={item} style={[styles.chip, commune === item && styles.chipActive]} onPress={() => setCommune(item)}>
                  <Text style={[styles.chipText, commune === item && styles.chipTextActive]}>{item}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
          {segment !== 'hotel' && (
            <>
              <Text style={styles.filterLabel}>Type de bien</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterOptions}>
                {[
                  '',
                  'Maison',
                  'Appartement',
                  'Terrain',
                  'Studio',
                  'Place commerciale',
                  'Place industrielle',
                  'Place agricole',
                  ...(segment === 'buy' ? ['Hôtel'] : []),
                ].map((item) => (
                  <TouchableOpacity key={item || 'all-types'} style={[styles.chip, propertyType === item && styles.chipActive]} onPress={() => setPropertyType(item)}>
                    <Text style={[styles.chipText, propertyType === item && styles.chipTextActive]}>{item || 'Tous'}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}
          <Text style={styles.filterLabel}>{segment === 'hotel' ? 'Prix par nuit (USD)' : 'Prix (USD)'}</Text>
          <View style={styles.priceRangeRow}>
            <View style={styles.filterInputColumn}>
              <Text style={styles.filterHint}>Prix minimum</Text>
              <TextInput value={minimumPrice} onChangeText={setMinimumPrice} style={[styles.input, styles.priceRangeInput]} placeholder="Minimum" keyboardType="numeric" />
            </View>
            <View style={styles.filterInputColumn}>
              <Text style={styles.filterHint}>Prix maximum</Text>
              <TextInput value={maximumPrice} onChangeText={setMaximumPrice} style={[styles.input, styles.priceRangeInput]} placeholder="Maximum" keyboardType="numeric" />
            </View>
          </View>

          {segment !== 'hotel' && (
            <>
              {(!propertyType || ['Maison', 'Appartement', 'Studio'].includes(propertyType)) && (
                <View style={styles.priceRangeRow}>
                  <View style={styles.filterInputColumn}>
                    <Text style={styles.filterLabel}>Chambres minimum</Text>
                    <TextInput value={minimumBedrooms} onChangeText={setMinimumBedrooms} style={styles.input} placeholder="Chambres" keyboardType="numeric" />
                  </View>
                  <View style={styles.filterInputColumn}>
                    <Text style={styles.filterLabel}>Salles de bain minimum</Text>
                    <TextInput value={minimumBathrooms} onChangeText={setMinimumBathrooms} style={styles.input} placeholder="Salles de bain" keyboardType="numeric" />
                  </View>
                </View>
              )}
              {segment === 'rent' && (
                <>
                  <Text style={styles.filterLabel}>Dépôt maximum souhaité (mois)</Text>
                  <TextInput value={maximumDeposit} onChangeText={setMaximumDeposit} style={styles.input} placeholder="Mois maximum" keyboardType="numeric" />
                </>
              )}
            </>
          )}

          {segment === 'hotel' && (
            <>
              <Text style={styles.filterLabel}>Classement minimum en étoiles</Text>
              <TextInput value={minimumStars} onChangeText={setMinimumStars} style={styles.input} placeholder="Étoiles" keyboardType="numeric" />
              <Text style={styles.filterLabel}>Nombre d’adultes</Text>
              <TextInput value={guestAdults} onChangeText={setGuestAdults} style={styles.input} placeholder="Adultes" keyboardType="numeric" />
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Voyagez-vous avec des enfants ?</Text>
                <Switch value={travelingWithChildren} onValueChange={setTravelingWithChildren} />
              </View>
              {travelingWithChildren && (
                <>
                  <Text style={styles.filterLabel}>Nombre d’enfants</Text>
                  <TextInput value={guestChildren} onChangeText={setGuestChildren} style={styles.input} placeholder="Enfants" keyboardType="numeric" />
                </>
              )}
              <Text style={styles.filterLabel}>Date d’arrivée (AAAA-MM-JJ)</Text>
              <TextInput value={arrivalDate} onChangeText={setArrivalDate} style={styles.input} placeholder="AAAA-MM-JJ" />
              <Text style={styles.filterLabel}>Date de départ (AAAA-MM-JJ)</Text>
              <TextInput value={departureDate} onChangeText={setDepartureDate} style={styles.input} placeholder="AAAA-MM-JJ" />
            </>
          )}

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Vérifié uniquement</Text>
            <Switch value={verifiedOnly} onValueChange={setVerifiedOnly} />
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

        <View style={styles.resultsHeader}>
          <Text style={styles.sectionTitle}>{sorted.length} résultats</Text>
        </View>

        {loading ? <Text style={styles.emptyText}>Chargement des annonces…</Text> : null}
        {!loading && sorted.length === 0 ? <Text style={styles.emptyText}>Aucune annonce ne correspond à vos filtres.</Text> : null}
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
  const [priceCurrency, setPriceCurrency] = useState<Currency>('USD');
  const [province, setProvince] = useState('Kinshasa');
  const [commune, setCommune] = useState('Gombe');
  const [adresse, setAdresse] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [availableFrom, setAvailableFrom] = useState('');
  const [availableUntil, setAvailableUntil] = useState('');
  const [depositMonth, setDepositMonth] = useState('');
  const [maxOccupants, setMaxOccupants] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [surface, setSurface] = useState('');
  const [furnished, setFurnished] = useState(false);
  const [landDimensions, setLandDimensions] = useState('');
  const [landUsage, setLandUsage] = useState('');
  const [stars, setStars] = useState('');
  const [availableRooms, setAvailableRooms] = useState('');
  const [amenities, setAmenities] = useState('');
  const [maxAdults, setMaxAdults] = useState('');
  const [childrenAllowed, setChildrenAllowed] = useState(false);
  const [maxChildren, setMaxChildren] = useState('');
  const [compoundHousesCount, setCompoundHousesCount] = useState('');
  const [buildingApartmentsCount, setBuildingApartmentsCount] = useState('');
  const [photos, setPhotos] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [videos, setVideos] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const isLand = propertyType === 'Terrain';
  const isHotelBooking = category === 'hotel';
  const hasRooms = ['Maison', 'Appartement', 'Studio'].includes(propertyType) && !isLand && !isHotelBooking;
  const hasSurfaceOnly = ['Place commerciale', 'Place industrielle', 'Place agricole', 'Hôtel'].includes(propertyType) && !isHotelBooking;
  const typeOptions: PropertyType[] = category === 'rent'
    ? ['Maison', 'Appartement', 'Terrain', 'Studio', 'Place commerciale', 'Place industrielle', 'Place agricole']
    : ['Maison', 'Appartement', 'Terrain', 'Studio', 'Place commerciale', 'Place industrielle', 'Place agricole', 'Hôtel'];

  const chooseCategory = (value: ListingCategory) => {
    setCategory(value);
    if (value === 'hotel') setPropertyType('Hôtel');
    else if (propertyType === 'Hôtel') setPropertyType('Maison');
  };

  const choosePhotos = async () => {
    const remainingSlots = maxListingPhotos - photos.length;
    if (remainingSlots <= 0) {
      Alert.alert('Limite atteinte', `Vous pouvez ajouter au maximum ${maxListingPhotos} photos par annonce.`);
      return;
    }

    try {
      if (Platform.OS === 'ios') {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Accès aux photos refusé', 'Autorisez l’accès à votre photothèque dans les paramètres de votre téléphone pour ajouter des photos.');
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: remainingSlots,
        quality: 0.8,
        base64: true,
      });
      if (!result.canceled) {
        setPhotos((current) => [...current, ...result.assets].slice(0, maxListingPhotos));
      }
    } catch (error) {
      Alert.alert('Sélection des photos impossible', error instanceof Error ? error.message : 'Une erreur est survenue lors de l’ouverture de la photothèque.');
    }
  };

  const pickVideo = async (record = false) => {
    const remainingSlots = maxListingVideos - videos.length;
    if (remainingSlots <= 0) {
      Alert.alert('Limite atteinte', `Vous pouvez ajouter au maximum ${maxListingVideos} vidéos par annonce.`);
      return;
    }

    try {
      if (record) {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Accès à la caméra refusé', 'Autorisez l’accès à la caméra dans les paramètres de votre téléphone pour enregistrer une vidéo.');
          return;
        }
      } else if (Platform.OS === 'ios') {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Accès aux vidéos refusé', 'Autorisez l’accès à votre photothèque dans les paramètres de votre téléphone pour ajouter une vidéo.');
          return;
        }
      }

      const result = record
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ['videos'], videoMaxDuration: 60, quality: 0.7 })
        : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['videos'],
          allowsMultipleSelection: true,
          selectionLimit: remainingSlots,
          videoMaxDuration: 60,
          quality: 0.7,
        });
      if (result.canceled) return;

      const acceptedVideos: ImagePicker.ImagePickerAsset[] = [];
      const rejectedVideos: string[] = [];
      for (const selectedVideo of result.assets) {
        const name = selectedVideo.fileName || 'Vidéo sélectionnée';
        if (!Number.isFinite(selectedVideo.duration) || Number(selectedVideo.duration) <= 0) {
          rejectedVideos.push(`${name} : durée impossible à vérifier.`);
          continue;
        }
        if (Number(selectedVideo.duration) > maxVideoDurationMs) {
          rejectedVideos.push(`${name} : la durée dépasse 1 minute.`);
          continue;
        }
        const fileSize = selectedVideo.fileSize ?? new File(selectedVideo.uri).size;
        if (!Number.isFinite(fileSize) || fileSize <= 0) {
          rejectedVideos.push(`${name} : taille impossible à vérifier.`);
          continue;
        }
        if (fileSize > maxVideoSizeBytes) {
          rejectedVideos.push(`${name} : la taille dépasse 100 Mo.`);
          continue;
        }
        acceptedVideos.push(selectedVideo);
      }

      const videosToAdd = acceptedVideos.slice(0, remainingSlots);
      if (videosToAdd.length > 0) {
        setVideos((current) => [...current, ...videosToAdd].slice(0, maxListingVideos));
      }
      if (acceptedVideos.length > remainingSlots) {
        rejectedVideos.push(`Vous pouvez ajouter au maximum ${maxListingVideos} vidéos par annonce.`);
      }
      if (rejectedVideos.length > 0) {
        Alert.alert('Certaines vidéos n’ont pas été ajoutées', rejectedVideos.join('\n'));
      }
    } catch (error) {
      Alert.alert('Vidéo indisponible', error instanceof Error ? error.message : 'Impossible de sélectionner ou d’enregistrer la vidéo.');
    }
  };

  const submit = async () => {
    if (!user) {
      Alert.alert('Connexion requise', 'Connectez-vous pour publier une annonce.');
      navigation.navigate('Connexion');
      return;
    }

    if (videos.length > maxListingVideos) {
      Alert.alert('Limite de vidéos dépassée', `Vous pouvez ajouter jusqu’à ${maxListingVideos} vidéos par annonce.`);
      return;
    }

    const enteredPrice = Number(prix);
    const price = priceCurrency === 'CDF' ? enteredPrice / 2800 : enteredPrice;
    if (!titre.trim() || !Number.isFinite(price) || price <= 0 || !province || !commune || !contactPhone || !contactName.trim()) {
      Alert.alert('Champs requis', 'Veuillez remplir les informations obligatoires.');
      return;
    }

    if (!formatPhone(contactPhone)) {
      Alert.alert('Téléphone invalide', 'Le numéro doit être au format +243 suivi de 9 chiffres.');
      return;
    }

    const hasInvalidOptionalNumber = (
      value: string,
      minimum: number,
      maximum = Number.POSITIVE_INFINITY,
      integer = true,
    ) => {
      if (!value.trim()) return false;
      const number = Number(value);
      return !Number.isFinite(number) || number < minimum || number > maximum || (integer && !Number.isInteger(number));
    };

    if (category === 'rent' && hasInvalidOptionalNumber(depositMonth, 1, 20)) {
      Alert.alert('Garantie invalide', 'Le nombre de mois de garantie doit être compris entre 1 et 20.');
      return;
    }
    if (category === 'rent' && propertyType === 'Maison' && hasInvalidOptionalNumber(maxOccupants, 1, 20)) {
      Alert.alert('Nombre de personnes invalide', 'Le nombre de personnes autorisées doit être compris entre 1 et 20.');
      return;
    }
    if (propertyType === 'Maison' && hasInvalidOptionalNumber(compoundHousesCount, 0)) {
      Alert.alert('Nombre invalide', 'Le nombre de maisons dans la parcelle doit être un entier positif ou nul.');
      return;
    }
    if (propertyType === 'Appartement' && hasInvalidOptionalNumber(buildingApartmentsCount, 0)) {
      Alert.alert('Nombre invalide', 'Le nombre d’appartements dans le bâtiment doit être un entier positif ou nul.');
      return;
    }
    if (hasRooms && (
      hasInvalidOptionalNumber(bedrooms, 0)
      || hasInvalidOptionalNumber(bathrooms, 0)
      || hasInvalidOptionalNumber(surface, Number.MIN_VALUE, Number.POSITIVE_INFINITY, false)
    )) {
      Alert.alert('Caractéristiques invalides', 'Vérifiez les chambres, salles de bain et la superficie indiquées.');
      return;
    }
    if (hasSurfaceOnly && hasInvalidOptionalNumber(surface, Number.MIN_VALUE, Number.POSITIVE_INFINITY, false)) {
      Alert.alert('Superficie invalide', 'La superficie doit être supérieure à zéro.');
      return;
    }
    if (isHotelBooking && (
      hasInvalidOptionalNumber(stars, 1, 5)
      || hasInvalidOptionalNumber(availableRooms, 1)
      || hasInvalidOptionalNumber(maxAdults, 1)
      || (childrenAllowed && hasInvalidOptionalNumber(maxChildren, 0))
    )) {
      Alert.alert('Informations de l’hôtel invalides', 'Vérifiez les valeurs numériques renseignées.');
      return;
    }
    if (isHotelBooking && (!isValidDate(availableFrom) || !isValidDate(availableUntil) || availableUntil < availableFrom)) {
      Alert.alert('Disponibilités invalides', 'Indiquez une période valide au format AAAA-MM-JJ, avec une date de fin égale ou postérieure à la date de début.');
      return;
    }

    setSubmitting(true);
    let uploadedPaths: string[] = [];
    const uploadedVideoPaths: string[] = [];
    let uploadingPhotos = photos.length > 0;
    try {
      const uploaded = await uploadListingPhotos(photos, user.id);
      uploadingPhotos = false;
      uploadedPaths = uploaded.uploadedPaths;
      const uploadedVideoUrls: string[] = [];
      for (const video of videos) {
        const uploadedVideo = await uploadListingVideo(video, user.id);
        uploadedVideoPaths.push(uploadedVideo.path);
        uploadedVideoUrls.push(uploadedVideo.videoUrl);
      }
      const fallbackPhotoUrl = uploaded.photoUrls.length === 0 && uploadedVideoUrls.length === 0
        ? `https://picsum.photos/seed/${Date.now()}-${Math.random().toString(36).slice(2)}/900/600`
        : '';

      const payload: Partial<Listing> = {
        user_id: user.id,
        category,
        titre: titre.trim(),
        description: description.trim(),
        prix_usd: price,
        province,
        commune,
        adresse: adresse.trim(),
        contact_name: contactName.trim(),
        contact_phone: contactPhone,
        property_type: propertyType,
        verified: false,
        doc_type: '',
        photo_1: uploaded.photoUrls[0] ?? fallbackPhotoUrl,
      };
      Object.assign(payload, ...uploaded.photoUrls.slice(1).map((url, index) => ({ [`photo_${index + 2}`]: url })));
      uploadedVideoUrls.forEach((url, index) => {
        payload[listingVideoColumns[index]] = url;
      });

      if (category === 'rent' && depositMonth.trim()) payload.deposit_months_required = Number(depositMonth);
      if (category === 'rent' && propertyType === 'Maison' && maxOccupants.trim()) payload.max_occupants = Number(maxOccupants);
      if (propertyType === 'Maison' && compoundHousesCount.trim()) payload.compound_houses_count = Number(compoundHousesCount);
      if (propertyType === 'Appartement' && buildingApartmentsCount.trim()) payload.building_apartments_count = Number(buildingApartmentsCount);

      if (isLand) {
        payload.land_dimensions = landDimensions.trim();
        payload.land_usage = landUsage;
      } else if (hasRooms) {
        if (bedrooms.trim()) payload.bedrooms = Number(bedrooms);
        if (bathrooms.trim()) payload.bathrooms = Number(bathrooms);
        if (surface.trim()) payload.surface_m2 = Number(surface);
        payload.furnished = furnished;
      } else if (hasSurfaceOnly) {
        if (surface.trim()) payload.surface_m2 = Number(surface);
      }

      if (isHotelBooking) {
        payload.price_per_night_usd = price;
        payload.available_from = availableFrom;
        payload.available_until = availableUntil;
        if (stars.trim()) payload.stars = Number(stars);
        if (availableRooms.trim()) payload.available_rooms = Number(availableRooms);
        if (amenities.trim()) payload.amenities = amenities.trim();
        if (maxAdults.trim()) payload.max_adults = Number(maxAdults);
        payload.children_allowed = childrenAllowed;
        if (childrenAllowed) {
          if (maxChildren.trim()) payload.max_children = Number(maxChildren);
        }
      }

      const { error } = await supabase.from('listings').insert([payload]);
      if (error) {
        if (uploadedPaths.length > 0 || uploadedVideoPaths.length > 0) {
          const { error: cleanupError } = await Promise.all([
            uploadedPaths.length > 0 ? supabase.storage.from(listingPhotosBucket).remove(uploadedPaths) : Promise.resolve({ error: null }),
            uploadedVideoPaths.length > 0 ? supabase.storage.from(listingVideosBucket).remove(uploadedVideoPaths) : Promise.resolve({ error: null }),
          ]).then((results) => ({ error: results.find((result) => result.error)?.error ?? null }));
          if (cleanupError) {
            Alert.alert('Annonce non publiée', `${error.message}\n\nLe nettoyage des fichiers échoués a également échoué : ${cleanupError.message}`);
            return;
          }
        }
        Alert.alert('Annonce non publiée', error.message);
        return;
      }

      Alert.alert('Annonce publiée', 'Votre annonce a été enregistrée dans votre compte.');
      navigation.navigate('HomeTabs', { screen: 'Mes annonces' });
    } catch (error) {
      let message = uploadingPhotos
        ? getPhotoUploadErrorMessage(error)
        : error instanceof Error ? error.message : 'Une erreur inattendue est survenue pendant la publication.';
      if (uploadedPaths.length > 0 || uploadedVideoPaths.length > 0) {
        try {
          const results = await Promise.all([
            uploadedPaths.length > 0 ? supabase.storage.from(listingPhotosBucket).remove(uploadedPaths) : Promise.resolve({ error: null }),
            uploadedVideoPaths.length > 0 ? supabase.storage.from(listingVideosBucket).remove(uploadedVideoPaths) : Promise.resolve({ error: null }),
          ]);
          const cleanupError = results.find((result) => result.error)?.error;
          if (cleanupError) message += ` Le nettoyage des fichiers incomplets a également échoué : ${cleanupError.message}`;
        } catch (cleanupError) {
          message += ` Le nettoyage des fichiers incomplets a également échoué : ${cleanupError instanceof Error ? cleanupError.message : 'erreur inconnue'}`;
        }
      }
      Alert.alert('Publication impossible', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screenPad}>
        <BrandHeader />
        <Text style={styles.sectionTitle}>Publier une annonce</Text>

        <Text style={styles.filterLabel}>Catégorie *</Text>
        <View style={styles.inlineButtons}>
          {(['buy', 'rent', 'hotel'] as ListingCategory[]).map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.inlineBtn, category === item && styles.inlineBtnActive]}
              onPress={() => chooseCategory(item)}
            >
              <Text style={[styles.inlineBtnText, category === item && styles.inlineBtnTextActive]}>{item === 'buy' ? 'Acheter' : item === 'rent' ? 'Louer' : 'Hôtels'}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {!isHotelBooking && (
          <>
            <Text style={styles.filterLabel}>Type de bien *</Text>
            <View style={styles.inlineButtonsInlineWrap}>
              {typeOptions.map((type) => (
                <TouchableOpacity key={type} style={[styles.chip, propertyType === type && styles.chipActive]} onPress={() => setPropertyType(type)}>
                  <Text style={[styles.chipText, propertyType === type && styles.chipTextActive]}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <Text style={styles.sectionTitle}>Informations du bien</Text>
        <FormInput label="Titre de l’annonce" required value={titre} onChangeText={setTitre} placeholder="Ex. Maison 3 chambres à Gombe" />
        <FormInput label="Description" style={styles.textArea} multiline value={description} onChangeText={setDescription} placeholder="Décrivez le bien et ses caractéristiques (facultatif)" />
        <Text style={styles.formFieldLabel}>{isHotelBooking ? `Prix par nuit (${priceCurrency}) *` : `Prix (${priceCurrency}) *`}</Text>
        <View style={styles.priceEntryRow}>
          <TextInput
            accessibilityLabel={isHotelBooking ? 'Prix par nuit' : 'Prix'}
            style={[styles.input, styles.priceEntryInput]}
            value={prix}
            onChangeText={setPrix}
            keyboardType="numeric"
            placeholder={priceCurrency === 'CDF' ? 'Ex. 1 400 000' : 'Ex. 500'}
          />
          <View style={styles.priceCurrencyToggle}>
            {(['USD', 'CDF'] as Currency[]).map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.inlineBtn, priceCurrency === option && styles.inlineBtnActive]}
                onPress={() => setPriceCurrency(option)}
              >
                <Text style={[styles.inlineBtnText, priceCurrency === option && styles.inlineBtnTextActive]}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        {prix.trim() && Number.isFinite(Number(prix)) && Number(prix) > 0 && (
          <Text style={styles.priceEntryPreview}>
            Prix saisi : {Number(prix).toLocaleString('fr-FR')} {priceCurrency} · Enregistré : {(priceCurrency === 'CDF' ? Number(prix) / 2800 : Number(prix)).toLocaleString('fr-FR', { maximumFractionDigits: 2 })} USD
          </Text>
        )}

        <Text style={styles.sectionTitle}>Localisation</Text>
        <Text style={styles.filterLabel}>Province *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterOptions}>
          {Object.keys(provinces).map((item) => (
            <TouchableOpacity key={item} style={[styles.chip, province === item && styles.chipActive]} onPress={() => { setProvince(item); setCommune(''); }}>
              <Text style={[styles.chipText, province === item && styles.chipTextActive]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Text style={styles.filterLabel}>Ville / Commune *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterOptions}>
          {(provinces[province] ?? []).map((item) => (
            <TouchableOpacity key={item} style={[styles.chip, commune === item && styles.chipActive]} onPress={() => setCommune(item)}>
              <Text style={[styles.chipText, commune === item && styles.chipTextActive]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <FormInput label="Adresse ou quartier" value={adresse} onChangeText={setAdresse} placeholder="Ex. Avenue ... (facultatif)" />

        <Text style={styles.sectionTitle}>Coordonnées du vendeur</Text>
        <FormInput label="Nom du contact" required value={contactName} onChangeText={setContactName} placeholder="Votre nom" />
        <FormInput label="Téléphone de contact" required value={contactPhone} onChangeText={setContactPhone} keyboardType="phone-pad" placeholder="+243XXXXXXXXX" />

        <Text style={styles.sectionTitle}>Photos du bien ({photos.length}/{maxListingPhotos})</Text>
        <Text style={styles.photoHelp}>Choisissez jusqu’à 10 photos. Elles s’afficheront ici et seront envoyées avec l’annonce lorsque vous appuierez sur « Publier ».</Text>
        <View style={styles.photoGrid}>
          {photos.map((photo, index) => (
            <View key={`${photo.uri}-${index}`} style={styles.photoPreviewWrap}>
              <Image source={{ uri: photo.uri }} style={styles.photoPreview} />
              <TouchableOpacity
                accessibilityLabel={`Supprimer la photo ${index + 1}`}
                style={styles.removePhotoButton}
                onPress={() => setPhotos((current) => current.filter((_, photoIndex) => photoIndex !== index))}
              >
                <Ionicons name="close" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
        {photos.length < maxListingPhotos && (
          <TouchableOpacity style={styles.secondaryButton} onPress={choosePhotos}>
            <Text style={styles.secondaryButtonText}>{photos.length ? 'Ajouter des photos' : 'Choisir des photos'}</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.sectionTitle}>Ajouter des vidéos ({videos.length}/{maxListingVideos})</Text>
        <Text style={styles.photoHelp}>Chaque vidéo peut durer au maximum 1 minute et peser 100 Mo.</Text>
        {videos.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.videoPreviewList}>
            {videos.map((video, index) => (
              <View key={`${video.uri}-${index}`} style={styles.videoPreviewTile}>
                <Video
                  source={{ uri: video.uri }}
                  style={styles.videoPreview}
                  resizeMode={ResizeMode.COVER}
                  shouldPlay={false}
                  isMuted
                />
                <TouchableOpacity
                  accessibilityLabel={`Supprimer la vidéo ${index + 1}`}
                  style={styles.removePhotoButton}
                  onPress={() => setVideos((current) => current.filter((_, videoIndex) => videoIndex !== index))}
                >
                  <Ionicons name="close" size={16} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.videoPreviewName} numberOfLines={1}>
                  {video.fileName || `Vidéo ${index + 1}`}
                </Text>
              </View>
            ))}
          </ScrollView>
        )}
        {videos.length < maxListingVideos && (
          <View style={styles.inlineButtons}>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => pickVideo(false)}>
              <Text style={styles.secondaryButtonText}>{videos.length > 0 ? 'Ajouter des vidéos' : 'Choisir des vidéos'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => pickVideo(true)}>
              <Text style={styles.secondaryButtonText}>Enregistrer une vidéo</Text>
            </TouchableOpacity>
          </View>
        )}

        {hasRooms && (
          <>
            <Text style={styles.sectionTitle}>Caractéristiques du bien</Text>
            <FormInput label="Nombre de chambres" value={bedrooms} onChangeText={setBedrooms} keyboardType="numeric" placeholder="Ex. 3" />
            <FormInput label="Nombre de salles de bain" value={bathrooms} onChangeText={setBathrooms} keyboardType="numeric" placeholder="Ex. 2" />
            <FormInput label="Superficie (m²)" value={surface} onChangeText={setSurface} keyboardType="numeric" placeholder="Ex. 120" />
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Meublé</Text>
              <Switch value={furnished} onValueChange={setFurnished} />
            </View>
          </>
        )}

        {propertyType === 'Maison' && (
          <FormInput label="Nombre de maisons dans la parcelle" value={compoundHousesCount} onChangeText={setCompoundHousesCount} keyboardType="numeric" placeholder="Facultatif" />
        )}

        {propertyType === 'Appartement' && (
          <FormInput label="Nombre d'appartements dans le bâtiment" value={buildingApartmentsCount} onChangeText={setBuildingApartmentsCount} keyboardType="numeric" placeholder="Facultatif" />
        )}

        {hasSurfaceOnly && (
          <>
            <Text style={styles.sectionTitle}>Caractéristiques du bien</Text>
            <FormInput label="Superficie (m²)" value={surface} onChangeText={setSurface} keyboardType="numeric" placeholder="Ex. 120" />
          </>
        )}

        {isLand && (
          <>
            <Text style={styles.sectionTitle}>Caractéristiques du terrain</Text>
            <FormInput label="Dimensions du terrain" value={landDimensions} onChangeText={setLandDimensions} placeholder="Ex. 20 m x 30 m" />
            <Text style={styles.filterLabel}>Usage du terrain</Text>
            <View style={styles.inlineButtons}>
              {['Résidentiel', 'Commercial', 'Agricole'].map((item) => (
                <TouchableOpacity key={item} style={[styles.inlineBtn, landUsage === item && styles.inlineBtnActive]} onPress={() => setLandUsage(item)}>
                  <Text style={[styles.inlineBtnText, landUsage === item && styles.inlineBtnTextActive]}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {isHotelBooking && (
          <>
            <Text style={styles.sectionTitle}>Informations de l’hôtel</Text>
            <FormInput label="Disponible à partir du (AAAA-MM-JJ)" required value={availableFrom} onChangeText={setAvailableFrom} placeholder="AAAA-MM-JJ" />
            <FormInput label="Disponible jusqu'au (AAAA-MM-JJ)" required value={availableUntil} onChangeText={setAvailableUntil} placeholder="AAAA-MM-JJ" />
            <FormInput label="Classement (1 à 5 étoiles)" value={stars} onChangeText={setStars} keyboardType="numeric" placeholder="Ex. 3" />
            <FormInput label="Chambres disponibles" value={availableRooms} onChangeText={setAvailableRooms} keyboardType="numeric" placeholder="Ex. 5" />
            <FormInput label="Équipements" value={amenities} onChangeText={setAmenities} placeholder="Wi-Fi, parking, ..." />
            <FormInput label="Nombre maximum d’adultes" value={maxAdults} onChangeText={setMaxAdults} keyboardType="numeric" placeholder="Ex. 2" />
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Enfants autorisés</Text>
              <Switch value={childrenAllowed} onValueChange={setChildrenAllowed} />
            </View>
            {childrenAllowed && <FormInput label="Nombre maximum d’enfants" value={maxChildren} onChangeText={setMaxChildren} keyboardType="numeric" placeholder="Ex. 2" />}
          </>
        )}

        {category === 'rent' && (
          <>
            <Text style={styles.sectionTitle}>Conditions de location</Text>
            <FormInput label="Mois de garantie exigés (1 à 20)" value={depositMonth} onChangeText={setDepositMonth} keyboardType="numeric" placeholder="Ex. 3" />
            {propertyType === 'Maison' && <FormInput label="Nombre de personnes autorisées (1 à 20)" value={maxOccupants} onChangeText={setMaxOccupants} keyboardType="numeric" placeholder="Ex. 5" />}
          </>
        )}

        <TouchableOpacity style={styles.primaryButton} onPress={submit} disabled={submitting}>
          <Text style={styles.primaryButtonText}>{submitting ? 'Envoi en cours…' : 'Publier'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function MyListingsScreen({ navigation }: any) {
  const { user } = useAppContext();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingListingId, setDeletingListingId] = useState<string | null>(null);

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
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation, user]);

  const deleteListing = (listing: Listing) => {
    if (!user) return;
    Alert.alert('Supprimer l’annonce', 'Êtes-vous sûr de vouloir supprimer cette annonce ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          setDeletingListingId(listing.id);
          try {
            const { data, error } = await supabase
              .from('listings')
              .delete()
              .eq('id', listing.id)
              .eq('user_id', user.id)
              .select('id');
            if (error) {
              Alert.alert('Suppression impossible', error.message);
              return;
            }
            if (!data?.length) {
              Alert.alert('Suppression impossible', 'Cette annonce est introuvable ou ne vous appartient pas.');
              return;
            }
            setListings((current) => current.filter((item) => item.id !== listing.id));
          } catch (error) {
            Alert.alert('Suppression impossible', error instanceof Error ? error.message : 'Une erreur inattendue est survenue.');
          } finally {
            setDeletingListingId(null);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screenPad}>
        <BrandHeader />
        <Text style={styles.sectionTitle}>Mes annonces</Text>
        {!user ? <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('Connexion')}><Text style={styles.primaryButtonText}>Se connecter</Text></TouchableOpacity> : null}
        {loading ? <Text style={styles.emptyText}>Chargement…</Text> : null}
        {!loading && user && listings.length === 0 ? <Text style={styles.emptyText}>Vous n’avez pas encore publié d’annonce.</Text> : null}
        {listings.map((listing) => (
          <View key={listing.id}>
            <ListingCard item={listing} navigation={navigation} />
            <View style={styles.listingCardActions}>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('EditListing', { listing })}>
                <Text style={styles.secondaryButtonText}>Modifier</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryButton}
                disabled={deletingListingId === listing.id}
                onPress={() => deleteListing(listing)}
              >
                <Text style={styles.secondaryButtonText}>{deletingListingId === listing.id ? 'Suppression…' : 'Supprimer'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function AccountScreen({ navigation }: any) {
  const { currency, setCurrency, formatPrice, user, theme, setTheme } = useAppContext();

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

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Thème</Text>
          <View style={styles.inlineButtons}>
            {(['light', 'dark'] as Theme[]).map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.inlineBtn, theme === option && styles.inlineBtnActive]}
                onPress={() => setTheme(option)}
                accessibilityRole="button"
                accessibilityState={{ selected: theme === option }}
              >
                <Text style={[styles.inlineBtnText, theme === option && styles.inlineBtnTextActive]}>
                  {option === 'light' ? 'Thème clair' : 'Thème sombre'}
                </Text>
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
  const [similarListings, setSimilarListings] = useState<Listing[]>([]);

  const photos = [listing.photo_1, listing.photo_2, listing.photo_3, listing.photo_4, listing.photo_5, listing.photo_6, listing.photo_7, listing.photo_8, listing.photo_9, listing.photo_10].filter(Boolean) as string[];
  const videos = listingVideoColumns.map((column) => listing[column]).filter((url): url is string => Boolean(url));

  React.useEffect(() => {
    let active = true;
    const loadSimilar = async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('category', listing.category)
        .neq('id', listing.id)
        .limit(3);
      if (!active) return;
      if (error) {
        Alert.alert('Annonces similaires', error.message);
      } else {
        setSimilarListings((data ?? []) as Listing[]);
      }
    };
    loadSimilar();
    return () => {
      active = false;
    };
  }, [listing.category, listing.id]);

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
          {photos.length > 0
            ? photos.map((photo, index) => (
              <Image key={`${photo}-${index}`} source={{ uri: photo }} style={styles.galleryImage} />
            ))
            : <View style={[styles.galleryImage, styles.photoPlaceholder]}><Ionicons name="home-outline" size={44} color="#8EA5C7" /></View>}
        </ScrollView>
        {videos.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.listingVideoGallery}>
            {videos.map((url, index) => (
              <Video
                key={`${url}-${index}`}
                source={{ uri: url }}
                style={styles.listingVideo}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                shouldPlay={false}
              />
            ))}
          </ScrollView>
        )}

        <View style={styles.detailContent}>
          <View style={styles.detailHeaderRow}>
            <Text style={styles.detailTitle}>{listing.titre}</Text>
            <TouchableOpacity onPress={() => toggleFavorite(listing.id)}>
              <Ionicons name={favorites.includes(listing.id) ? 'heart' : 'heart-outline'} size={28} color={favorites.includes(listing.id) ? '#CE1021' : activeTheme === 'dark' ? lightBlue : brandBlue} />
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
            {listing.available_from && listing.available_until && (
              <Text style={styles.specItem}>Disponible du {String(listing.available_from).slice(0, 10)} au {String(listing.available_until).slice(0, 10)}</Text>
            )}
            {listing.compound_houses_count != null && <Text style={styles.specItem}>Nombre de maisons dans la parcelle : {listing.compound_houses_count}</Text>}
            {listing.building_apartments_count != null && <Text style={styles.specItem}>Nombre d'appartements dans le bâtiment: {listing.building_apartments_count}</Text>}
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

          <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('SellerProfile', { sellerName: listing.contact_name, userId: listing.user_id })}>
            <Text style={styles.linkText}>Voir toutes les annonces de ce vendeur</Text>
          </TouchableOpacity>

          {similarListings.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Annonces similaires</Text>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={similarListings}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.horizontalCardSmall} onPress={() => navigation.push('ListingDetail', { listing: item })}>
                    <ListingThumbnail item={item} variant="small" />
                    <Text style={styles.horizontalTitle}>{item.titre}</Text>
                    <Text style={styles.horizontalPrice}>{formatPrice(item.prix_usd ?? item.price_per_night_usd ?? 0)}</Text>
                  </TouchableOpacity>
                )}
              />
            </>
          )}
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
  useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      Alert.alert('Connexion', 'Saisissez votre adresse e-mail et votre mot de passe.');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
      if (error) {
        if (error.message.toLowerCase().includes('invalid login credentials')) {
          Alert.alert('Connexion impossible', 'Adresse e-mail ou mot de passe incorrect. Si vous venez de créer un compte, essayez de réinitialiser votre mot de passe.', [
            { text: 'Fermer', style: 'cancel' },
            { text: 'Mot de passe oublié', onPress: () => navigation.navigate('ForgotPassword') },
          ]);
        } else {
          Alert.alert('Connexion impossible', error.message);
        }
        return;
      }
      navigation.navigate('HomeTabs', { screen: 'Accueil' });
    } catch (error) {
      Alert.alert('Connexion impossible', error instanceof Error ? error.message : 'Une erreur inattendue est survenue.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screenPad}>
        <BrandHeader />
        <Text style={styles.sectionTitle}>Connexion</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Adresse e-mail" autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
        <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Mot de passe" secureTextEntry />
        <TouchableOpacity style={styles.primaryButton} onPress={handleLogin} disabled={submitting}>
          <Text style={styles.primaryButtonText}>{submitting ? 'Connexion…' : 'Se connecter'}</Text>
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
  useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSignUp = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!fullName.trim() || !normalizedEmail || password.length < 8) {
      Alert.alert('Informations requises', 'Indiquez votre nom, un email valide et un mot de passe de 8 caractères minimum.');
      return;
    }

    if (!formatPhone(phone)) {
      Alert.alert('Téléphone invalide', 'Le numéro doit être au format +243 suivi de 9 chiffres.');
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: { data: { full_name: fullName.trim(), phone: phone.trim() } },
      });
      if (error) {
        if (error.message.toLowerCase().includes('already registered') || error.message.toLowerCase().includes('already been registered')) {
          Alert.alert('Adresse déjà inscrite', 'Cette adresse e-mail possède déjà un compte. Connectez-vous ou réinitialisez votre mot de passe.', [
            { text: 'Mot de passe oublié', onPress: () => navigation.navigate('ForgotPassword') },
            { text: 'Se connecter', onPress: () => navigation.navigate('Connexion') },
          ]);
        } else {
          Alert.alert('Inscription impossible', error.message);
        }
        return;
      }

      if (data.user?.identities?.length === 0) {
        Alert.alert('Adresse déjà inscrite', 'Cette adresse e-mail possède déjà un compte. Connectez-vous ou réinitialisez votre mot de passe.', [
          { text: 'Mot de passe oublié', onPress: () => navigation.navigate('ForgotPassword') },
          { text: 'Se connecter', onPress: () => navigation.navigate('Connexion') },
        ]);
        return;
      }

      if (data.session) {
        Alert.alert('Compte créé', 'Votre compte est prêt et vous êtes connecté.');
        navigation.navigate('HomeTabs', { screen: 'Accueil' });
      } else {
        Alert.alert(
          'Compte créé, connexion en attente',
          'Supabase n’a pas ouvert de session après l’inscription. Vérifiez que la confirmation par e-mail est désactivée dans les paramètres d’authentification, ou réinitialisez votre mot de passe.',
          [{ text: 'Continuer', onPress: () => navigation.navigate('Connexion') }],
        );
      }
    } catch (error) {
      Alert.alert('Inscription impossible', error instanceof Error ? error.message : 'Une erreur inattendue est survenue.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screenPad}>
        <BrandHeader />
        <Text style={styles.sectionTitle}>Inscription</Text>
        <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Nom complet" />
        <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Adresse e-mail" autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="+243XXXXXXXXX" />
        <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Mot de passe" secureTextEntry />
        <TouchableOpacity style={styles.primaryButton} onPress={handleSignUp} disabled={submitting}>
          <Text style={styles.primaryButtonText}>{submitting ? 'Création…' : 'Créer le compte'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function ForgotPasswordScreen() {
  useAppContext();
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

function SellerProfileScreen({ route, navigation }: any) {
  useAppContext();
  const sellerName = route.params.sellerName || 'Vendeur';
  const [listings, setListings] = useState<Listing[]>([]);

  React.useEffect(() => {
    let active = true;
    const load = async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', route.params.userId)
        .order('created_at', { ascending: false });
      if (!active) return;
      if (error) {
        Alert.alert('Profil vendeur', error.message);
      } else {
        setListings((data ?? []) as Listing[]);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [route.params.userId]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screenPad}>
        <BrandHeader />
        <Text style={styles.sectionTitle}>{sellerName}</Text>
        {listings.length === 0
          ? <Text style={styles.emptyText}>Ce vendeur n’a pas encore d’annonce publiée.</Text>
          : listings.map((item) => <ListingCard key={item.id} item={item} navigation={navigation} />)}
      </ScrollView>
    </SafeAreaView>
  );
}

function FavoritesScreen({ navigation }: any) {
  const { favorites } = useAppContext();
  const [items, setItems] = useState<Listing[]>([]);

  React.useEffect(() => {
    let active = true;
    const load = async () => {
      if (favorites.length === 0) {
        setItems([]);
        return;
      }
      const { data, error } = await supabase.from('listings').select('*').in('id', favorites);
      if (!active) return;
      if (error) {
        Alert.alert('Favoris', error.message);
      } else {
        setItems((data ?? []) as Listing[]);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [favorites]);

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
  useAppContext();
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
  useAppContext();
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
  useAppContext();
  const listing = route.params.listing as Listing;
  const [titre, setTitre] = useState(listing.titre);
  const [description, setDescription] = useState(listing.description);
  const [prix, setPrix] = useState(String(listing.prix_usd));
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const price = Number(prix);
    if (!titre.trim() || !Number.isFinite(price) || price <= 0) {
      Alert.alert('Informations invalides', 'Vérifiez le titre et le prix.');
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
        <FormInput label="Titre de l’annonce" required value={titre} onChangeText={setTitre} placeholder="Titre" />
        <FormInput label="Description" style={styles.textArea} multiline value={description} onChangeText={setDescription} placeholder="Description (facultatif)" />
        <FormInput label="Prix (USD)" required value={prix} onChangeText={setPrix} keyboardType="numeric" placeholder="Prix en USD" />
        <TouchableOpacity style={styles.primaryButton} onPress={save} disabled={saving}>
          <Text style={styles.primaryButtonText}>{saving ? 'Enregistrement…' : 'Enregistrer'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function MainTabs() {
  const { theme } = useAppContext();
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
        tabBarInactiveTintColor: theme === 'dark' ? '#CBD5E1' : '#B9C4D8',
        tabBarStyle: { backgroundColor: theme === 'dark' ? '#0B1220' : darkAccent, borderTopWidth: 0, height: 72, paddingTop: 8 },
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

function AppNavigation() {
  const { theme } = useAppContext();
  return (
    <NavigationContainer theme={theme === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
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
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <AppNavigation />
      </AppProvider>
    </SafeAreaProvider>
  );
}

const lightStyles = StyleSheet.create({
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
    backgroundColor: congoBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  brandWords: {
    flexShrink: 1,
  },
  wordmark: {
    color: brandBlue,
    fontSize: 24,
    fontWeight: '700',
  },
  tagline: {
    color: red,
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
  photoPlaceholder: {
    backgroundColor: '#EAF1FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoAvailablePlaceholder: {
    backgroundColor: darkAccent,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  videoAvailableText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  photoHelp: {
    color: muted,
    fontSize: 13,
    marginBottom: 10,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  photoPreviewWrap: {
    position: 'relative',
  },
  photoPreview: {
    width: 76,
    height: 76,
    borderRadius: 10,
    backgroundColor: '#EAF1FF',
  },
  removePhotoButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    padding: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(12,42,94,0.8)',
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
  formFieldLabel: {
    color: brandBlue,
    fontWeight: '700',
    marginTop: 2,
    marginBottom: 6,
  },
  filterOptions: {
    marginBottom: 4,
  },
  filterHint: {
    color: muted,
    fontSize: 13,
    marginBottom: 8,
  },
  priceRangeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  filterInputColumn: {
    flex: 1,
  },
  videoSelectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  videoPreviewList: {
    marginBottom: 10,
  },
  videoPreviewTile: {
    width: 104,
    marginRight: 8,
  },
  videoPreview: {
    width: 96,
    height: 72,
    borderRadius: 10,
    backgroundColor: '#111827',
  },
  videoPreviewName: {
    color: muted,
    fontSize: 11,
    marginTop: 4,
  },
  listingVideoGallery: {
    marginBottom: 10,
  },
  listingVideo: {
    width: 260,
    height: 180,
    backgroundColor: '#111827',
    marginRight: 8,
    borderRadius: 14,
  },
  priceEntryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  priceEntryInput: {
    flex: 1,
  },
  priceCurrencyToggle: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  priceEntryPreview: {
    color: muted,
    fontSize: 12,
    marginTop: -6,
    marginBottom: 12,
  },
  priceRangeInput: {
    flex: 1,
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
  listingCardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: -8,
    marginBottom: 14,
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

const styles = new Proxy(lightStyles, {
  get(target, property: string) {
    const style = target[property as keyof typeof target];
    if (activeTheme === 'light' || !style || typeof style !== 'object') return style;

    return Object.fromEntries(Object.entries(style).map(([key, value]) => {
      if (typeof value !== 'string') return [key, value];
      if (key === 'backgroundColor') {
        const backgrounds: Record<string, string> = {
          '#F5F7FB': '#080D18',
          '#fff': '#111827',
          '#F9FAFB': '#172033',
          '#EAF1FF': '#1B2D4A',
          '#EEF7FF': '#1B2D4A',
          '#E5E7EB': '#334155',
          [brandBlue]: lightBlue,
          [darkAccent]: '#0B1220',
        };
        return [key, backgrounds[value] ?? value];
      }
      if (key === 'borderColor') {
        return [key, value === '#E5E7EB' ? '#334155' : value];
      }
      if (key === 'color') {
        const colors: Record<string, string> = {
          [brandBlue]: '#E2E8F0',
          '#111827': '#F3F4F6',
          '#374151': '#D1D5DB',
          [muted]: '#A0AEC0',
          '#D8E4FF': '#E2E8F0',
          '#1F2937': '#D1D5DB',
        };
        return [key, colors[value] ?? value];
      }
      return [key, value];
    }));
  },
});
