import { Ionicons } from '@expo/vector-icons'; // Expo ile hazır gelir
import { BlurView } from 'expo-blur'; // npx expo install expo-blur
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

export default function TabsLayout() {
    const { t } = useTranslation();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: true,
                tabBarActiveTintColor: '#dc2626', // primary (red-600)
                tabBarInactiveTintColor: '#64748b', // slate-500
                tabBarStyle: {
                    position: 'absolute',
                    borderTopWidth: 0,
                    elevation: 0,
                    height: Platform.OS === 'ios' ? 88 : 64,
                    backgroundColor: Platform.OS === 'ios' ? 'transparent' : '#020617',
                },
                tabBarBackground: () =>
                    Platform.OS === 'ios' ? (
                        <BlurView intensity={80} tint="dark" className="flex-1" />
                    ) : null,
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                    marginBottom: Platform.OS === 'ios' ? 0 : 10,
                },
            }}
        >
            {/* 1. ANA SAYFA (KEŞFET) */}
            <Tabs.Screen
                name="index"
                options={{
                    title: t('home_tab', 'Keşfet'),
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'film' : 'film-outline'} size={24} color={color} />
                    ),
                }}
            />

            {/* 2. ARAMA */}
            <Tabs.Screen
                name="search"
                options={{
                    title: t('search_tab', 'Ara'),
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'search' : 'search-outline'} size={24} color={color} />
                    ),
                }}
            />

            {/* 3. PROFİL & AYARLAR */}
            <Tabs.Screen
                name="profile"
                options={{
                    title: t('profile_tab', 'Profil'),
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}