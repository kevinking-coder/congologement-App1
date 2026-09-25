import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/src/hooks';
import { useApp } from '@/src/providers/AppProvider';
import { router, useLocalSearchParams } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { BUY_PROPERTY_TYPES, RENT_PROPERTY_TYPES, LAND_USAGES, isResidentialType, isLandType } from '@/src/lib/listing-utils';
import { PROVINCES, placesForProvince, capitalCoords } from '@/src/lib/locations';
import { newId } from '@/src/lib/id';
import { isValidDrcPhone } from '@/src/lib/phone';
import { CameraIcon, XIcon, ImagePlusIcon, MapPinIcon, CheckIcon } from 'lucide-react-native';
import { cssInterop } from 'nativewind';
import * as ImagePicker from 'expo-image-picker';
import LocationMap from '@/src/components/LocationMap';

cssInterop(CameraIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(XIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(ImagePlusIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(MapPinIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(CheckIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });

type Category = 'buy' | 'rent' | 'hotel';

const CATEGORIES: { key: Category; label: string }[] = [
  { key: 'buy', label: 'Acheter' },
  { key: 'rent', label: 'Louer' },
  { key: 'hotel', label: 'Hôtels' },
];

const PLACEHOLDER_PHOTO =
  'https://pics.rapidnative.app/interior/VrH0HK5vohpEQh62NG4b5.jpg';

const DEPOSIT_MONTHS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'];

export default function PublishScreen() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { client } = useApp();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const ph = isDark ? '#8aa0b8' : '#9aa3b2';
  const params = useLocalSearchParams<{ edit?: string }>();

  const [category, setCategory] = useState<Category>('buy');
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [prix, setPrix] = useState('');
  const [province, setProvince] = useState('');
  const [commune, setCommune] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [adresse, setAdresse] = useState('');
  const [docType, setDocType] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [surface, setSurface] = useState('');
  const [furnished, setFurnished] = useState(false);
  const [landDims, setLandDims] = useState('');
  const [landUsage, setLandUsage] = useState('');
  const [stars, setStars] = useState('');
  const [priceNight, setPriceNight] = useState('');
  const [availableRooms, setAvailableRooms] = useState('');
  const [amenities, setAmenities] = useState('');
  const [maxAdults, setMaxAdults] = useState('');
  const [childrenAllowed, setChildrenAllowed] = useState(false);
  const [maxChildren, setMaxChildren] = useState('');
  const [depositRequired, setDepositRequired] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [published, setPublished] = useState(false);

  const showProperty = category === 'buy' || category === 'rent';
  const isEdit = !!params.edit;
  const propertyTypes = category === 'buy' ? BUY_PROPERTY_TYPES : RENT_PROPERTY_TYPES;
  const residentialFields = category !== 'hotel' && isResidentialType(propertyType, category);
  const landFields = (category === 'buy' || category === 'rent') && isLandType(propertyType);

  // Load an existing listing into the form when ?edit=<id>.
  useEffect(() => {
    if (!params.edit) return;
    let cancelled = false;
    setLoadingEdit(true);
    client
      .from('listings')
      .select('*')
      .eq('id', params.edit)
      .single()
      .then(({ data }) => {
        if (cancelled || !data) return;
        setCategory((data.category as Category) || 'buy');
        setTitre(data.titre ?? '');
        setDescription(data.description ?? '');
        setPrix(data.category === 'hotel' ? '' : String(data.prix_usd ?? ''));
        setProvince(data.province ?? '');
        setCommune(data.commune ?? '');
        setLatitude(data.latitude != null ? Number(data.latitude) : null);
        setLongitude(data.longitude != null ? Number(data.longitude) : null);
        setAdresse(data.adresse ?? '');
        setDocType(data.doc_type ?? '');
        setContactName(data.contact_name ?? '');
        setContactPhone(data.contact_phone ?? '');
        setPropertyType(data.property_type ?? '');
        setBedrooms(data.bedrooms != null ? String(data.bedrooms) : '');
        setBathrooms(data.bathrooms != null ? String(data.bathrooms) : '');
        setSurface(data.surface_m2 != null ? String(data.surface_m2) : '');
        setFurnished(!!data.furnished);
        setLandDims(data.land_dimensions ?? '');
        setLandUsage(data.land_usage ?? '');
        setStars(data.stars != null ? String(data.stars) : '');
        setPriceNight(data.price_per_night_usd != null ? String(data.price_per_night_usd) : '');
        setAvailableRooms(data.available_rooms != null ? String(data.available_rooms) : '');
        setAmenities(data.amenities ?? '');
        setMaxAdults(data.max_adults != null ? String(data.max_adults) : '');
        setChildrenAllowed(!!data.children_allowed);
        setMaxChildren(data.max_children != null ? String(data.max_children) : '');
        setDepositRequired(data.deposit_months_required != null ? String(data.deposit_months_required) : '');
        setPhotos(
          [data.photo_1, data.photo_2, data.photo_3, data.photo_4, data.photo_5, data.photo_6, data.photo_7, data.photo_8, data.photo_9, data.photo_10].filter(Boolean) as string[],
        );
      })
      .finally(() => !cancelled && setLoadingEdit(false));
    return () => {
      cancelled = true;
    };
  }, [params.edit, client]);

  const pickPhoto = async (fromCamera: boolean) => {
    if (photos.length >= 10) {
      setError('Vous pouvez ajouter au maximum 10 photos.');
      return;
    }
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.7 })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.7, allowsMultipleSelection: true, selectionLimit: 10 - photos.length });
    if (!result.canceled && result.assets?.length) {
      setPhotos((prev) => [...prev, ...result.assets.map((a) => a.uri)].slice(0, 10));
    }
  };

  const removePhoto = (idx: number) => setPhotos((prev) => prev.filter((_, i) => i !== idx));

  const readAsDataUri = async (uri: string): Promise<string> => {
    // On web, fetch + FileReader turns a blob/data URI into a base64 string.
    if (Platform.OS === 'web') {
      const res = await fetch(uri);
      const blob = await res.blob();
      return await new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onloadend = () => resolve(String(r.result));
        r.onerror = reject;
        r.readAsDataURL(blob);
      });
    }
    // On native, data URIs pass through unchanged; local file URIs need reading.
    if (uri.startsWith('data:')) return uri;
    return uri;
  };

  const validate = (): string | null => {
    if (!titre.trim()) return 'Le titre est obligatoire.';
    const price = showProperty ? prix : category === 'hotel' ? priceNight : prix;
    if (!price.trim()) return 'Le prix est obligatoire.';
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) return 'Le prix doit être un nombre positif.';
    if (!province) return 'La province est obligatoire.';
    if (!commune) return 'La commune est obligatoire.';
    if (category === 'hotel') {
      if (!maxAdults.trim() || isNaN(parseInt(maxAdults, 10)) || parseInt(maxAdults, 10) <= 0) {
        return 'Le nombre maximum d’adultes est obligatoire.';
      }
      if (childrenAllowed && (!maxChildren.trim() || isNaN(parseInt(maxChildren, 10)) || parseInt(maxChildren, 10) <= 0)) {
        return 'Veuillez indiquer le nombre maximum d’enfants.';
      }
    }
    if (category === 'rent' && (!depositRequired.trim() || isNaN(parseInt(depositRequired, 10)) || parseInt(depositRequired, 10) < 1 || parseInt(depositRequired, 10) > 20)) {
      return 'Le nombre de mois de garantie exigés est obligatoire (1 à 20).';
    }
    if (contactPhone.trim() && !isValidDrcPhone(contactPhone)) {
      return 'Numéro DRC invalide. Format : +243 suivi de 9 chiffres (ex. +243 8XX XXX XXX).';
    }
    return null;
  };

  const submit = async () => {
    if (!isAuthenticated) return;
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const priceNum = parseFloat(showProperty ? prix : priceNight || prix);
      // Convert picked images to stored URIs (data URIs or local paths) so they
      // display in the gallery. Zero photos → placeholder image.
      const storedPhotos = await Promise.all(photos.map(readAsDataUri));
      const [p1 = null, p2 = null, p3 = null, p4 = null, p5 = null, p6 = null, p7 = null, p8 = null, p9 = null, p10 = null] = [...storedPhotos, null, null, null, null, null, null, null, null, null, null];

      const [fallbackLat, fallbackLng] = capitalCoords(province);
      const payload: Record<string, unknown> = {
        category,
        titre: titre.trim(),
        description: description.trim(),
        prix_usd: showProperty ? priceNum : 0,
        province,
        commune,
        latitude: latitude ?? fallbackLat,
        longitude: longitude ?? fallbackLng,
        adresse: adresse.trim(),
        doc_type: docType.trim(),
        contact_name: contactName.trim(),
        contact_phone: contactPhone.trim(),
        verified: false,
        photo_1: p1 ?? PLACEHOLDER_PHOTO,
        photo_2: p2,
        photo_3: p3,
        photo_4: p4,
        photo_5: p5,
        photo_6: p6,
        photo_7: p7,
        photo_8: p8,
        photo_9: p9,
        photo_10: p10,
      };
      if (category === 'buy' || category === 'rent') {
        payload.property_type = propertyType;
        if (category === 'rent') {
          payload.deposit_months_required = depositRequired ? parseInt(depositRequired, 10) : null;
        }
        if (isLandType(propertyType)) {
          // Terrain (under Acheter or Louer) uses land-specific fields.
          payload.land_dimensions = landDims.trim();
          payload.land_usage = landUsage.trim();
          payload.bedrooms = null;
          payload.bathrooms = null;
          payload.furnished = null;
          payload.surface_m2 = surface ? parseFloat(surface) : null;
        } else if (isResidentialType(propertyType, category)) {
          payload.bedrooms = bedrooms ? parseInt(bedrooms, 10) : null;
          payload.bathrooms = bathrooms ? parseInt(bathrooms, 10) : null;
          payload.surface_m2 = surface ? parseFloat(surface) : null;
          payload.furnished = furnished;
          payload.land_dimensions = null;
          payload.land_usage = null;
        } else {
          // Commercial / industriel / bureau: surface only, no bedrooms/bathrooms.
          payload.surface_m2 = surface ? parseFloat(surface) : null;
          payload.bedrooms = null;
          payload.bathrooms = null;
          payload.furnished = null;
          payload.land_dimensions = null;
          payload.land_usage = null;
        }
      } else {
        payload.stars = stars ? parseInt(stars, 10) : null;
        payload.price_per_night_usd = priceNum;
        payload.available_rooms = availableRooms ? parseInt(availableRooms, 10) : null;
        payload.amenities = amenities.trim();
        payload.max_adults = maxAdults ? parseInt(maxAdults, 10) : null;
        payload.children_allowed = childrenAllowed;
        payload.max_children = childrenAllowed && maxChildren ? parseInt(maxChildren, 10) : null;
      }

      if (isEdit) {
        const { error: updateError } = await client.from('listings').update(payload).eq('id', params.edit!);
        if (updateError) throw updateError;
        router.replace(`/listing/${params.edit}`);
      } else {
        const { data, error: insertError } = await client
          .from('listings')
          .insert({ ...payload, id: newId() })
          .select('id')
          .single();
        if (insertError) throw insertError;
        router.replace(`/listing/${(data as { id: string }).id}`);
      }
    } catch (e) {
      setError('Erreur lors de la publication. Veuillez réessayer.');
      setSubmitting(false);
    }
  };

  if (authLoading || loadingEdit) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color={isDark ? '#b8860b' : '#0e7490'} />
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    const isDesigner = (process.env.EXPO_PUBLIC_RAPIDNATIVE_MODE === 'designer' || process.env.EXPO_PUBLIC_RAPIDNATIVE_MODE === 'staging');
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-xl font-bold text-foreground text-center">Connectez-vous pour publier</Text>
          <Text className="text-muted-foreground text-sm text-center mt-2">
            Vous devez être connecté(e) pour déposer une annonce sur Congo Logement.
          </Text>
          <Pressable onPress={() => router.push('/(auth)/sign-in')} className="mt-5 bg-primary rounded-xl px-6 py-3.5">
            <Text className="text-white font-semibold">Se connecter</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View className="px-5 pt-3 pb-3">
            <Text className="text-2xl font-bold text-foreground tracking-tight">
              {isEdit ? "Modifier l'annonce" : 'Publier une annonce'}
            </Text>
            <Text className="text-muted-foreground text-sm mt-1">
              {isEdit ? 'Mettez à jour les informations du bien.' : 'Choisissez une catégorie et remplissez le formulaire.'}
            </Text>
          </View>

          <View className="px-5 gap-4">
            {/* Category (disabled in edit to avoid resetting fields) */}
            <View className="flex-row gap-2 flex-wrap">
              {CATEGORIES.map((c) => (
                <Pressable
                  key={c.key}
                  onPress={() => setCategory(c.key)}
                  className={`rounded-full px-4 py-2 ${category === c.key ? 'bg-primary' : 'bg-card border border-border'}`}
                >
                  <Text className={`text-sm font-semibold ${category === c.key ? 'text-white' : 'text-foreground'}`}>{c.label}</Text>
                </Pressable>
              ))}
            </View>

            <Field label="Titre *" value={titre} onChange={setTitre} ph={ph} placeholder="Ex : Villa à Gombe" />
            <Field label="Description" value={description} onChange={setDescription} ph={ph} placeholder="Décrivez le bien…" multiline />
            <Field label="Prix (USD) *" value={prix} onChange={setPrix} ph={ph} placeholder="Ex : 120000" keyboardType="numeric" />

            {/* Photos */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Photos (max 10)</Text>
              <View className="flex-row flex-wrap gap-2">
                {photos.map((p, i) => (
                  <View key={i} className="relative" style={{ width: 84, height: 84 }}>
                    <Image source={{ uri: p }} style={{ width: 84, height: 84, borderRadius: 10 }} />
                    <Pressable
                      onPress={() => removePhoto(i)}
                      className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-black/60 items-center justify-center"
                    >
                      <XIcon className="text-white" size={14} />
                    </Pressable>
                  </View>
                ))}
                {photos.length < 10 && (
                  <>
                    <Pressable
                      onPress={() => pickPhoto(false)}
                      className="w-[84px] h-[84px] rounded-[10px] bg-muted items-center justify-center border border-dashed border-border"
                    >
                      <ImagePlusIcon className="text-muted-foreground" size={22} />
                      <Text className="text-[10px] text-muted-foreground mt-1">Galerie</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => pickPhoto(true)}
                      className="w-[84px] h-[84px] rounded-[10px] bg-muted items-center justify-center border border-dashed border-border"
                    >
                      <CameraIcon className="text-muted-foreground" size={22} />
                      <Text className="text-[10px] text-muted-foreground mt-1">Caméra</Text>
                    </Pressable>
                  </>
                )}
              </View>
              <Text className="text-xs text-muted-foreground">
                {photos.length}/10 photos · Si aucune photo, une image par défaut sera utilisée.
              </Text>
            </View>

            <Text className="text-sm font-semibold text-foreground">Province *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              {PROVINCES.map((p) => (
                <Pressable
                  key={p.name}
                  onPress={() => { setProvince(p.name); setCommune(''); setLatitude(null); setLongitude(null); }}
                  className={`rounded-full px-3 py-1.5 ${province === p.name ? 'bg-accent' : 'bg-muted'}`}
                >
                  <Text className={`text-xs font-medium ${province === p.name ? 'text-accent-foreground' : 'text-foreground'}`}>{p.name}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text className="text-sm font-semibold text-foreground">Ville / Commune *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              {(placesForProvince(province).length ? placesForProvince(province) : ['—']).map((c) => (
                <Pressable
                  key={c}
                  disabled={c === '—'}
                  onPress={() => setCommune(commune === c ? '' : c)}
                  className={`rounded-full px-3 py-1.5 ${commune === c ? 'bg-accent' : 'bg-muted'}`}
                >
                  <Text className={`text-xs font-medium ${commune === c ? 'text-accent-foreground' : 'text-foreground'}`}>
                    {c === '—' ? 'Choisir une province' : c}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Interactive map to drop a pin at the exact property location */}
            <View className="gap-1.5">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-semibold text-foreground">Localisation sur la carte</Text>
                <View className="flex-row items-center gap-1">
                  <MapPinIcon className="text-primary" size={13} />
                  <Text className="text-[11px] text-muted-foreground">Touchez pour placer une épingle</Text>
                </View>
              </View>
              <LocationMap
                pins={
                  latitude != null && longitude != null
                    ? [{ id: 'pin', lat: latitude, lng: longitude }]
                    : []
                }
                center={latitude != null && longitude != null ? [latitude, longitude] : capitalCoords(province || 'Kinshasa')}
                interactive
                onPinDropped={(lat, lng) => {
                  setLatitude(lat);
                  setLongitude(lng);
                }}
                height={220}
              />
              {latitude != null && longitude != null ? (
                <Text className="text-xs text-muted-foreground">
                  Épingle placée : {latitude.toFixed(4)}, {longitude.toFixed(4)}
                </Text>
              ) : (
                <Text className="text-xs text-muted-foreground">
                  Si non précisée, la capitale de la province sera utilisée par défaut.
                </Text>
              )}
            </View>

            <Field label="Adresse" value={adresse} onChange={setAdresse} ph={ph} placeholder="Rue, avenue, quartier…" />
            <Field label="Type de document" value={docType} onChange={setDocType} ph={ph} placeholder="Titre foncier, acte notarié…" />
            <Field label="Nom du contact" value={contactName} onChange={setContactName} ph={ph} placeholder="Votre nom" />
            <Field label="Téléphone" value={contactPhone} onChange={setContactPhone} ph={ph} placeholder="+243 8XX XXX XXX" keyboardType="phone-pad" />
            <Text className="text-xs text-muted-foreground -mt-3">Format : +243 suivi de 9 chiffres (ex. +243 815 123 456).</Text>

            {showProperty && (
              <>
                <Text className="text-sm font-semibold text-foreground">Type de bien</Text>
                <View className="flex-row flex-wrap gap-2">
                  {propertyTypes.map((t) => (
                    <Pressable key={t} onPress={() => setPropertyType(t)} className={`rounded-lg px-4 py-2 ${propertyType === t ? 'bg-accent' : 'bg-muted'}`}>
                      <Text className={`text-sm font-medium ${propertyType === t ? 'text-accent-foreground' : 'text-foreground'}`}>{t}</Text>
                    </Pressable>
                  ))}
                </View>

                {landFields && (
                  <>
                    <Field label="Dimensions du terrain" value={landDims} onChange={setLandDims} ph={ph} placeholder="Ex : 600 m² (20m x 30m)" />
                    <Text className="text-sm font-semibold text-foreground">Usage du terrain</Text>
                    <View className="flex-row gap-2">
                      {LAND_USAGES.map((u) => (
                        <Pressable key={u} onPress={() => setLandUsage(u)} className={`rounded-lg px-3 py-2 ${landUsage === u ? 'bg-accent' : 'bg-muted'}`}>
                          <Text className={`text-sm font-medium ${landUsage === u ? 'text-accent-foreground' : 'text-foreground'}`}>{u}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </>
                )}

                {residentialFields && (
                  <>
                    <Field label="Chambres" value={bedrooms} onChange={setBedrooms} ph={ph} keyboardType="numeric" />
                    <Field label="Salles de bain" value={bathrooms} onChange={setBathrooms} ph={ph} keyboardType="numeric" />
                    <Field label="Superficie (m²)" value={surface} onChange={setSurface} ph={ph} keyboardType="numeric" />
                    <Pressable onPress={() => setFurnished((f) => !f)} className="flex-row items-center gap-2">
                      <View className={`w-5 h-5 rounded ${furnished ? 'bg-primary' : 'border border-border'}`} />
                      <Text className="text-sm text-foreground">Meublé</Text>
                    </Pressable>
                  </>
                )}

                {showProperty && !landFields && !residentialFields && (
                  <Field label="Superficie (m²)" value={surface} onChange={setSurface} ph={ph} keyboardType="numeric" />
                )}

                {/* Rental guarantee months (required) */}
                {category === 'rent' && (
                  <>
                    <Text className="text-sm font-semibold text-foreground">Nombre de mois de garantie exigés pour cette annonce *</Text>
                    <View className="flex-row flex-wrap gap-2">
                      {DEPOSIT_MONTHS.map((m) => (
                        <Pressable
                          key={m}
                          onPress={() => setDepositRequired(m)}
                          className={`rounded-lg px-3 py-1.5 ${depositRequired === m ? 'bg-accent' : 'bg-muted'}`}
                        >
                          <Text className={`text-xs font-medium ${depositRequired === m ? 'text-accent-foreground' : 'text-foreground'}`}>
                            {m} mois
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </>
                )}
              </>
            )}

            {category === 'hotel' && (
              <>
                <Field label="Classement (étoiles 1–5)" value={stars} onChange={setStars} ph={ph} keyboardType="numeric" />
                <Field label="Prix par nuit (USD) *" value={priceNight} onChange={setPriceNight} ph={ph} keyboardType="numeric" />
                <Field label="Chambres disponibles" value={availableRooms} onChange={setAvailableRooms} ph={ph} keyboardType="numeric" />
                <Field label="Équipements" value={amenities} onChange={setAmenities} ph={ph} placeholder="WiFi, piscine, parking…" />

                <Field label="Nombre maximum d'adultes *" value={maxAdults} onChange={setMaxAdults} ph={ph} keyboardType="numeric" />

                <Pressable onPress={() => setChildrenAllowed((v) => !v)} className="flex-row items-center gap-2">
                  <View className={`w-5 h-5 rounded ${childrenAllowed ? 'bg-primary' : 'border border-border'}`} />
                  <Text className="text-sm text-foreground">Enfants autorisés ?</Text>
                </Pressable>

                {childrenAllowed && (
                  <Field label="Nombre maximum d'enfants" value={maxChildren} onChange={setMaxChildren} ph={ph} keyboardType="numeric" />
                )}
              </>
            )}

            {error ? <Text className="text-destructive text-sm">{error}</Text> : null}

            {submitting && (
              <View className="gap-2">
                <View className="h-2 rounded-full bg-muted overflow-hidden">
                  <View className="h-full bg-blue-600 rounded-full" style={{ width: '100%' }} />
                </View>
                <Text className="text-blue-600 text-xs font-medium text-center">Publication en cours…</Text>
              </View>
            )}

            <Pressable
              onPress={submit}
              disabled={submitting}
              className={`flex-row items-center justify-center gap-2 rounded-xl py-4 active:scale-[0.97] ${published ? 'bg-emerald-600' : 'bg-accent'} ${submitting ? 'opacity-60' : ''}`}
            >
              {submitting ? (
                <ActivityIndicator color="#1c2a3a" />
              ) : published ? (
                <>
                  <CheckIcon className="text-white" size={20} />
                  <Text className="text-white font-bold">Publié</Text>
                </>
              ) : (
                <Text className="text-accent-foreground font-bold">{isEdit ? "Enregistrer les modifications" : "Publier l'annonce"}</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({
  label,
  value,
  onChange,
  ph,
  placeholder,
  keyboardType,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (s: string) => void;
  ph: string;
  placeholder: string;
  keyboardType?: 'default' | 'numeric' | 'phone-pad';
  multiline?: boolean;
}) {
  return (
    <View className="gap-1.5">
      <Text className="text-sm font-semibold text-foreground">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={ph}
        keyboardType={keyboardType}
        multiline={multiline}
        className="bg-card border border-border rounded-xl px-4 py-3 text-foreground"
      />
    </View>
  );
}
