import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import i18n from '../src/lib/i18n';
import { useStore } from '../src/store/useStore';

export default function OnboardingScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { setHasOnboarded, language, setLanguage } = useStore();

    const handleLanguageChange = (lang: 'tr' | 'en') => {
        i18n.changeLanguage(lang); // i18next metinlerini anlık çevirir
        setLanguage(lang);         // Zustand ile cihaz hafızasına kalıcı kaydeder
    };

    const handleFinish = () => {
        setHasOnboarded(true); // Bir daha onboarding görünmesin
        router.replace('/(tabs)'); // Ana sayfaya uçuş
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            <LinearGradient
                colors={['rgba(220, 38, 38, 0.2)', 'transparent']}
                className="flex-1 px-8 justify-between py-16"
            >
                <View className="mt-10">
                    <Text className="text-primary text-6xl font-black tracking-tighter">CineCodex</Text>
                    <Text className="text-white text-3xl font-bold mt-4 leading-tight">
                        {language === 'tr' ? 'Hoş Geldin' : 'Welcome'}
                    </Text>
                    <Text className="text-slate-400 text-lg mt-2">
                        {language === 'tr'
                            ? 'Kişisel film günlüğünü tutmaya hazır mısın?'
                            : 'Ready to keep your personal movie journal?'}
                    </Text>
                </View>

                <View>
                    <Text className="text-slate-500 font-bold mb-4 uppercase tracking-widest text-xs ml-1">
                        {language === 'tr' ? 'DİL SEÇİN' : 'SELECT LANGUAGE'}
                    </Text>
                    <View className="flex-row gap-x-4">
                        {(['tr', 'en'] as const).map((lang) => (
                            <TouchableOpacity
                                key={lang}
                                onPress={() => handleLanguageChange(lang)}
                                activeOpacity={0.8}
                                className={`flex-1 py-5 rounded-3xl border-2 items-center justify-center ${language === lang
                                    ? 'border-primary bg-primary/10'
                                    : 'border-slate-800 bg-surface'
                                    }`}
                            >
                                <Text className={`font-bold text-lg ${language === lang ? 'text-white' : 'text-slate-400'}`}>
                                    {lang === 'tr' ? 'Türkçe 🇹🇷' : 'English 🇺🇸'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <TouchableOpacity
                    onPress={handleFinish}
                    activeOpacity={0.9}
                    className="bg-white py-5 rounded-full shadow-2xl shadow-white/10"
                >
                    <Text className="text-black text-center font-black text-xl">
                        {language === 'tr' ? 'Hadi Başlayalım!' : "Let's Start!"}
                    </Text>
                </TouchableOpacity>
            </LinearGradient>
        </SafeAreaView>
    );
}