import { View, Text, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeftIcon, UserIcon, ShieldCheckIcon } from 'lucide-react-native';
import { cssInterop, useColorScheme } from 'nativewind';
import { useApp } from '@/src/providers/AppProvider';
import { type Listing, type Profile } from '@/src/db/types';
import { useCurrency } from '@/src/lib/currency-context';
import { ListingCard } from '@/src/components/ListingCard';
import { getBadge } from '@/src/lib/listing-utils';

cssInterop(ArrowLeftIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(UserIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(ShieldCheckIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });

export default function SellerProfileScreen() {
  const { sellerId } = useLocalSearchParams<{ sellerId: string }>();
  const { client } = useApp();
  const { currency } = useCurrency();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', sellerId],
    queryFn: async () => {
      const { data, error } = await client.from('profiles').select('*').eq('id', sellerId).maybeSingle();
      if (error && error.code !== 'PGRST116') throw error;
      return (data ?? null) as Profile | null;
    },
    enabled: !!sellerId,
  });

  const { data: listings = [], isLoading: listingsLoading } = useQuery({
    queryKey: ['listings', 'seller', sellerId],
    queryFn: async () => {
      const { data, error } = await client
        .from('listings')
        .select('*')
        .eq('user_id', sellerId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Listing[];
    },
    enabled: !!sellerId,
  });

  const verifiedCount = listings.filter((l) => getBadge(l).kind === 'verified').length;
  const name = profile?.full_name || 'Vendeur';
  const initial = (name || '?').slice(0, 1).toUpperCase();

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <View className="flex-row items-center gap-3 px-5 pt-3 pb-4">
        <Pressable onPress={() => router.back()} className="p-1 -ml-1">
          <ArrowLeftIcon className="text-foreground" size={24} />
        </Pressable>
        <Text className="text-2xl font-bold text-foreground tracking-tight">Annonces du vendeur</Text>
      </View>

      {(profileLoading || listingsLoading) && !listings.length ? (
        <ActivityIndicator color={isDark ? '#b8860b' : '#0e7490'} className="mt-6" />
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, gap: 14 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View className="bg-card rounded-2xl p-4 border border-border mb-2">
              <View className="flex-row items-center gap-3">
                <View className="w-14 h-14 rounded-full bg-primary items-center justify-center">
                  <Text className="text-white font-bold text-xl">{initial}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-foreground">{name}</Text>
                  <View className="flex-row items-center gap-1 mt-1">
                    <ShieldCheckIcon className="text-emerald-700" size={14} />
                    <Text className="text-xs text-muted-foreground">
                      {verifiedCount} annonce{verifiedCount > 1 ? 's' : ''} vérifiée{verifiedCount > 1 ? 's' : ''}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          }
          ListEmptyComponent={
            <View className="items-center justify-center py-16 px-6">
              <View className="w-16 h-16 rounded-full bg-muted items-center justify-center mb-4">
                <UserIcon className="text-muted-foreground" size={28} />
              </View>
              <Text className="text-foreground text-lg font-semibold">Aucune annonce</Text>
              <Text className="text-muted-foreground text-sm text-center mt-2">
                Ce vendeur n'a aucune annonce active pour le moment.
              </Text>
            </View>
          }
          renderItem={({ item }) => <ListingCard listing={item} currency={currency} />}
        />
      )}
    </SafeAreaView>
  );
}
