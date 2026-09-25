import { Pressable } from 'react-native';
import { HeartIcon } from 'lucide-react-native';
import { cssInterop } from 'nativewind';
import { router } from 'expo-router';
import { useFavorites } from '@/src/hooks/useFavorites';

cssInterop(HeartIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });

/**
 * Heart toggle shown on listing cards and the detail screen. Tapping while
 * signed out prompts to log in; otherwise it inserts/removes a favorite.
 */
export function FavoriteButton({ listingId, size = 22 }: { listingId: string; size?: number }) {
  const { isFavorite, toggle, isAuthenticated } = useFavorites();
  const active = isFavorite(listingId);

  const onPress = () => {
    if (!isAuthenticated) {
      router.push('/(auth)/sign-in');
      return;
    }
    if (!toggle.isPending) toggle.mutate(listingId);
  };

  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      className="w-9 h-9 rounded-full bg-black/45 items-center justify-center active:scale-95"
    >
      <HeartIcon
        className={active ? 'text-red-500' : 'text-white'}
        size={size}
        fill={active ? '#ef4444' : 'none'}
      />
    </Pressable>
  );
}
