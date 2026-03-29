import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, useColorScheme, View } from 'react-native';
import "../global.css";
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import i18n from '../src/lib/i18n';
import { useStore } from '../src/store/useStore';

// 1. Navigasyon Mantığını Yöneten Alt Bileşen
function RootLayoutNav() {
    const { user, loading: authLoading } = useAuth();
    const { hasOnboarded, language } = useStore();
    const segments = useSegments();
    const router = useRouter();
    const colorScheme = useColorScheme();

    // Dil Değişimini Takip Et
    useEffect(() => {
        if (language) {
            i18n.changeLanguage(language);
        }
    }, [language]);

    // Yönlendirme Mantığı (Auth & Onboarding Kontrolü)
    useEffect(() => {
        if (authLoading) return;

        const inAuthGroup = segments[0] === '(tabs)' || segments[0] === 'movie';

        if (!hasOnboarded && segments[0] !== 'onboarding') {
            // Kullanıcı onboarding yapmadıysa oraya gönder
            router.replace('/onboarding');
        } else if (hasOnboarded && !user && inAuthGroup) {
            // Onboarding tamam ama giriş yapılmamışsa login'e gönder (İsteğe bağlı)
            // router.replace('/auth/login'); 
        } else if (hasOnboarded && user && segments[0] === 'onboarding') {
            // Giriş yapmış kullanıcıyı onboarding'den ana sayfaya at
            router.replace('/(tabs)');
        }
    }, [user, hasOnboarded, authLoading, segments]);

    if (authLoading) {
        return (
            <View className="flex-1 bg-background justify-center items-center">
                <ActivityIndicator size="large" color="#dc2626" />
            </View>
        );
    }

    return (
        <Stack screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colorScheme === 'dark' ? '#020617' : '#f8fafc' },
            animation: 'slide_from_right'
        }}>
            <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
            <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
            <Stack.Screen name="movie/[id]" options={{ presentation: 'card' }} />
            <Stack.Screen name="premium" options={{ presentation: 'modal' }} />
        </Stack>
    );
}

// 2. Ana Sağlayıcı (Provider) Sarmalayıcı
export default function RootLayout() {
    return (
        <AuthProvider>
            <StatusBar style="light" />
            <RootLayoutNav />
        </AuthProvider>
    );
}