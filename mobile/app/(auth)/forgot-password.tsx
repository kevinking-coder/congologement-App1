import { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { useApp } from '@/src/providers/AppProvider';

export default function ForgotPasswordScreen() {
  const { client } = useApp();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const ph = isDark ? '#8aa0b8' : '#9aa3b2';

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setStatus('idle');
    setMessage('');
    if (!email.trim()) {
      setStatus('error');
      setMessage('Veuillez saisir votre email.');
      return;
    }
    setBusy(true);
    try {
      const { error } = await client.auth.resetPasswordForEmail(email.trim());
      if (error) throw error;
      setStatus('sent');
      setMessage('Un lien de réinitialisation a été envoyé à votre adresse email.');
    } catch (e: any) {
      setStatus('error');
      setMessage("Impossible d'envoyer le lien. Vérifiez l'adresse email.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-background">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="flex-1 px-6 pt-8 pb-10 justify-center">
            <Text className="text-2xl font-bold text-foreground">Mot de passe oublié</Text>
            <Text className="text-muted-foreground text-sm mt-1 mb-6">
              Saisissez votre email et nous vous enverrons un lien de réinitialisation.
            </Text>

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

              {status === 'sent' && <Text className="text-emerald-700 text-sm">{message}</Text>}
              {status === 'error' && <Text className="text-destructive text-sm">{message}</Text>}

              <Pressable
                onPress={submit}
                disabled={busy}
                className="bg-primary rounded-xl py-4 items-center active:scale-[0.97] mt-2"
              >
                {busy ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-bold">Envoyer le lien</Text>
                )}
              </Pressable>

              <Pressable onPress={() => router.back()} className="items-center mt-2">
                <Text className="text-primary text-sm font-semibold">Retour à la connexion</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
