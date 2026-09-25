import { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeftIcon, SearchIcon, Trash2Icon } from 'lucide-react-native';
import { cssInterop } from 'nativewind';
import { loadSavedSearches, deleteSearch, type SavedSearch } from '@/src/lib/saved-searches';

cssInterop(ArrowLeftIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(SearchIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(Trash2Icon, { className: { target: 'style', nativeStyleToProp: { color: true } } });

export default function SavedSearchesScreen() {
  const [items, setItems] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const list = await loadSavedSearches();
    setItems(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const onDelete = (s: SavedSearch) => {
    const doDelete = async () => {
      await deleteSearch(s.id);
      refresh();
    };
    if (typeof window !== 'undefined') {
      if (window.confirm('Supprimer cette recherche sauvegardée ?')) doDelete();
    } else {
      Alert.alert('Supprimer', 'Supprimer cette recherche sauvegardée ?', [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  const apply = (s: SavedSearch) => {
    router.push({ pathname: '/explorer', params: { saved: JSON.stringify(s.filters) } });
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <View className="flex-row items-center gap-3 px-5 pt-3 pb-4">
        <Pressable onPress={() => router.back()} className="p-1 -ml-1">
          <ArrowLeftIcon className="text-foreground" size={24} />
        </Pressable>
        <Text className="text-2xl font-bold text-foreground tracking-tight">Mes recherches sauvegardées</Text>
      </View>

      {loading ? (
        <ActivityIndicator className="mt-10" color="#0e7490" />
      ) : items.length === 0 ? (
        <View className="items-center justify-center px-8 pt-16">
          <View className="w-16 h-16 rounded-full bg-muted items-center justify-center mb-4">
            <SearchIcon className="text-muted-foreground" size={28} />
          </View>
          <Text className="text-foreground text-lg font-semibold">Aucune recherche sauvegardée</Text>
          <Text className="text-muted-foreground text-sm text-center mt-2">
            Sur l'écran Explorer, activez vos filtres puis appuyez sur « Sauvegarder cette recherche ».
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, gap: 10 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View className="bg-card rounded-2xl border border-border overflow-hidden">
              <Pressable onPress={() => apply(item)} className="p-4 flex-row items-center gap-3 active:bg-muted">
                <SearchIcon className="text-primary" size={18} />
                <View className="flex-1">
                  <Text className="text-foreground font-semibold">{item.label}</Text>
                  <Text className="text-muted-foreground text-xs mt-0.5">
                    {new Date(item.createdAt).toLocaleDateString('fr-FR')}
                  </Text>
                </View>
              </Pressable>
              <Pressable
                onPress={() => onDelete(item)}
                className="border-t border-border flex-row items-center justify-center gap-2 py-2.5"
              >
                <Trash2Icon className="text-destructive" size={15} />
                <Text className="text-destructive text-sm font-medium">Supprimer</Text>
              </Pressable>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
