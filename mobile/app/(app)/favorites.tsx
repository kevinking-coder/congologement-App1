import { View, Text, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { ArrowLeftIcon, HeartIcon } from 'lucide-react-native';
import { cssInterop, useColorScheme } from 'nativewind';
import { useApp } from '@/src/providers/AppProvider';
import { useAuth } from '@/src/hooks';
import { type Listing } from '@/src/db/types';
import { useCurrency } from '@/src/lib/currency-context';
import { ListingCard } from '@/src/components/ListingCard';

cssInterop(ArrowLeftIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(HeartIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });

export default function FavoritesScreen() {
  const { client } = useApp();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { currency } = useCurrency();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      const { data, error } = await client
        .from('favorites')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });

  const ids = favorites.map((f) => f.listing_id);

  const { data: listings = [], isLoading: listingsLoading } = useQuery({
    queryKey: ['listings', 'favorites', ids.join(',')],
    queryFn: async () => {
      if (ids.length === 0) return [] as Listing[];
      const { data, error } = await client.from('listings').select('*').in('id', ids);
      if (error) throw error;
      return (data ?? []) as Listing[];
    },
    enabled: ids.length > 0,
  });

  // Keep the favorites' original order (most recently saved first).
  const ordered = ids
    .map((id) => listings.find((l) => l.id === id))
    .filter((l): l is Listing => !!l);

  const loading = authLoading || isLoading || (ids.length > 0 && listingsLoading);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <View className="flex-row items-center gap-3 px-5 pt-3 pb-4">
        <Pressable onPress={() => router.back()} className="p-1 -ml-1">
          <ArrowLeftIcon className="text-foreground" size={24} />
        </Pressable>
        <Text className="text-2xl font-bold text-foreground tracking-tight">Mes favoris</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={isDark ? '#b8860b' : '#0e7490'} className="mt-10" />
      ) : !isAuthenticated ? (
        <View className="items-center justify-center px-8 pt-16">
          <View className="w-16 h-16 rounded-full bg-muted items-center justify-center mb-4">
            <HeartIcon className="text-muted-foreground" size={28} />
          </View>
          <Text className="text-foreground text-lg font-semibold text-center">Connectez-vous</Text>
          <Text className="text-muted-foreground text-sm text-center mt-2">
            Enregistrez vos biens préférés pour les retrouver ici.
          </Text>
          <Pressable onPress={() => router.push('/(auth)/sign-in')} className="mt-6 bg-primary rounded-xl px-8 py-3.5">
            <Text className="text-white font-semibold">Se connecter</Text>
          </Pressable>
        </View>
      ) : ordered.length === 0 ? (
        <View className="items-center justify-center px-8 pt-16">
          <View className="w-16 h-16 rounded-full bg-muted items-center justify-center mb-4">
            <HeartIcon className="text-muted-foreground" size={28} />
          </View>
          <Text className="text-foreground text-lg font-semibold">Aucun favori</Text>
          <Text className="text-muted-foreground text-sm text-center mt-2">
            Touchez le cœur sur une annonce pour la sauvegarder ici.
          </Text>
          <Pressable onPress={() => router.replace('/explorer')} className="mt-5 bg-accent rounded-xl px-6 py-3.5">
            <Text className="text-accent-foreground font-bold">Explorer les annonces</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={ordered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, gap: 14 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <ListingCard listing={item} currency={currency} />}
        />
      )}
    </SafeAreaView>
  );
}
