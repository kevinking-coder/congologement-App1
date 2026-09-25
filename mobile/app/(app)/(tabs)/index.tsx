import { View, Text, ScrollView, Pressable, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import {
  SearchIcon,
  HouseIcon,
  Building2Icon,
  TreesIcon,
  HotelIcon,
  ShieldCheckIcon,
  SmartphoneIcon,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';
import { useApp } from '@/src/providers/AppProvider';
import { type Listing } from '@/src/db/types';
import { useCurrency } from '@/src/lib/currency-context';
import { ListingCard } from '@/src/components/ListingCard';

cssInterop(SearchIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(HouseIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(Building2Icon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(TreesIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(HotelIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(ShieldCheckIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(SmartphoneIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });

const CATEGORY_TILES = [
  { key: 'buy', label: 'Maisons', icon: HouseIcon, image: 'https://pics.rapidnative.app/interior/VrH0HK5vohpEQh62NG4b5.jpg' },
  { key: 'rent', label: 'Appartements', icon: Building2Icon, image: 'https://pics.rapidnative.app/interior/-j4GZ6wYlYq9-uJOC5b20.jpg' },
  { key: 'land', label: 'Terrains', icon: TreesIcon, image: 'https://pics.rapidnative.app/nature/Th528FRVd8nR2WHk-cR6H.jpg', path: 'buy' },
  { key: 'hotel', label: 'Hôtels', icon: HotelIcon, image: 'https://pics.rapidnative.app/interior/_h5TuqA8wKRGJjmzhqudV.jpg' },
] as const;

function LogoBadge({ size = 40 }: { size?: number }) {
  return (
    <LinearGradient
      colors={['#1E6FE0', '#1E6FE0', '#CE1021']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }}
    >
      {/* white house with doorway cutout */}
      <View style={{ width: size * 0.5, height: size * 0.4, position: 'relative', alignItems: 'center', justifyContent: 'flex-end' }}>
        <View style={{ position: 'absolute', top: 0, width: 0, height: 0, borderLeftWidth: size * 0.25, borderRightWidth: size * 0.25, borderBottomWidth: size * 0.22, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: '#fff' }} />
        <View style={{ width: size * 0.34, height: size * 0.22, backgroundColor: '#fff' }} />
        {/* doorway showing blue tone */}
        <View style={{ position: 'absolute', bottom: 0, width: size * 0.12, height: size * 0.14, backgroundColor: '#1E6FE0' }} />
      </View>
    </LinearGradient>
  );
}

function BrandHeader() {
  return (
    <View className="flex-row items-center gap-3">
      <LogoBadge size={42} />
      <View>
        <Text className="text-xl font-bold tracking-tight" style={{ color: '#132C6B' }}>Congo Logement</Text>
        <Text className="text-[10px] font-semibold tracking-[0.3em]" style={{ color: '#1E6FE0' }}>PROPERTY 243</Text>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const { client } = useApp();
  const { currency } = useCurrency();

  const { data: listings = [], isLoading, refetch } = useQuery({
    queryKey: ['listings', 'home'],
    queryFn: async () => {
      const { data, error } = await client.from('listings').select('*').order('created_at', { ascending: false }).limit(50);
      if (error) throw error;
      return (data ?? []) as Listing[];
    },
  });

  const verified = listings.filter((l) => l.verified).slice(0, 3);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header / brand */}
        <View className="px-5 pt-4 pb-2">
          <BrandHeader />
        </View>

        {/* Welcome banner */}
        <View className="mx-5 mt-3 rounded-3xl overflow-hidden bg-primary p-5" style={{ backgroundColor: '#0b1c32' }}>
          <Text className="text-white text-xl font-bold">Trouvez votre prochain bien à Kinshasa</Text>
          <Text className="text-blue-100/80 text-sm mt-1">Acheter, louer ou investir en toute confiance.</Text>
          <Pressable
            onPress={() => router.push('/explorer')}
            className="mt-4 flex-row items-center bg-white rounded-xl px-4 py-3 active:scale-[0.97]"
          >
            <SearchIcon className="text-muted-foreground" size={17} />
            <Text className="text-muted-foreground text-sm ml-2">Rechercher une commune, un quartier…</Text>
          </Pressable>
        </View>

        {/* Category tiles */}
        <Text className="text-lg font-semibold text-foreground px-5 mt-6 mb-3">Catégories</Text>
        <View className="flex-row flex-wrap gap-3 px-5">
          {CATEGORY_TILES.map((tile) => (
            <Pressable
              key={tile.key}
              onPress={() => router.push({ pathname: '/explorer', params: { category: tile.path ?? tile.key } })}
              className="active:scale-[0.97] rounded-2xl overflow-hidden"
              style={{ width: '47.5%' }}
            >
              <Image source={{ uri: tile.image }} style={{ width: '100%', height: 110 }} />
              <View className="absolute inset-0 bg-black/35" />
              <View className="absolute bottom-0 left-0 right-0 p-3 flex-row items-center gap-2">
                <tile.icon className="text-amber-400" size={16} />
                <Text className="text-white text-sm font-semibold">{tile.label}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Verified listings */}
        <View className="flex-row items-center justify-between px-5 mt-7 mb-3">
          <Text className="text-lg font-semibold text-foreground">Annonces vérifiées</Text>
          <Pressable onPress={() => router.push('/explorer')}>
            <Text className="text-primary text-sm font-semibold">Tout voir</Text>
          </Pressable>
        </View>
        <View className="gap-4 px-5">
          {verified.length === 0 ? (
            <View className="bg-card rounded-2xl p-6 items-center">
              <Text className="text-muted-foreground text-sm">Aucune annonce vérifiée pour le moment.</Text>
            </View>
          ) : (
            verified.map((l) => <ListingCard key={l.id} listing={l} currency={currency} />)
          )}
        </View>

        {/* Trust banner */}
        <View className="mx-5 mt-7 bg-card rounded-2xl p-5 border border-border">
          <Text className="text-base font-semibold text-foreground">Une plateforme de confiance</Text>
          <View className="mt-4 gap-3">
            <View className="flex-row items-center gap-3">
              <View className="w-9 h-9 rounded-full bg-emerald-100 items-center justify-center">
                <ShieldCheckIcon className="text-emerald-700" size={18} />
              </View>
              <Text className="text-sm text-muted-foreground flex-1">{listings.length} annonces actives, titres vérifiés</Text>
            </View>
            <View className="flex-row items-center gap-3">
              <View className="w-9 h-9 rounded-full bg-amber-100 items-center justify-center">
                <SmartphoneIcon className="text-amber-700" size={18} />
              </View>
              <Text className="text-sm text-muted-foreground flex-1">Paiement mobile accepté</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
