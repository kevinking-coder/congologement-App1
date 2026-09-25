import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeftIcon } from 'lucide-react-native';
import { cssInterop } from 'nativewind';

cssInterop(ArrowLeftIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });

export default function LegalScreen() {
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <View className="flex-row items-center px-4 py-3 border-b border-border">
        <Pressable onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
          <ArrowLeftIcon className="text-foreground" size={22} />
        </Pressable>
        <Text className="text-lg font-bold text-foreground flex-1 text-center -ml-10">Mentions légales</Text>
        <View className="w-10" />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 80 }} showsVerticalScrollIndicator={false}>
        <Text className="text-2xl font-bold text-foreground mb-4">Politique de confidentialité</Text>
        <Text className="text-sm text-foreground leading-6">
          Congo Logement collecte et traite les données suivantes afin de faire fonctionner sa
          place de marché immobilière :{'\n\n'}
          • Votre nom (ou raison sociale) ;{'\n'}
          • Votre numéro de téléphone ;{'\n'}
          • Votre adresse email ;{'\n'}
          • Les photos des biens que vous publiez.{'\n\n'}
          Ces informations sont utilisées exclusivement pour exploiter la plateforme : permettre aux
          acheteurs et locataires de contacter les vendeurs et bailleurs, afficher les annonces
          immobilières, et vous permettre de gérer vos propres annonces.{'\n\n'}
          Nous ne vendons pas vos données personnelles à des tiers. Vos données ne sont partagées
          qu'avec les autres utilisateurs de la plateforme dans la mesure nécessaire au bon
          fonctionnement du marché (par exemple, votre numéro de téléphone est affiché aux acheteurs
          potentiels de vos annonces).{'\n\n'}
          Vous pouvez demander l'accès, la modification ou la suppression de vos données à tout
          moment en nous contactant via les coordonnées indiquées sur la page « À propos ».
        </Text>

        <Text className="text-2xl font-bold text-foreground mt-8 mb-4">Conditions d'utilisation</Text>
        <Text className="text-sm text-foreground leading-6">
          En utilisant Congo Logement, vous acceptez les présentes conditions :{'\n\n'}
          1. Vous vous engagez à publier des informations exactes et à jour concernant les biens
          immobiliers que vous proposez.{'\n'}
          2. Vous êtes seul responsable du contenu de vos annonces, y compris de leur exactitude et
          de la légalité des biens proposés.{'\n'}
          3. Vous ne devez pas publier de contenus frauduleux, trompeurs, illicites ou portant
          atteinte aux droits de tiers.{'\n'}
          4. Congo Logement s'efforce de vérifier les titres de propriété des annonces signalées «
          Vérifié », mais ne garantit pas l'absence de tout risque lors d'une transaction.{'\n'}
          5. Nous vous recommandons de faire preuve de prudence et de vérifier vous-même les
          documents avant toute transaction.{'\n'}
          6. Congo Logement peut suspendre ou supprimer toute annonce qui enfreint ces conditions.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
