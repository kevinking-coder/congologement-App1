import { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useColorScheme } from 'nativewind';
import {
  UserIcon,
  PhoneIcon,
  SaveIcon,
  LogOutIcon,
  ShieldCheckIcon,
  ChevronRightIcon,
  FolderIcon,
  HeartIcon,
  SearchIcon,
} from 'lucide-react-native';
import { cssInterop } from 'nativewind';
import { useApp } from '@/src/providers/AppProvider';
import { useAuth } from '@/src/hooks';
import { type Profile } from '@/src/db/types';
import { isValidDrcPhone } from '@/src/lib/phone';

cssInterop(UserIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(PhoneIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(SaveIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(LogOutIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(ShieldCheckIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(ChevronRightIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(FolderIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(HeartIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(SearchIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });

export default function AccountScreen() {
  const { client } = useApp();
  const { user, isAuthenticated, isLoading: authLoading, signOut } = useAuth();
  const queryClient = useQueryClient();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const ph = isDark ? '#8aa0b8' : '#9aa3b2';

  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await client.from('profiles').select('*').eq('id', user!.id).maybeSingle();
      if (error && error.code !== 'PGRST116') throw error;
      return (data ?? null) as Profile | null;
    },
    enabled: !!user,
  });

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await client.from('profiles').upsert({
        id: user!.id,
        full_name: nom.trim(),
        phone: telephone.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
    onError: () => setError("Échec de l'enregistrement. Réessayez."),
  });

  // Pre-fill the form when the profile loads and we are not editing.
  const startEdit = () => {
    setNom(profile?.full_name ?? '');
    setTelephone(profile?.phone ?? '');
    setError('');
    setEditing(true);
  };

  const doSave = () => {
    setError('');
    if (!nom.trim()) {
      setError('Le nom est obligatoire.');
      return;
    }
    if (telephone.trim() && !isValidDrcPhone(telephone)) {
      setError('Numéro DRC invalide. Format : +243 suivi de 9 chiffres.');
      return;
    }
    save.mutate();
  };

  const doLogout = async () => {
    await signOut.mutateAsync();
    router.replace('/(auth)/sign-in');
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View className="px-5 pt-3 pb-4">
            <Text className="text-2xl font-bold text-foreground tracking-tight">Compte</Text>
          </View>

          {authLoading || (isAuthenticated && profileLoading) ? (
            <ActivityIndicator color={isDark ? '#b8860b' : '#0e7490'} className="mt-10" />
          ) : !isAuthenticated ? (
            <View className="items-center justify-center px-8 pt-16">
              <View className="w-16 h-16 rounded-full bg-muted items-center justify-center mb-4">
                <UserIcon className="text-muted-foreground" size={30} />
              </View>
              <Text className="text-foreground text-lg font-semibold text-center">Connectez-vous</Text>
              <Text className="text-muted-foreground text-sm text-center mt-2">
                Accédez à votre profil, vos annonces et vos réglages.
              </Text>
              <Pressable onPress={() => router.push('/(auth)/sign-in')} className="mt-6 bg-primary rounded-xl px-8 py-3.5">
                <Text className="text-white font-semibold">Se connecter</Text>
              </Pressable>
              <Pressable onPress={() => router.push('/(auth)/sign-up')} className="mt-3 rounded-xl px-8 py-3.5 border border-border">
                <Text className="text-foreground font-semibold">Créer un compte</Text>
              </Pressable>
            </View>
          ) : (
            <View className="px-5 gap-4">
              {/* Profile card */}
              <View className="bg-card rounded-2xl p-4 border border-border">
                <View className="flex-row items-center gap-3 mb-1">
                  <View className="w-12 h-12 rounded-full bg-primary items-center justify-center">
                    <Text className="text-white font-bold text-lg">
                      {(profile?.full_name || user?.email || '?').slice(0, 1).toUpperCase()}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground">{profile?.full_name || 'Utilisateur'}</Text>
                    <Text className="text-xs text-muted-foreground">{user?.email}</Text>
                  </View>
                </View>

                {editing ? (
                  <View className="gap-3 mt-4">
                    <View className="gap-1.5">
                      <Text className="text-sm font-semibold text-foreground">Nom</Text>
                      <TextInput
                        value={nom}
                        onChangeText={setNom}
                        placeholder="Votre nom"
                        placeholderTextColor={ph}
                        className="bg-muted rounded-xl px-4 py-3 text-foreground"
                      />
                    </View>
                    <View className="gap-1.5">
                      <Text className="text-sm font-semibold text-foreground">Téléphone</Text>
                      <TextInput
                        value={telephone}
                        onChangeText={setTelephone}
                        placeholder="+243 8XX XXX XXX"
                        placeholderTextColor={ph}
                        keyboardType="phone-pad"
                        className="bg-muted rounded-xl px-4 py-3 text-foreground"
                      />
                    </View>
                    {error ? <Text className="text-destructive text-sm">{error}</Text> : null}
                    <View className="flex-row gap-2">
                      <Pressable
                        onPress={doSave}
                        disabled={save.isPending}
                        className="flex-1 bg-accent rounded-xl py-3 items-center flex-row justify-center gap-2"
                      >
                        {save.isPending ? (
                          <ActivityIndicator color="#1c2a3a" />
                        ) : (
                          <>
                            <SaveIcon className="text-accent-foreground" size={16} />
                            <Text className="text-accent-foreground font-semibold">Enregistrer</Text>
                          </>
                        )}
                      </Pressable>
                      <Pressable onPress={() => setEditing(false)} className="flex-1 rounded-xl py-3 items-center border border-border">
                        <Text className="text-foreground font-medium">Annuler</Text>
                      </Pressable>
                    </View>
                  </View>
                ) : (
                  <View className="mt-4 gap-2">
                    <View className="flex-row items-center gap-2">
                      <PhoneIcon className="text-muted-foreground" size={15} />
                      <Text className="text-sm text-muted-foreground">{profile?.phone || 'Téléphone non renseigné'}</Text>
                    </View>
                    {saved && <Text className="text-emerald-700 text-sm">Modifications enregistrées.</Text>}
                    <Pressable onPress={startEdit} className="mt-1 self-start bg-muted rounded-lg px-4 py-2">
                      <Text className="text-primary text-sm font-semibold">Modifier le profil</Text>
                    </Pressable>
                  </View>
                )}
              </View>

              {/* Links */}
              <View className="bg-card rounded-2xl border border-border overflow-hidden">
                <LinkRow icon={FolderIcon} label="Mes annonces" onPress={() => router.push('/mylistings')} />
                <Divider />
                <LinkRow icon={HeartIcon} label="Mes favoris" onPress={() => router.push('/favorites')} />
                <Divider />
                <LinkRow icon={SearchIcon} label="Mes recherches sauvegardées" onPress={() => router.push('/saved-searches')} />
                <Divider />
                <LinkRow icon={ShieldCheckIcon} label="Politique de confidentialité & Conditions" onPress={() => router.push('/legal')} />
              </View>

              <Pressable
                onPress={doLogout}
                className="flex-row items-center justify-center gap-2 rounded-xl py-4 border border-destructive"
              >
                <LogOutIcon className="text-destructive" size={18} />
                <Text className="text-destructive font-semibold">Se déconnecter</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function LinkRow({ icon: Icon, label, onPress }: { icon: any; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center gap-3 px-4 py-4 active:bg-muted">
      <Icon className="text-primary" size={20} />
      <Text className="flex-1 text-foreground font-medium">{label}</Text>
      <ChevronRightIcon className="text-muted-foreground" size={18} />
    </Pressable>
  );
}

function Divider() {
  return <View className="h-px bg-border" />;
}
