import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, SafeAreaView, ScrollView, Share, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import i18n from '../../src/lib/i18n';
import { supabase } from '../../src/lib/supabase';
import { useStore } from '../../src/store/useStore';

export default function SettingsScreen() {
    const { profile } = useAuth();
    const { language, setLanguage, setHasOnboarded } = useStore();
    const { t } = useTranslation();
    const router = useRouter();

    const toggleLanguage = () => {
        const newLang = language === 'tr' ? 'en' : 'tr';
        i18n.changeLanguage(newLang);
        setLanguage(newLang);
    };

    const onShareTimeline = async () => {
        try {
            await Share.share({
                message: `${profile?.username || 'SineNot'} ${t('share_message', 'kullanıcısının film günlüğüne göz at!')}`,
            });
        } catch (error) {
            console.log(error);
        }
    };

    const handleLogout = async () => {
        Alert.alert(t('logout'), t('logout_confirm'), [
            { text: t('cancel'), style: 'cancel' },
            {
                text: t('logout'),
                style: 'destructive',
                onPress: async () => {
                    await supabase.auth.signOut();
                    setHasOnboarded(false); // Opsiyonel: Çıkışta onboarding'e geri döner
                    router.replace('/onboarding');
                }
            },
        ]);
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            <ScrollView className="flex-1 px-6 pt-6">
                <Text className="text-white text-4xl font-black mb-10">{t('settings')}</Text>

                {/* Uygulama Tercihleri */}
                <View className="bg-surface rounded-[32px] border border-slate-800 mb-6 overflow-hidden">
                    <TouchableOpacity
                        onPress={toggleLanguage}
                        activeOpacity={0.7}
                        className="p-6 flex-row items-center justify-between border-b border-slate-800"
                    >
                        <Text className="text-slate-300 font-bold text-base">{t('language')}</Text>
                        <View className="bg-slate-800 px-4 py-2 rounded-xl">
                            <Text className="text-white font-bold">{language === 'tr' ? 'Türkçe 🇹🇷' : 'English 🇺🇸'}</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={onShareTimeline}
                        className="p-6 flex-row items-center justify-between"
                    >
                        <Text className="text-white font-bold text-base">{t('share_timeline')}</Text>
                        <Text className="text-primary text-xl">🔗</Text>
                    </TouchableOpacity>
                </View>

                {/* Üyelik ve Hesap */}
                <View className="bg-surface rounded-[32px] border border-slate-800 mb-10 overflow-hidden">
                    <TouchableOpacity
                        onPress={() => router.push('/premium')}
                        className="p-6 flex-row items-center justify-between border-b border-slate-800"
                    >
                        <View>
                            <Text className="text-accent font-black text-lg italic">Premium</Text>
                            <Text className="text-slate-500 text-xs mt-1">{t('premium_desc', 'Sınırsız not ve analizler')}</Text>
                        </View>
                        <Text className="text-accent text-2xl">💎</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleLogout}
                        className="p-6 flex-row items-center justify-between"
                    >
                        <Text className="text-red-500 font-bold text-base">{t('logout')}</Text>
                        <Text className="text-red-500 text-xl">🚪</Text>
                    </TouchableOpacity>
                </View>

                <View className="items-center py-10">
                    <Text className="text-slate-700 font-bold tracking-[6px] text-[10px] uppercase">SineNot v1.0</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}