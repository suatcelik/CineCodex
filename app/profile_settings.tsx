import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../src/context/AuthContext';
import { useStore } from '../src/store/useStore';

export default function ProfileSettingsScreen() {
    const { user, signOut, isPremium } = useAuth();
    const { language, setLanguage } = useStore();
    const { t } = useTranslation();
    const router = useRouter();

    const handleSignOut = () => {
        Alert.alert(
            t('settings.logout_title') || "Çıkış Yap",
            t('settings.logout_confirm') || "Hesabınızdan çıkış yapmak istediğinize emin misiniz?",
            [
                { text: t('cancel'), style: 'cancel' },
                { text: t('logout'), style: 'destructive', onPress: () => signOut() }
            ]
        );
    };

    const SettingItem = ({ icon, title, value, onPress, color = "#94a3b8", isLast = false }: any) => (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            className={`flex-row items-center justify-between py-4 ${!isLast ? 'border-b border-slate-800/50' : ''}`}
        >
            <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-2xl bg-slate-800/50 items-center justify-center mr-4">
                    <Ionicons name={icon} size={20} color={color} />
                </View>
                <Text className="text-slate-200 font-semibold text-base">{title}</Text>
            </View>
            <View className="flex-row items-center">
                {value && <Text className="text-slate-500 mr-2">{value}</Text>}
                <Ionicons name="chevron-forward" size={18} color="#475569" />
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-background">
            {/* Header */}
            <View className="px-6 py-4 flex-row items-center">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 rounded-full bg-slate-800 items-center justify-center mr-4"
                >
                    <Ionicons name="arrow-back" size={20} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-2xl font-black">{t('Ayarlar')}</Text>
            </View>

            <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>

                {/* 1. Hesap Kartı */}
                <View className="bg-surface border border-slate-800 rounded-[32px] p-6 mb-8 mt-4">
                    <View className="flex-row items-center mb-6">
                        <View className="w-16 h-16 rounded-full bg-primary items-center justify-center">
                            <Text className="text-white text-2xl font-black">
                                {user?.email?.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                        <View className="ml-4">
                            <Text className="text-white font-bold text-lg" numberOfLines={1}>
                                {user?.email?.split('@')[0]}
                            </Text>
                            <Text className="text-slate-500 text-xs">{user?.email}</Text>
                        </View>
                    </View>

                    {!isPremium && (
                        <TouchableOpacity
                            onPress={() => router.push('/premium')}
                            className="bg-primary py-4 rounded-2xl items-center"
                        >
                            <Text className="text-white font-black uppercase tracking-widest text-xs">
                                Pro'ya Yükselt ✨
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* 2. Uygulama Ayarları */}
                <Text className="text-slate-500 font-bold mb-4 ml-2 uppercase tracking-widest text-[10px]">Uygulama</Text>
                <View className="bg-surface border border-slate-800 rounded-[32px] px-6 mb-8">
                    <SettingItem
                        icon="language-outline"
                        title="Dil / Language"
                        value={language === 'tr' ? 'Türkçe' : 'English'}
                        onPress={() => setLanguage(language === 'tr' ? 'en' : 'tr')}
                    />
                    <SettingItem
                        icon="notifications-outline"
                        title="Bildirimler"
                        onPress={() => { }}
                    />
                    <SettingItem
                        icon="color-palette-outline"
                        title="Tema"
                        value="Koyu"
                        isLast={true}
                    />
                </View>

                {/* 3. Destek & Bilgi */}
                <Text className="text-slate-500 font-bold mb-4 ml-2 uppercase tracking-widest text-[10px]">Destek</Text>
                <View className="bg-surface border border-slate-800 rounded-[32px] px-6 mb-8">
                    <SettingItem
                        icon="star-outline"
                        title="Uygulamayı Puanla"
                        onPress={() => { }}
                    />
                    <SettingItem
                        icon="shield-checkmark-outline"
                        title="Gizlilik Politikası"
                        onPress={() => { }}
                    />
                    <SettingItem
                        icon="information-circle-outline"
                        title="Hakkında"
                        isLast={true}
                        onPress={() => { }}
                    />
                </View>

                {/* 4. Çıkış Butonu */}
                <TouchableOpacity
                    onPress={handleSignOut}
                    className="flex-row items-center justify-center py-6 mb-20"
                >
                    <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                    <Text className="text-red-500 font-bold ml-2 text-base">Çıkış Yap</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}