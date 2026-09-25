import { Tabs } from 'expo-router';
import { HomeIcon, SearchIcon, PlusCircleIcon, FolderIcon, UserIcon } from 'lucide-react-native';
import { cssInterop, useColorScheme } from 'nativewind';

cssInterop(HomeIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(SearchIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(PlusCircleIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(FolderIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(UserIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });

export default function TabsLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? '#0b1c32' : '#ffffff',
          borderTopColor: isDark ? '#1c3050' : '#e8e8e8',
        },
        tabBarActiveTintColor: '#b8860b',
        tabBarInactiveTintColor: isDark ? '#8aa0b8' : '#8a94a6',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ focused }) => <HomeIcon className={focused ? 'text-primary' : 'text-muted-foreground'} size={23} />,
        }}
      />
      <Tabs.Screen
        name="explorer"
        options={{
          title: 'Explorer',
          tabBarIcon: ({ focused }) => <SearchIcon className={focused ? 'text-primary' : 'text-muted-foreground'} size={23} />,
        }}
      />
      <Tabs.Screen
        name="publish"
        options={{
          title: 'Publier',
          tabBarIcon: ({ focused }) => (
            <PlusCircleIcon className={focused ? 'text-accent-foreground' : 'text-muted-foreground'} size={26} />
          ),
        }}
      />
      <Tabs.Screen
        name="mylistings"
        options={{
          title: 'Mes annonces',
          tabBarIcon: ({ focused }) => <FolderIcon className={focused ? 'text-primary' : 'text-muted-foreground'} size={23} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Compte',
          tabBarIcon: ({ focused }) => <UserIcon className={focused ? 'text-primary' : 'text-muted-foreground'} size={23} />,
        }}
      />
    </Tabs>
  );
}
