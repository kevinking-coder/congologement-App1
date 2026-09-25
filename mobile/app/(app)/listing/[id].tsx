import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Image, Linking, Alert, Modal, TextInput, ActivityIndicator, Platform, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeftIcon,
  MapPinIcon,
  BedDoubleIcon,
  BathIcon,
  RulerIcon,
  StarIcon,
  PhoneIcon,
  CopyIcon,
  ShieldCheckIcon,
  ClockIcon,
  AlertCircleIcon,
  PencilIcon,
  Trash2Icon,
  FlagIcon,
  Share2Icon,
  StoreIcon,
} from 'lucide-react-native';
import { cssInterop, useColorScheme } from 'nativewind';
import * as Clipboard from 'expo-clipboard';
import { useApp } from '@/src/providers/AppProvider';
import { useAuth } from '@/src/hooks';
import { type Listing } from '@/src/db/types';
import { getBadge, allPhotos, formatPrice, CATEGORY_LABELS } from '@/src/lib/listing-utils';
import { useCurrency } from '@/src/lib/currency-context';
import { VerificationBadge } from '@/src/components/VerificationBadge';
import { ListingCard } from '@/src/components/ListingCard';
import { FavoriteButton } from '@/src/components/FavoriteButton';
import { newId } from '@/src/lib/id';

cssInterop(ArrowLeftIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(MapPinIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(BedDoubleIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(BathIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(RulerIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(StarIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(PhoneIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(CopyIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(ShieldCheckIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(ClockIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(AlertCircleIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(PencilIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(Trash2Icon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(FlagIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(Share2Icon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(StoreIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });

const BADGE_EXPLANATION: Record<string, string> = {
  verified: "Cette annonce a été entièrement vérifiée : les titres de propriété et documents ont été contrôlés par notre équipe.",
  partial: "Certains documents ont été fournis mais la vérification complète des titres est encore en cours.",
  unverified: "Aucun document n'a encore été fourni pour cette annonce. Soyez prudent lors de la transaction.",
};

const REPORT_REASONS = [
  'Informations incorrectes',
  'Annonce frauduleuse',
  'Bien déjà vendu-loué',
  'Autre',
];

export default function ListingDetail() {
  const { id, arrival, departure } = useLocalSearchParams<{ id: string; arrival?: string; departure?: string }>();
  const { client } = useApp();
  const { user, isAuthenticated } = useAuth();
  const { currency } = useCurrency();
  const queryClient = useQueryClient();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const ph = isDark ? '#8aa0b8' : '#9aa3b2';

  const [badgeModal, setBadgeModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reportModal, setReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [reportThanks, setReportThanks] = useState(false);
  const [calcMonths, setCalcMonths] = useState<string>('');
  const [calcRent, setCalcRent] = useState<string>('');

  const { data: listing, isLoading } = useQuery({
    queryKey: ['listing', id],
    queryFn: async () => {
      const { data, error } = await client.from('listings').select('*').eq('id', id).single();
      if (error) throw error;
      return data as Listing;
    },
    enabled: !!id,
  });

  const { data: similar = [] } = useQuery({
    queryKey: ['listings', 'similar', listing?.category, listing?.id],
    queryFn: async () => {
      if (!listing) return [];
      const { data, error } = await client
        .from('listings')
        .select('*')
        .eq('category', listing.category)
        .neq('id', listing.id)
        .limit(3);
      if (error) throw error;
      return (data ?? []) as Listing[];
    },
    enabled: !!listing,
  });

  // Pre-fill the deposit calculator from the listing (rent only).
  useEffect(() => {
    if (!listing) return;
    if (listing.category === 'rent') {
      setCalcRent(listing.prix_usd != null ? String(listing.prix_usd) : '');
      setCalcMonths(listing.deposit_months_required != null ? String(listing.deposit_months_required) : '');
    }
  }, [listing]);

  const del = useMutation({
    mutationFn: async () => {
      const { error } = await client.from('listings').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      router.replace('/mylistings');
    },
  });

  const submitReport = useMutation({
    mutationFn: async () => {
      const { error } = await client.from('reports').insert({
        id: newId(),
        listing_id: id!,
        reason: reportReason,
        details: reportDetails.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setReportThanks(true);
      setReportModal(false);
    },
  });

  if (isLoading || !listing) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-background items-center justify-center">
        <Pressable onPress={() => router.back()} className="absolute top-4 left-4 p-2">
          <ArrowLeftIcon className="text-foreground" size={24} />
        </Pressable>
        <ActivityIndicator color={isDark ? '#b8860b' : '#0e7490'} />
      </SafeAreaView>
    );
  }

  const badge = getBadge(listing);
  const photos = allPhotos(listing);
  const isHotel = listing.category === 'hotel';
  const isLand = listing.category === 'land' || listing.property_type === 'Terrain';
  const phone = listing.contact_phone.replace(/[^0-9+]/g, '');
  const isOwner = isAuthenticated && user?.id === listing.user_id;

  const call = () => {
    Linking.openURL(`tel:${phone}`).catch(() => Alert.alert('Erreur', "Impossible de lancer l'appel."));
  };

  const copyPhone = async () => {
    await Clipboard.setStringAsync(listing.contact_phone || phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareListing = async () => {
    try {
      await Share.share({
        title: listing.titre,
        message: `${listing.titre}\n${listing.commune ? `${listing.commune} — ` : ''}${listing.contact_phone || ''}\n\nRetrouvez cette annonce sur Congo Logement.`,
      });
    } catch {
      // user cancelled or share sheet unavailable — nothing to surface
    }
  };

  const confirmDelete = () => {
    const message = 'Êtes-vous sûr de vouloir supprimer cette annonce ?';
    if (Platform.OS === 'web') {
      if (window.confirm(message)) del.mutate();
    } else {
      Alert.alert('Supprimer', message, [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => del.mutate() },
      ]);
    }
  };

  const price = isHotel
    ? listing.price_per_night_usd && listing.price_per_night_usd > 0
      ? `${formatPrice(listing.price_per_night_usd, currency)} / nuit`
      : 'Prix sur demande'
    : formatPrice(listing.prix_usd, currency);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        {/* Photo gallery */}
        <View className="relative">
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
            {photos.length > 0 ? (
              photos.map((p, i) => (
                <Image key={i} source={{ uri: p }} style={{ width: 420, height: 260 }} />
              ))
            ) : (
              <View className="bg-muted items-center justify-center" style={{ width: 420, height: 260 }}>
                <Text className="text-muted-foreground">Aucune photo</Text>
              </View>
            )}
          </ScrollView>
          <Pressable
            onPress={() => router.back()}
            className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/40 items-center justify-center"
          >
            <ArrowLeftIcon className="text-white" size={20} />
          </Pressable>
          <View className="absolute top-4 right-4">
            <FavoriteButton listingId={listing.id} size={22} />
          </View>
        </View>

        <View className="px-5 mt-4 gap-4">
          <View className="flex-row items-center justify-between gap-2">
            <Text className="text-xs font-semibold text-primary uppercase tracking-wide">
              {CATEGORY_LABELS[listing.category]}
            </Text>
            <VerificationBadge badge={badge} />
          </View>

          <Text className="text-2xl font-bold text-foreground tracking-tight">{listing.titre}</Text>

          <Text className="text-2xl font-bold text-primary">{price}</Text>

          <View className="flex-row items-center gap-2">
            <MapPinIcon className="text-muted-foreground" size={16} />
            <Text className="text-sm text-muted-foreground">{listing.adresse || listing.commune}</Text>
          </View>

          {/* Selected dates (hotel) */}
          {isHotel && (arrival || departure) && (
            <View className="bg-accent/10 rounded-xl px-4 py-3">
              <Text className="text-sm text-foreground">
                Vos dates : {arrival || '—'} – {departure || '—'}
              </Text>
              <Text className="text-xs text-muted-foreground mt-0.5">
                Mentionnez ces dates lorsque vous contactez l'établissement.
              </Text>
            </View>
          )}

          {/* Characteristics */}
          <View className="bg-card rounded-2xl p-4 gap-3">
            <Text className="text-base font-semibold text-foreground">Caractéristiques</Text>
            <View className="flex-row flex-wrap gap-x-5 gap-y-3">
              {!isLand && !isHotel && (
                <>
                  {listing.bedrooms != null && (
                    <View className="flex-row items-center gap-1.5 w-[45%]">
                      <BedDoubleIcon className="text-primary" size={18} />
                      <Text className="text-sm text-foreground">{listing.bedrooms} chambres</Text>
                    </View>
                  )}
                  {listing.bathrooms != null && (
                    <View className="flex-row items-center gap-1.5 w-[45%]">
                      <BathIcon className="text-primary" size={18} />
                      <Text className="text-sm text-foreground">{listing.bathrooms} salles de bain</Text>
                    </View>
                  )}
                  {listing.surface_m2 != null && (
                    <View className="flex-row items-center gap-1.5 w-[45%]">
                      <RulerIcon className="text-primary" size={18} />
                      <Text className="text-sm text-foreground">{listing.surface_m2} m²</Text>
                    </View>
                  )}
                  <View className="flex-row items-center gap-1.5 w-[45%]">
                    <Text className="text-sm text-foreground">Meublé : {listing.furnished ? 'Oui' : 'Non'}</Text>
                  </View>
                </>
              )}
              {isLand && (
                <>
                  {listing.land_dimensions && (
                    <View className="flex-row items-center gap-1.5 w-full">
                      <RulerIcon className="text-primary" size={18} />
                      <Text className="text-sm text-foreground">{listing.land_dimensions}</Text>
                    </View>
                  )}
                  {listing.land_usage && (
                    <Text className="text-sm text-foreground w-full">Usage : {listing.land_usage}</Text>
                  )}
                </>
              )}
              {isHotel && (
                <>
                  {listing.stars != null && (
                    <View className="flex-row items-center gap-1.5 w-[45%]">
                      <StarIcon className="text-amber-500" size={18} />
                      <Text className="text-sm text-foreground">{listing.stars} étoiles</Text>
                    </View>
                  )}
                  {listing.available_rooms != null && (
                    <Text className="text-sm text-foreground w-[45%]">{listing.available_rooms} chambres dispo.</Text>
                  )}
                  {listing.max_adults != null && (
                    <Text className="text-sm text-foreground w-[45%]">{listing.max_adults} adultes max</Text>
                  )}
                  {listing.children_allowed && listing.max_children != null && (
                    <Text className="text-sm text-foreground w-[45%]">{listing.max_children} enfants max</Text>
                  )}
                  {listing.amenities && (
                    <View className="w-full">
                      <Text className="text-sm font-semibold text-foreground mb-1">Équipements</Text>
                      <Text className="text-sm text-muted-foreground">{listing.amenities}</Text>
                    </View>
                  )}
                </>
              )}
            </View>
          </View>

          {/* Description */}
          <View className="bg-card rounded-2xl p-4">
            <Text className="text-base font-semibold text-foreground mb-2">Description</Text>
            <Text className="text-sm text-muted-foreground leading-5">{listing.description}</Text>
          </View>

          {/* Deposit calculator (rent only) */}
          {listing.category === 'rent' && (
            <View className="bg-card rounded-2xl p-4 gap-3">
              <Text className="text-base font-semibold text-foreground">Calculette de dépôt</Text>
              <View>
                <Text className="text-sm font-semibold text-foreground mb-1.5">Loyer mensuel (USD)</Text>
                <TextInput
                  value={calcRent}
                  onChangeText={setCalcRent}
                  keyboardType="numeric"
                  placeholder="Ex : 500"
                  placeholderTextColor={ph}
                  className="bg-muted rounded-xl px-4 py-3 text-foreground"
                />
              </View>
              <View>
                <Text className="text-sm font-semibold text-foreground mb-1.5">Mois de dépôt</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                  {['1','2','3','4','5','6','7','8','9','10'].map((m) => (
                    <Pressable
                      key={m}
                      onPress={() => setCalcMonths(m)}
                      className={`rounded-lg px-3 py-1.5 ${calcMonths === m ? 'bg-accent' : 'bg-muted'}`}
                    >
                      <Text className={`text-xs font-medium ${calcMonths === m ? 'text-accent-foreground' : 'text-foreground'}`}>{m}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
              {(() => {
                const rent = parseFloat(calcRent);
                const months = parseInt(calcMonths, 10);
                if (!isNaN(rent) && !isNaN(months) && months > 0) {
                  const total = rent + rent * months;
                  return (
                    <View className="bg-primary/10 rounded-xl px-4 py-3">
                      <Text className="text-xs text-muted-foreground">Coût total à l'entrée</Text>
                      <Text className="text-xl font-bold text-primary">{formatPrice(total, currency)}</Text>
                      <Text className="text-xs text-muted-foreground mt-0.5">
                        Loyer ({formatPrice(rent, currency)}) + dépôt ({formatPrice(rent * months, currency)})
                      </Text>
                    </View>
                  );
                }
                return (
                  <Text className="text-xs text-muted-foreground">
                    Saisissez le loyer et les mois de dépôt pour calculer le coût total à l'entrée.
                  </Text>
                );
              })()}
            </View>
          )}

          {/* Verification clickable */}
          <Pressable onPress={() => setBadgeModal(true)} className="bg-card rounded-2xl p-4 flex-row items-center gap-3">
            <VerificationBadge badge={badge} />
            <Text className="text-sm text-primary font-medium flex-1">En savoir plus</Text>
          </Pressable>

          {/* Report this listing */}
          <Pressable onPress={() => { setReportReason(''); setReportDetails(''); setReportModal(true); }} className="flex-row items-center gap-2 py-1">
            <FlagIcon className="text-muted-foreground" size={15} />
            <Text className="text-sm text-muted-foreground underline">Signaler cette annonce</Text>
          </Pressable>

          {/* Share */}
          <Pressable onPress={shareListing} className="flex-row items-center gap-2 py-1">
            <Share2Icon className="text-muted-foreground" size={15} />
            <Text className="text-sm text-muted-foreground underline">Partager</Text>
          </Pressable>

          {/* See all listings from this seller */}
          {!isOwner && (
            <Pressable
              onPress={() => router.push(`/seller/${listing.user_id}`)}
              className="bg-card rounded-2xl p-4 flex-row items-center gap-3 border border-border"
            >
              <StoreIcon className="text-primary" size={18} />
              <Text className="text-sm text-primary font-medium flex-1">Voir toutes les annonces de ce vendeur</Text>
            </Pressable>
          )}

          {/* Similar listings */}
          {similar.length > 0 && (
            <View>
              <Text className="text-lg font-semibold text-foreground mb-3">Annonces similaires</Text>
              <View className="gap-4">
                {similar.map((l) => (
                  <ListingCard key={l.id} listing={l} currency={currency} />
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom action bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-card border-t border-border px-5 py-3" style={{ paddingBottom: 24 }}>
        {isOwner ? (
          <View className="flex-row gap-3">
            <Pressable
              onPress={() => router.push(`/publish?edit=${listing.id}`)}
              className="flex-1 flex-row items-center justify-center gap-2 bg-primary rounded-xl py-3.5 active:scale-[0.97]"
            >
              <PencilIcon className="text-white" size={17} />
              <Text className="text-white font-semibold">Modifier cette annonce</Text>
            </Pressable>
            <Pressable
              onPress={confirmDelete}
              disabled={del.isPending}
              className="flex-1 flex-row items-center justify-center gap-2 rounded-xl py-3.5 border border-destructive active:scale-[0.97]"
            >
              {del.isPending ? (
                <ActivityIndicator color="#be2630" />
              ) : (
                <>
                  <Trash2Icon className="text-destructive" size={17} />
                  <Text className="text-destructive font-semibold">Supprimer</Text>
                </>
              )}
            </Pressable>
          </View>
        ) : (
          <View className="gap-2">
            <View className="flex-row items-center gap-2">
              <Text className="text-xs text-muted-foreground">Numéro de contact</Text>
            </View>
            <Text className="text-lg font-bold text-foreground">{listing.contact_phone || 'Non renseigné'}</Text>
            <View className="flex-row gap-3 mt-1">
              <Pressable
                onPress={copyPhone}
                className="flex-1 flex-row items-center justify-center gap-2 bg-muted rounded-xl py-3 active:scale-[0.97]"
              >
                <CopyIcon className="text-foreground" size={17} />
                <Text className="text-foreground font-semibold">{copied ? 'Copié !' : 'Copier le numéro'}</Text>
              </Pressable>
              <Pressable
                onPress={call}
                className="flex-1 flex-row items-center justify-center gap-2 bg-accent rounded-xl py-3 active:scale-[0.97]"
              >
                <PhoneIcon className="text-accent-foreground" size={17} />
                <Text className="text-accent-foreground font-semibold">Appeler</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>

      {/* Report modal */}
      <Modal visible={reportModal} transparent animationType="fade" onRequestClose={() => setReportModal(false)}>
        <Pressable className="flex-1 items-center justify-center px-6" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onPress={() => setReportModal(false)}>
          <Pressable className="bg-card rounded-2xl p-5 w-full max-w-md items-start" onPress={() => {}}>
            <Text className="text-base font-semibold text-foreground mb-3">Signaler cette annonce</Text>
            <Text className="text-sm font-semibold text-foreground mb-2">Motif</Text>
            <View className="gap-2 w-full mb-4">
              {REPORT_REASONS.map((r) => (
                <Pressable
                  key={r}
                  onPress={() => setReportReason(r)}
                  className={`rounded-lg px-3 py-2.5 border ${reportReason === r ? 'bg-primary border-primary' : 'border-border'}`}
                >
                  <Text className={`text-sm ${reportReason === r ? 'text-white font-semibold' : 'text-foreground'}`}>{r}</Text>
                </Pressable>
              ))}
            </View>
            <Text className="text-sm font-semibold text-foreground mb-2">Détails (facultatif)</Text>
            <TextInput
              value={reportDetails}
              onChangeText={setReportDetails}
              placeholder="Précisions…"
              placeholderTextColor={ph}
              multiline
              className="w-full bg-muted rounded-xl px-4 py-3 text-foreground mb-4"
            />
            {submitReport.isError && <Text className="text-destructive text-sm mb-3">Échec de l'envoi. Réessayez.</Text>}
            <View className="flex-row gap-2 w-full">
              <Pressable onPress={() => setReportModal(false)} className="flex-1 rounded-xl py-3 items-center border border-border">
                <Text className="text-foreground font-medium">Annuler</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  if (!reportReason) return;
                  submitReport.mutate();
                }}
                disabled={submitReport.isPending || !reportReason}
                className="flex-1 bg-primary rounded-xl py-3 items-center"
              >
                {submitReport.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-semibold">Envoyer</Text>
                )}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Report thank-you */}
      <Modal visible={reportThanks} transparent animationType="fade" onRequestClose={() => setReportThanks(false)}>
        <Pressable className="flex-1 items-center justify-center px-6" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onPress={() => setReportThanks(false)}>
          <Pressable className="bg-card rounded-2xl p-5 items-center" onPress={() => {}}>
            <ShieldCheckIcon className="text-emerald-700" size={32} />
            <Text className="text-base font-semibold text-foreground mt-3 text-center">Merci !</Text>
            <Text className="text-sm text-muted-foreground mt-1 text-center">
              Votre signalement a bien été envoyé. Notre équipe va l'examiner.
            </Text>
            <Pressable onPress={() => setReportThanks(false)} className="mt-4 bg-primary rounded-xl px-6 py-2.5">
              <Text className="text-white font-semibold">Fermer</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Badge explanation modal */}
      <Modal visible={badgeModal} transparent animationType="fade" onRequestClose={() => setBadgeModal(false)}>
        <Pressable className="flex-1 items-center justify-center px-6" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onPress={() => setBadgeModal(false)}>
          <Pressable className="bg-card rounded-2xl p-5 items-start" onPress={() => {}}>
            <View className="flex-row items-center gap-2 mb-3">
              {badge.kind === 'verified' && <ShieldCheckIcon className="text-emerald-700" size={20} />}
              {badge.kind === 'partial' && <ClockIcon className="text-amber-700" size={20} />}
              {badge.kind === 'unverified' && <AlertCircleIcon className="text-zinc-600" size={20} />}
              <Text className="text-base font-semibold text-foreground">{badge.label}</Text>
            </View>
            <Text className="text-sm text-muted-foreground leading-5">{BADGE_EXPLANATION[badge.kind]}</Text>
            {listing.doc_type && listing.doc_type.trim() !== '' && listing.doc_type !== 'Aucun' && (
              <Text className="text-sm text-foreground mt-3">Type de document : {listing.doc_type}</Text>
            )}
            <Pressable onPress={() => setBadgeModal(false)} className="mt-4 self-end bg-primary rounded-xl px-4 py-2">
              <Text className="text-white font-semibold">Fermer</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
