import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Saved searches — device-local, re-run only (no push notifications).
 *
 * Each saved search stores the raw filter state as a JSON blob plus an
 * auto-generated human-readable label so it can be re-applied in Explorer.
 */

export interface SavedSearch {
  id: string;
  label: string;
  createdAt: number;
  filters: Record<string, unknown>;
}

const KEY = 'congologement:saved-searches';

export function makeLabel(filters: Record<string, unknown>): string {
  const parts: string[] = [];
  const category = filters.category as string | undefined;
  const province = filters.province as string | undefined;
  const commune = filters.commune as string | undefined;
  const propertyType = filters.propertyType as string | undefined;
  const maxPrice = filters.maxPrice as string | undefined;

  if (category) parts.push(category === 'buy' ? 'Acheter' : category === 'rent' ? 'Louer' : 'Hôtels');
  if (propertyType) parts.push(propertyType);
  if (commune) parts.push(commune);
  else if (province) parts.push(province);
  if (maxPrice) parts.push(`≤ ${maxPrice} USD`);

  return parts.length ? parts.join(' · ') : 'Recherche';
}

export async function loadSavedSearches(): Promise<SavedSearch[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SavedSearch[]) : [];
  } catch {
    return [];
  }
}

export async function saveSearch(filters: Record<string, unknown>): Promise<SavedSearch[]> {
  const list = await loadSavedSearches();
  const next: SavedSearch = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    label: makeLabel(filters),
    createdAt: Date.now(),
    filters,
  };
  const updated = [next, ...list].slice(0, 30);
  await AsyncStorage.setItem(KEY, JSON.stringify(updated));
  return updated;
}

export async function deleteSearch(id: string): Promise<SavedSearch[]> {
  const list = await loadSavedSearches();
  const updated = list.filter((s) => s.id !== id);
  await AsyncStorage.setItem(KEY, JSON.stringify(updated));
  return updated;
}
