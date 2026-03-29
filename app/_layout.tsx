import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import "../global.css";
import Loader from '../src/components/Loader';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import i18n from '../src/lib/i18n';
import { useStore } from '../src/store/useStore';

function RootLayoutNav() {
    const { user, loading: authLoading } = useAuth();
    const { hasOnboarded, language } = useStore();
    const segments = useSegments();
    const router = useRouter();
    const colorScheme = useColorScheme();

    // 1. Dil Değişimini Takip Et
    useEffect(() => {
        if (language) {
            i18n.changeLanguage(language);
        }
    }, [language]);

    // 2. Gelişmiş Yönlendirme Mantığı (Auth + Onboarding)
    useEffect(() => {
        if (authLoading) return;

        const inAuthGroup = segments[0] === 'auth';
        const inOnboardingGroup = segments[0] === 'onboarding';
        const inTabsGroup = segments[0] === '(tabs)';

        // Durum A: Kullanıcı ilk kez geliyorsa Onboarding'e gönder
        if (!hasOnboarded && !inOnboardingGroup) {
            router.replace('/onboarding');
            return;
        }

        // Durum B: Giriş yapmamış kullanıcıyı Login'e çek (Onboarding bittiyse)
        if (hasOnboarded && !user && !inAuthGroup) {
            router.replace('/auth/login');
            return;
        }

        // Durum C: Giriş yapmış kullanıcıyı Login veya Onboarding'den içeri al
        if (user && (inAuthGroup || inOnboardingGroup)) {
            router.replace('/(tabs)');
            return;
        }
    }, [user, hasOnboarded, authLoading, segments]);

    // Yükleme sırasında Loader göster
    if (authLoading) {
        return <Loader fullScreen message="SineNot Hazırlanıyor..." />;
    }

    return (
        <Stack screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colorScheme === 'dark' ? '#020617' : '#f8fafc' },
            animation: 'fade' // Sayfa geçişleri daha yumuşak olur
        }}>
            {/* Gruplandırılmış Sayfalar */}
            <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
            <Stack.Screen name="auth/login" options={{ presentation: 'formSheet' }} />
            <Stack.Screen name="auth/register" options={{ presentation: 'card' }} />
            <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />

            {/* Dinamik ve Modal Sayfalar */}
            <Stack.Screen name="movie/[id]" options={{ presentation: 'card', animation: 'slide_from_right' }} />
            <Stack.Screen name="premium" options={{ presentation: 'modal' }} />
            <Stack.Screen name="profile_settings" options={{ presentation: 'card', headerTitle: 'Ayarlar', headerShown: false }} />
        </Stack>
    );
}

// Ana Sağlayıcı (Provider) Sarmalayıcı
export default function RootLayout() {
    return (
        <AuthProvider>
            <StatusBar style="light" />
            <RootLayoutNav />
        </AuthProvider>
    );
}