import { View, Text, Pressable, Image } from 'react-native';
import { router } from 'expo-router';
import { MapPinIcon, BedDoubleIcon, BathIcon, RulerIcon, StarIcon } from 'lucide-react-native';
import { cssInterop } from 'nativewind';
import { type Listing } from '@/src/db/types';
import { getBadge, featuredPhoto, formatPrice, CATEGORY_LABELS, type Currency } from '@/src/lib/listing-utils';
import { VerificationBadge } from '@/src/components/VerificationBadge';
import { FavoriteButton } from '@/src/components/FavoriteButton';

cssInterop(MapPinIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(BedDoubleIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(BathIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(RulerIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(StarIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });

export function ListingCard({ listing, currency, arrival, departure, highlighted }: { listing: Listing; currency: Currency; arrival?: string; departure?: string; highlighted?: boolean }) {
  const badge = getBadge(listing);
  const img = featuredPhoto(listing);
  const isHotel = listing.category === 'hotel';
  const isLand = listing.category === 'land' || listing.property_type === 'Terrain';
  const price = isHotel
    ? listing.price_per_night_usd && listing.price_per_night_usd > 0
      ? `${formatPrice(listing.price_per_night_usd, currency)} / nuit`
      : 'Prix sur demande'
    : formatPrice(listing.prix_usd, currency);

  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: `/listing/${listing.id}`,
          params: arrival || departure ? { arrival: arrival ?? '', departure: departure ?? '' } : undefined,
        })
      }
      className={`active:scale-[0.98] bg-card rounded-2xl overflow-hidden shadow-hard-5 ${highlighted ? 'border-2 border-primary' : ''}`}
    >
      {img ? (
        <Image source={{ uri: img }} className="w-full h-44" style={{ width: '100%', height: 176 }} />
      ) : (
        <View className="w-full h-44 bg-muted items-center justify-center" style={{ height: 176 }}>
          <Text className="text-muted-foreground text-sm">Aucune photo</Text>
        </View>
      )}
      <View className="absolute top-2 right-2">
        <FavoriteButton listingId={listing.id} size={19} />
      </View>

      <View className="p-4 gap-2">
        <View className="flex-row items-center justify-between gap-2">
          <Text className="text-[11px] font-semibold text-primary uppercase tracking-wide">
            {CATEGORY_LABELS[listing.category]}
          </Text>
          <VerificationBadge badge={badge} />
        </View>

        <Text className="text-base font-semibold text-foreground" numberOfLines={2}>
          {listing.titre}
        </Text>

        <View className="flex-row items-center gap-1">
          <MapPinIcon className="text-muted-foreground" size={13} />
          <Text className="text-xs text-muted-foreground flex-1" numberOfLines={1}>
            {listing.commune}
          </Text>
        </View>

        <View className="flex-row items-center gap-3 mt-1">
          {!isLand && !isHotel && (
            <>
              {listing.bedrooms != null && (
                <View className="flex-row items-center gap-1">
                  <BedDoubleIcon className="text-muted-foreground" size={14} />
                  <Text className="text-xs text-muted-foreground">{listing.bedrooms} ch.</Text>
                </View>
              )}
              {listing.bathrooms != null && (
                <View className="flex-row items-center gap-1">
                  <BathIcon className="text-muted-foreground" size={14} />
                  <Text className="text-xs text-muted-foreground">{listing.bathrooms}</Text>
                </View>
              )}
              {listing.surface_m2 != null && (
                <View className="flex-row items-center gap-1">
                  <RulerIcon className="text-muted-foreground" size={14} />
                  <Text className="text-xs text-muted-foreground">{listing.surface_m2} m²</Text>
                </View>
              )}
            </>
          )}
          {isHotel && listing.stars != null && (
            <View className="flex-row items-center gap-1">
              <StarIcon className="text-amber-500" size={14} />
              <Text className="text-xs text-muted-foreground">{listing.stars} étoiles</Text>
            </View>
          )}
          {isLand && listing.land_dimensions && (
            <View className="flex-row items-center gap-1">
              <RulerIcon className="text-muted-foreground" size={14} />
              <Text className="text-xs text-muted-foreground">{listing.land_dimensions}</Text>
            </View>
          )}
        </View>

        <Text className="text-lg font-bold text-foreground mt-1">{price}</Text>
      </View>
    </Pressable>
  );
}
