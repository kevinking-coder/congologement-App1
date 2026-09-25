import { View, Text } from 'react-native';
import { ShieldCheckIcon, ClockIcon, AlertCircleIcon } from 'lucide-react-native';
import { cssInterop } from 'nativewind';
import { type Badge } from '@/src/lib/listing-utils';

cssInterop(ShieldCheckIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(ClockIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(AlertCircleIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });

const COLOR = {
  green: { text: 'text-emerald-700', bg: 'bg-emerald-100', ic: 'text-emerald-700' },
  amber: { text: 'text-amber-700', bg: 'bg-amber-100', ic: 'text-amber-700' },
  gray: { text: 'text-zinc-600', bg: 'bg-zinc-200', ic: 'text-zinc-600' },
} as const;

export function VerificationBadge({ badge }: { badge: Badge }) {
  const c = COLOR[badge.color];
  const Icon = badge.kind === 'verified' ? ShieldCheckIcon : badge.kind === 'partial' ? ClockIcon : AlertCircleIcon;
  return (
    <View className={`flex-row items-center gap-1 rounded-full px-2.5 py-1 ${c.bg}`}>
      <Icon className={c.ic} size={13} />
      <Text className={`text-[11px] font-semibold ${c.text}`}>{badge.label}</Text>
    </View>
  );
}
