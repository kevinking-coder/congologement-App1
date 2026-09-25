import { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { useAuth } from '@/src/hooks';

export default function SignInScreen() {
  const { signIn } = useAuth();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const ph = isDark ? '#8aa0b8' : '#9aa3b2';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError('');
    if (!email.trim() || !password) {
      setError('Veuillez saisir votre email et votre mot de passe.');
      return;
    }
    setBusy(true);
    try {
      await signIn.mutateAsync({ email: email.trim(), password });
      // On success the inverse guard in (auth)/_layout redirects to the app.
    } catch (e: any) {
      setError('Email ou mot de passe incorrect.');
      setBusy(false);
    }
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-background">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="flex-1 px-6 pt-8 pb-10 justify-center">
            <View className="mb-8">
              <Text className="text-3xl font-bold text-foreground tracking-tight">Congo Logement</Text>
              <Text className="text-[10px] font-bold text-muted-foreground tracking-[0.3em] mt-0.5">PROPERTY 243</Text>
            </View>

            <Text className="text-2xl font-bold text-foreground">Connexion</Text>
            <Text className="text-muted-foreground text-sm mt-1 mb-6">Accédez à votre compte pour gérer vos annonces.</Text>

            <View className="gap-4">
              <View className="gap-1.5">
                <Text className="text-sm font-semibold text-foreground">Email</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="vous@exemple.com"
                  placeholderTextColor={ph}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  className="bg-card border border-border rounded-xl px-4 py-3 text-foreground"
                />
              </View>

              <View className="gap-1.5">
                <Text className="text-sm font-semibold text-foreground">Mot de passe</Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={ph}
                  secureTextEntry
                  className="bg-card border border-border rounded-xl px-4 py-3 text-foreground"
                />
              </View>

              <Pressable onPress={() => router.push('/(auth)/forgot-password')}>
                <Text className="text-primary text-sm font-semibold">Mot de passe oublié ?</Text>
              </Pressable>

              {error ? <Text className="text-destructive text-sm">{error}</Text> : null}

              <Pressable
                onPress={submit}
                disabled={busy}
                className="bg-accent rounded-xl py-4 items-center active:scale-[0.97] mt-2"
              >
                {busy ? (
                  <ActivityIndicator color="#1c2a3a" />
                ) : (
                  <Text className="text-accent-foreground font-bold">Se connecter</Text>
                )}
              </Pressable>

              <View className="flex-row items-center justify-center gap-1 mt-2">
                <Text className="text-muted-foreground text-sm">Pas encore de compte ?</Text>
                <Pressable onPress={() => router.push('/(auth)/sign-up')}>
                  <Text className="text-primary text-sm font-semibold">S'inscrire</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
