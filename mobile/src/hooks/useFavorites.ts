import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApp } from '@/src/providers/AppProvider';
import { useAuth } from '@/src/hooks';
import { type Favorite } from '@/src/db/types';
import { newId } from '@/src/lib/id';

/**
 * Central favorites hook — the single write path for favorite/unfavorite.
 * Returns the user's favorite ids plus a toggle that inserts/removes rows.
 */
export function useFavorites() {
  const { client } = useApp();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const uid = user?.id ?? null;

  const { data = [] } = useQuery({
    queryKey: ['favorites', uid],
    queryFn: async () => {
      if (!uid) return [] as Favorite[];
      const { data, error } = await client
        .from('favorites')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Favorite[];
    },
    enabled: !!uid,
  });

  const favoriteIds = new Set(data.map((f) => f.listing_id));
  const isFavorite = (listingId: string) => favoriteIds.has(listingId);

  const toggle = useMutation({
    mutationFn: async (listingId: string) => {
      if (!uid) throw new Error('not-authenticated');
      if (isFavorite(listingId)) {
        const { error } = await client
          .from('favorites')
          .delete()
          .eq('user_id', uid)
          .eq('listing_id', listingId);
        if (error) throw error;
      } else {
        const { error } = await client.from('favorites').insert({
          id: newId(),
          listing_id: listingId,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', uid] });
    },
  });

  return { favoriteIds, isFavorite, toggle, isAuthenticated };
}
