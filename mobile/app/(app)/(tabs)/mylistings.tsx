import { View, Text, ScrollView, Pressable, Image, Alert, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { PencilIcon, Trash2Icon, PlusIcon } from 'lucide-react-native';
import { cssInterop, useColorScheme } from 'nativewind';
import { useApp } from '@/src/providers/AppProvider';
import { useAuth } from '@/src/hooks';
import { type Listing } from '@/src/db/types';
import { featuredPhoto, formatPrice, getBadge, CATEGORY_LABELS } from '@/src/lib/listing-utils';
import { useCurrency } from '@/src/lib/currency-context';
import { VerificationBadge } from '@/src/components/VerificationBadge';

cssInterop(PencilIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(Trash2Icon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(PlusIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });

export default function MyListingsScreen() {
  const { client } = useApp();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { currency } = useCurrency();
  const queryClient = useQueryClient();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { data: mine = [], isLoading } = useQuery({
    queryKey: ['listings', 'mine', user?.id],
    queryFn: async () => {
      const { data, error } = await client.from('listings').select('*').eq('user_id', user!.id).order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Listing[];
    },
    enabled: !!user,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await client.from('listings').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['listings'] }),
  });

  const confirmDelete = (id: string) => {
    const message = 'Êtes-vous sûr de vouloir supprimer cette annonce ?';
    if (Platform.OS === 'web') {
      if (window.confirm(message)) remove.mutate(id);
    } else {
      Alert.alert('Supprimer', message, [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => remove.mutate(id) },
      ]);
    }
  };

  if (authLoading) {
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
          <Text className="text-xl font-bold text-foreground text-center">Connectez-vous</Text>
          {!isDesigner && (
            <Pressable onPress={() => router.push('/(auth)/sign-in')} className="mt-5 bg-primary rounded-xl px-6 py-3.5">
              <Text className="text-white font-semibold">Se connecter</Text>
            </Pressable>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <View className="px-5 pt-3 pb-4 flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-foreground tracking-tight">Mes annonces</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <ActivityIndicator color={isDark ? '#b8860b' : '#0e7490'} className="mt-10" />
        ) : mine.length === 0 ? (
          <View className="items-center justify-center py-16 px-6">
            <View className="w-16 h-16 rounded-full bg-muted items-center justify-center mb-4">
              <PlusIcon className="text-muted-foreground" size={28} />
            </View>
            <Text className="text-foreground text-lg font-semibold">Aucune annonce</Text>
            <Text className="text-muted-foreground text-sm text-center mt-2">
              Publiez votre première annonce pour toucher des milliers de personnes à Kinshasa.
            </Text>
            <Pressable onPress={() => router.push('/publish')} className="mt-5 bg-accent rounded-xl px-6 py-3.5 active:scale-[0.97]">
              <Text className="text-accent-foreground font-bold">Publier une annonce</Text>
            </Pressable>
          </View>
        ) : (
          <View className="gap-4">
            {mine.map((l) => {
              const img = featuredPhoto(l);
              const price = l.category === 'hotel' && l.price_per_night_usd
                ? `${formatPrice(l.price_per_night_usd, currency)} / nuit`
                : formatPrice(l.prix_usd, currency);
              return (
                <View key={l.id} className="bg-card rounded-2xl overflow-hidden shadow-hard-5">
                  <Pressable onPress={() => router.push(`/listing/${l.id}`)}>
                    {img ? (
                      <Image source={{ uri: img }} style={{ width: '100%', height: 140 }} />
                    ) : (
                      <View className="w-full bg-muted items-center justify-center" style={{ height: 140 }}>
                        <Text className="text-muted-foreground text-sm">Aucune photo</Text>
                      </View>
                    )}
                    <View className="p-4 gap-2">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-xs font-semibold text-primary uppercase">{CATEGORY_LABELS[l.category]}</Text>
                        <VerificationBadge badge={getBadge(l)} />
                      </View>
                      <Text className="text-base font-semibold text-foreground" numberOfLines={2}>{l.titre}</Text>
                      <Text className="text-lg font-bold text-foreground">{price}</Text>
                    </View>
                  </Pressable>
                  <View className="flex-row border-t border-border">
                    <Pressable
                      onPress={() => router.push(`/publish?edit=${l.id}`)}
                      className="flex-1 flex-row items-center justify-center gap-2 py-3"
                    >
                      <PencilIcon className="text-primary" size={16} />
                      <Text className="text-primary font-medium">Modifier</Text>
                    </Pressable>
                    <View className="w-px bg-border" />
                    <Pressable onPress={() => confirmDelete(l.id)} className="flex-1 flex-row items-center justify-center gap-2 py-3">
                      <Trash2Icon className="text-destructive" size={16} />
                      <Text className="text-destructive font-medium">Supprimer</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
