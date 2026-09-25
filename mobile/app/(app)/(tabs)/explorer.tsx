import { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { SlidersHorizontalIcon, XIcon, MapPinIcon, BookmarkIcon } from 'lucide-react-native';
import { cssInterop, useColorScheme } from 'nativewind';
import { useApp } from '@/src/providers/AppProvider';
import { type Listing } from '@/src/db/types';
import { BUY_PROPERTY_TYPES, RENT_PROPERTY_TYPES } from '@/src/lib/listing-utils';
import { PROVINCES, placesForProvince, capitalCoords } from '@/src/lib/locations';
import { useCurrency } from '@/src/lib/currency-context';
import { ListingCard } from '@/src/components/ListingCard';
import LocationMap from '@/src/components/LocationMap';
import { saveSearch } from '@/src/lib/saved-searches';

cssInterop(SlidersHorizontalIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(XIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(MapPinIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(BookmarkIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });

type Category = 'buy' | 'rent' | 'hotel';

const CATEGORIES: { key: Category; label: string }[] = [
  { key: 'buy', label: 'Acheter' },
  { key: 'rent', label: 'Louer' },
  { key: 'hotel', label: 'Hôtels' },
];

const ADULT_OPTIONS = ['1', '2', '3', '4+'];
const CHILDREN_OPTIONS = ['1', '2', '3', '4+'];
const STAR_OPTIONS = ['Any', '3+', '4+', '5'];
const DEPOSIT_MONTHS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

export default function ExplorerScreen() {
  const { client } = useApp();
  const { currency } = useCurrency();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const ph = isDark ? '#8aa0b8' : '#9aa3b2';
  const params = useLocalSearchParams<{ category?: string; saved?: string }>();

  const initialCategory: Category =
    params.category === 'buy' || params.category === 'rent' || params.category === 'hotel'
      ? params.category
      : 'buy';

  const [category, setCategory] = useState<Category>(initialCategory);
  const [province, setProvince] = useState<string>('');
  const [commune, setCommune] = useState<string>('');
  const [propertyType, setPropertyType] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [minBedrooms, setMinBedrooms] = useState<string>('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'price'>('date');
  const [showFilters, setShowFilters] = useState(false);
  const [mapMode, setMapMode] = useState(false);
  const [selectedPin, setSelectedPin] = useState<string>('');

  // Hotel filters
  const [adults, setAdults] = useState<string>('');
  const [withChildren, setWithChildren] = useState(false);
  const [children, setChildren] = useState<string>('');
  const [starsFilter, setStarsFilter] = useState<string>('');
  const [arrival, setArrival] = useState<string>('');
  const [departure, setDeparture] = useState<string>('');
  const [dateError, setDateError] = useState('');
  const [maxDeposit, setMaxDeposit] = useState<string>('');
  const [savedNotice, setSavedNotice] = useState('');

  // Re-apply a saved search passed via the `saved` query param (JSON blob).
  useEffect(() => {
    if (!params.saved) return;
    try {
      const f = JSON.parse(params.saved) as Record<string, unknown>;
      if (typeof f.category === 'string') setCategory(f.category as Category);
      if (typeof f.province === 'string') setProvince(f.province);
      if (typeof f.commune === 'string') setCommune(f.commune);
      if (typeof f.propertyType === 'string') setPropertyType(f.propertyType);
      if (typeof f.minPrice === 'string') setMinPrice(f.minPrice);
      if (typeof f.maxPrice === 'string') setMaxPrice(f.maxPrice);
      if (typeof f.minBedrooms === 'string') setMinBedrooms(f.minBedrooms);
      if (typeof f.verifiedOnly === 'boolean') setVerifiedOnly(f.verifiedOnly);
      if (typeof f.adults === 'string') setAdults(f.adults);
      if (typeof f.withChildren === 'boolean') setWithChildren(f.withChildren);
      if (typeof f.children === 'string') setChildren(f.children);
      if (typeof f.starsFilter === 'string') setStarsFilter(f.starsFilter);
      if (typeof f.arrival === 'string') setArrival(f.arrival);
      if (typeof f.departure === 'string') setDeparture(f.departure);
      if (typeof f.maxDeposit === 'string') setMaxDeposit(f.maxDeposit);
      setShowFilters(true);
      setSavedNotice('Recherche restaurée.');
    } catch {
      setSavedNotice('Impossible de restaurer cette recherche.');
    }
  }, [params.saved]);

  const { data: all = [], isLoading } = useQuery({
    queryKey: ['listings', 'all'],
    queryFn: async () => {
      const { data, error } = await client.from('listings').select('*').order('created_at', { ascending: false }).limit(200);
      if (error) throw error;
      return (data ?? []) as Listing[];
    },
  });

  const results = useMemo(() => {
    let list = all.filter((l) => l.category === category);

    if (province) list = list.filter((l) => l.province === province);
    if (commune) list = list.filter((l) => l.commune === commune);
    if (propertyType) list = list.filter((l) => l.property_type === propertyType);
    if (verifiedOnly) list = list.filter((l) => l.verified);

    const min = minPrice ? parseFloat(minPrice) : null;
    const max = maxPrice ? parseFloat(maxPrice) : null;
    if (min != null || max != null) {
      list = list.filter((l) => {
        const p = l.category === 'hotel' ? (l.price_per_night_usd ?? 0) : l.prix_usd;
        if (min != null && p < min) return false;
        if (max != null && p > max) return false;
        return true;
      });
    }

    if (category === 'buy' || category === 'rent') {
      const minBeds = minBedrooms ? parseInt(minBedrooms, 10) : null;
      if (minBeds != null) list = list.filter((l) => (l.bedrooms ?? 0) >= minBeds);
    }

    // Hotel guest filtering
    if (category === 'hotel') {
      if (adults) {
        const needAdult = adults === '4+' ? 4 : parseInt(adults, 10);
        list = list.filter((l) => (l.max_adults ?? 0) >= needAdult);
      }
      if (withChildren && children) {
        const needChild = children === '4+' ? 4 : parseInt(children, 10);
        list = list.filter((l) => l.children_allowed === true && (l.max_children ?? 0) >= needChild);
      }
      if (starsFilter && starsFilter !== 'Any') {
        const minStars = parseInt(starsFilter, 10);
        list = list.filter((l) => (l.stars ?? 0) >= minStars);
      }
    }

    // Rental deposit filter (rent only): a listing matches when its required
    // deposit months is <= the buyer's selected max, or when left blank.
    if (category === 'rent' && maxDeposit) {
      const max = parseInt(maxDeposit, 10);
      list = list.filter((l) => (l.deposit_months_required ?? 0) <= max);
    }

    if (sortBy === 'price') {
      list = [...list].sort((a, b) => {
        const pa = a.category === 'hotel' ? (a.price_per_night_usd ?? 0) : a.prix_usd;
        const pb = b.category === 'hotel' ? (b.price_per_night_usd ?? 0) : b.prix_usd;
        return pa - pb;
      });
    }
    return list;
  }, [
    all, category, province, commune, propertyType, minPrice, maxPrice, minBedrooms, verifiedOnly, sortBy,
    adults, withChildren, children, starsFilter, maxDeposit,
  ]);

  const communeOptions = useMemo(() => placesForProvince(province), [province]);

  // Map pins for every current result (uses stored lat/lng, falls back to the
  // province capital so every listing still lands on the map).
  const mapPins = useMemo(() => {
    return results.map((l) => {
      const coords = l.latitude != null && l.longitude != null ? [l.latitude, l.longitude] : capitalCoords(l.province || 'Kinshasa');
      return { id: l.id, lat: coords[0], lng: coords[1], label: l.titre };
    });
  }, [results]);

  const mapCenter: [number, number] = useMemo(() => {
    if (province) return capitalCoords(province);
    if (mapPins.length) return [mapPins[0].lat, mapPins[0].lng];
    return capitalCoords('Kinshasa');
  }, [province, mapPins]);

  const showPropertyFilters = category === 'buy' || category === 'rent';
  const propertyTypes = category === 'buy' ? BUY_PROPERTY_TYPES : RENT_PROPERTY_TYPES;

  const setDateField = (field: 'arrival' | 'departure', value: string) => {
    if (field === 'arrival') setArrival(value);
    else setDeparture(value);
    // Validate departure after arrival
    if (field === 'arrival') {
      if (departure && value && departure <= value) setDateError('La date de départ doit être après la date d’arrivée.');
      else setDateError('');
    } else {
      if (arrival && value && value <= arrival) setDateError('La date de départ doit être après la date d’arrivée.');
      else setDateError('');
    }
  };

  const resetFilters = () => {
    setProvince('');
    setCommune('');
    setPropertyType('');
    setMinPrice('');
    setMaxPrice('');
    setMinBedrooms('');
    setVerifiedOnly(false);
    setAdults('');
    setWithChildren(false);
    setChildren('');
    setStarsFilter('');
    setArrival('');
    setDeparture('');
    setDateError('');
    setMaxDeposit('');
  };

  const isHotel = category === 'hotel';

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <View className="px-5 pt-3 pb-3">
        <Text className="text-2xl font-bold text-foreground tracking-tight">Explorer</Text>
      </View>

      {/* Category selector */}
      <View className="px-5 mb-3">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {CATEGORIES.map((c) => {
            const active = category === c.key;
            return (
              <Pressable
                key={c.key}
                onPress={() => setCategory(c.key)}
                className={`rounded-full px-4 py-2 ${active ? 'bg-primary' : 'bg-card border border-border'}`}
              >
                <Text className={`text-sm font-semibold ${active ? 'text-white' : 'text-foreground'}`}>{c.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Filter + sort bar */}
      <View className="flex-row items-center gap-2 px-5 pb-3">
        <Pressable
          onPress={() => setShowFilters((s) => !s)}
          className={`flex-row items-center gap-1.5 rounded-xl px-3 py-2 ${showFilters ? 'bg-primary' : 'bg-card border border-border'}`}
        >
          <SlidersHorizontalIcon className={showFilters ? 'text-white' : 'text-foreground'} size={15} />
          <Text className={`text-sm font-medium ${showFilters ? 'text-white' : 'text-foreground'}`}>Filtres</Text>
        </Pressable>
        <View className="flex-1" />
        <Pressable onPress={() => setSortBy((s) => (s === 'date' ? 'price' : 'date'))} className="rounded-xl px-3 py-2 bg-card border border-border">
          <Text className="text-sm font-medium text-foreground">{sortBy === 'date' ? 'Plus récents' : 'Prix croissant'}</Text>
        </Pressable>
        <Pressable
          onPress={() => setMapMode((m) => !m)}
          className={`flex-row items-center gap-1.5 rounded-xl px-3 py-2 ${mapMode ? 'bg-primary' : 'bg-card border border-border'}`}
        >
          <MapPinIcon className={mapMode ? 'text-white' : 'text-foreground'} size={15} />
          <Text className={`text-sm font-medium ${mapMode ? 'text-white' : 'text-foreground'}`}>Carte</Text>
        </Pressable>
      </View>

      {/* Filters panel */}
      {showFilters && (
        <View className="mx-5 mb-3 bg-card rounded-2xl p-4 gap-3 border border-border">
          <Text className="text-sm font-semibold text-foreground">Province</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {PROVINCES.map((p) => (
              <Pressable
                key={p.name}
                onPress={() => { setProvince(province === p.name ? '' : p.name); setCommune(''); }}
                className={`rounded-full px-3 py-1.5 ${province === p.name ? 'bg-accent' : 'bg-muted'}`}
              >
                <Text className={`text-xs font-medium ${province === p.name ? 'text-accent-foreground' : 'text-foreground'}`}>{p.name}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text className="text-sm font-semibold text-foreground">Ville / Commune</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {(communeOptions.length ? communeOptions : ['—']).map((c) => (
              <Pressable
                key={c}
                disabled={c === '—'}
                onPress={() => setCommune(commune === c ? '' : c)}
                className={`rounded-full px-3 py-1.5 ${commune === c ? 'bg-accent' : 'bg-muted'}`}
              >
                <Text className={`text-xs font-medium ${commune === c ? 'text-accent-foreground' : 'text-foreground'}`}>{c === '—' ? 'Choisir une province' : c}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Type de bien for buy/rent */}
          {showPropertyFilters && (
            <>
              <Text className="text-sm font-semibold text-foreground">Type de bien</Text>
              <View className="flex-row flex-wrap gap-2">
                {propertyTypes.map((t) => (
                  <Pressable
                    key={t}
                    onPress={() => setPropertyType(propertyType === t ? '' : t)}
                    className={`rounded-lg px-3 py-1.5 ${propertyType === t ? 'bg-accent' : 'bg-muted'}`}
                  >
                    <Text className={`text-xs font-medium ${propertyType === t ? 'text-accent-foreground' : 'text-foreground'}`}>{t}</Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}

          {/* Hotel arrival/departure dates */}
          {isHotel && (
            <>
              <Text className="text-sm font-semibold text-foreground">Date d’arrivée</Text>
              <TextInput
                value={arrival}
                onChangeText={(v) => setDateField('arrival', v)}
                placeholder="AAAA-MM-JJ"
                placeholderTextColor={ph}
                className="bg-muted rounded-lg px-3 py-2 text-foreground"
              />
              <Text className="text-sm font-semibold text-foreground">Date de départ</Text>
              <TextInput
                value={departure}
                onChangeText={(v) => setDateField('departure', v)}
                placeholder="AAAA-MM-JJ"
                placeholderTextColor={ph}
                className="bg-muted rounded-lg px-3 py-2 text-foreground"
              />
              {dateError ? <Text className="text-destructive text-xs">{dateError}</Text> : null}
            </>
          )}

          {/* Hotel guest filtering */}
          {isHotel && (
            <>
              <Text className="text-sm font-semibold text-foreground">Nombre d’adultes</Text>
              <View className="flex-row gap-2 flex-wrap">
                {ADULT_OPTIONS.map((a) => (
                  <Pressable
                    key={a}
                    onPress={() => setAdults(adults === a ? '' : a)}
                    className={`rounded-lg px-3 py-1.5 ${adults === a ? 'bg-accent' : 'bg-muted'}`}
                  >
                    <Text className={`text-xs font-medium ${adults === a ? 'text-accent-foreground' : 'text-foreground'}`}>{a}</Text>
                  </Pressable>
                ))}
              </View>

              <Pressable onPress={() => { setWithChildren((v) => !v); if (withChildren) setChildren(''); }} className="flex-row items-center gap-2">
                <View className={`w-5 h-5 rounded ${withChildren ? 'bg-primary' : 'border border-border bg-transparent'} items-center justify-center`}>
                  {withChildren && <XIcon className="text-white" size={12} />}
                </View>
                <Text className="text-sm text-foreground">Voyagez-vous avec des enfants ?</Text>
              </Pressable>

              {withChildren && (
                <>
                  <Text className="text-sm font-semibold text-foreground">Nombre d’enfants</Text>
                  <View className="flex-row gap-2 flex-wrap">
                    {CHILDREN_OPTIONS.map((c) => (
                      <Pressable
                        key={c}
                        onPress={() => setChildren(children === c ? '' : c)}
                        className={`rounded-lg px-3 py-1.5 ${children === c ? 'bg-accent' : 'bg-muted'}`}
                      >
                        <Text className={`text-xs font-medium ${children === c ? 'text-accent-foreground' : 'text-foreground'}`}>{c}</Text>
                      </Pressable>
                    ))}
                  </View>
                </>
              )}
            </>
          )}

          {/* Price */}
          <Text className="text-sm font-semibold text-foreground">Prix (USD)</Text>
          <View className="flex-row gap-2">
            <TextInput
              value={minPrice}
              onChangeText={setMinPrice}
              placeholder="Min"
              keyboardType="numeric"
              placeholderTextColor={ph}
              className="flex-1 bg-muted rounded-lg px-3 py-2 text-foreground"
            />
            <TextInput
              value={maxPrice}
              onChangeText={setMaxPrice}
              placeholder="Max"
              keyboardType="numeric"
              placeholderTextColor={ph}
              className="flex-1 bg-muted rounded-lg px-3 py-2 text-foreground"
            />
          </View>

          {/* Bedrooms for residential buy/rent */}
          {category === 'buy' && (
            <>
              <Text className="text-sm font-semibold text-foreground">Chambres (min)</Text>
              <TextInput
                value={minBedrooms}
                onChangeText={setMinBedrooms}
                placeholder="Ex: 2"
                keyboardType="numeric"
                placeholderTextColor={ph}
                className="bg-muted rounded-lg px-3 py-2 text-foreground"
              />
            </>
          )}

          {/* Rental deposit filter */}
          {category === 'rent' && (
            <>
              <Text className="text-sm font-semibold text-foreground">Dépôt maximum souhaité (mois)</Text>
              <View className="flex-row flex-wrap gap-2">
                {DEPOSIT_MONTHS.map((m) => (
                  <Pressable
                    key={m}
                    onPress={() => setMaxDeposit(maxDeposit === m ? '' : m)}
                    className={`rounded-lg px-3 py-1.5 ${maxDeposit === m ? 'bg-accent' : 'bg-muted'}`}
                  >
                    <Text className={`text-xs font-medium ${maxDeposit === m ? 'text-accent-foreground' : 'text-foreground'}`}>
                      {m} mois
                    </Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}

          {/* Star rating filter for hotels */}
          {isHotel && (
            <>
              <Text className="text-sm font-semibold text-foreground">Classement</Text>
              <View className="flex-row gap-2 flex-wrap">
                {STAR_OPTIONS.map((s) => (
                  <Pressable
                    key={s}
                    onPress={() => setStarsFilter(starsFilter === s ? '' : s)}
                    className={`rounded-lg px-3 py-1.5 ${starsFilter === s ? 'bg-accent' : 'bg-muted'}`}
                  >
                    <Text className={`text-xs font-medium ${starsFilter === s ? 'text-accent-foreground' : 'text-foreground'}`}>
                      {s === 'Any' ? 'Tous' : `${s} étoiles`}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}

          <Pressable onPress={() => setVerifiedOnly((v) => !v)} className="flex-row items-center gap-2">
            <View className={`w-5 h-5 rounded border ${verifiedOnly ? 'bg-primary border-primary' : 'border-border bg-transparent'} items-center justify-center`}>
              {verifiedOnly && <XIcon className="text-white" size={12} />}
            </View>
            <Text className="text-sm text-foreground">Vérifié uniquement</Text>
          </Pressable>

          {(commune || propertyType || minPrice || maxPrice || minBedrooms || verifiedOnly || adults || withChildren || children || starsFilter || arrival || departure || maxDeposit) && (
            <Pressable onPress={resetFilters}>
              <Text className="text-primary text-sm font-semibold">Réinitialiser les filtres</Text>
            </Pressable>
          )}

          <Pressable
            onPress={async () => {
              await saveSearch({
                category,
                province,
                commune,
                propertyType,
                minPrice,
                maxPrice,
                minBedrooms,
                verifiedOnly,
                adults,
                withChildren,
                children,
                starsFilter,
                arrival,
                departure,
                maxDeposit,
              });
              setSavedNotice('Recherche sauvegardée.');
            }}
            className="flex-row items-center justify-center gap-2 rounded-xl py-2.5 bg-primary"
          >
            <BookmarkIcon className="text-white" size={15} />
            <Text className="text-white text-sm font-semibold">Sauvegarder cette recherche</Text>
          </Pressable>
          {savedNotice ? <Text className="text-center text-sm text-primary font-medium">{savedNotice}</Text> : null}
        </View>
      )}

      {/* Map view */}
      {mapMode && !isLoading && (
        <View className="mx-5 mb-3 rounded-2xl overflow-hidden border border-border">
          <LocationMap
            pins={mapPins}
            center={mapCenter}
            selectedId={selectedPin || undefined}
            onPinSelected={setSelectedPin}
            height={260}
          />
          <View className="px-3 py-2 bg-card flex-row items-center justify-between">
            <Text className="text-xs text-muted-foreground">
              {results.length} résultat{results.length > 1 ? 's' : ''} · touchez une épingle pour voir l'annonce
            </Text>
            {selectedPin ? (
              <Pressable onPress={() => setSelectedPin('')}>
                <Text className="text-xs text-primary font-semibold">Effacer</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      )}

      {/* Results */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={isDark ? '#b8860b' : '#0e7490'} />
          <Text className="text-muted-foreground text-sm mt-3">Recherche en cours…</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100, gap: 14 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ListingCard listing={item} currency={currency} arrival={arrival} departure={departure} highlighted={selectedPin === item.id} />
          )}
          ListEmptyComponent={
            <View className="items-center justify-center py-16 px-6">
              <Text className="text-foreground text-base font-semibold">Aucun résultat</Text>
              <Text className="text-muted-foreground text-sm text-center mt-2">
                Aucune annonce ne correspond à vos critères. Essayez d'élargir vos filtres.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
