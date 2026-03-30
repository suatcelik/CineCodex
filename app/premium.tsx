import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Purchases, { PurchasesPackage } from 'react-native-purchases'; // RevenueCat eklendi
import { SafeAreaView } from 'react-native-safe-area-context';
import Loader from '../src/components/Loader';
import { useAuth } from '../src/context/AuthContext';

export default function PremiumScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const { isPremium } = useAuth();
    const [loading, setLoading] = useState(false);
    const [currentPackage, setCurrentPackage] = useState<PurchasesPackage | null>(null);

    // Sayfa açıldığında RevenueCat paketlerini yükle
    useEffect(() => {
        loadOfferings();
    }, []);

    const loadOfferings = async () => {
        try {
            const offerings = await Purchases.getOfferings();
            if (offerings.current !== null && offerings.current.availablePackages.length > 0) {
                // Dashboard'da 'annual' (yıllık) paketini arar, bulamazsa ilkini seçer
                const annual = offerings.current.availablePackages.find(p => p.identifier === '$rc_annual') || offerings.current.availablePackages[0];
                setCurrentPackage(annual);
            }
        } catch (e) {
            console.log("Teklifler yüklenemedi:", e);
        }
    };

    const handlePurchase = async () => {
        if (!currentPackage) {
            Alert.alert("Hata", "Satın alınabilir paket bulunamadı.");
            return;
        }

        setLoading(true);
        try {
            const { customerInfo } = await Purchases.purchasePackage(currentPackage);

            // Dashboard'da Entitlement ID 'pro' ise kontrol et
            if (typeof customerInfo.entitlements.active['CineCodex Pro'] !== "undefined") {
                Alert.alert("Tebrikler!", "Artık CineCodex Pro üyesisin.");
                router.replace('/(tabs)'); // Ana sayfaya yönlendir
            }
        } catch (e: any) {
            if (!e.userCancelled) {
                Alert.alert("Hata", e.message || "Ödeme işlemi sırasında bir sorun oluştu.");
            }
        } finally {
            setLoading(false);
        }
    };

    const features = [
        { icon: 'infinite', title: t('premium.feature_1_title'), sub: t('premium.feature_1_sub') },
        { icon: 'stats-chart', title: t('premium.feature_2_title'), sub: t('premium.feature_2_sub') },
        { icon: 'color-palette', title: t('premium.feature_3_title'), sub: t('premium.feature_3_sub') },
        { icon: 'list', title: t('premium.feature_4_title'), sub: t('premium.feature_4_sub') },
    ];

    return (
        <View className="flex-1 bg-background">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

                {/* 1. Üst Görsel ve Başlık */}
                <View className="h-[300px] items-center justify-center">
                    <LinearGradient
                        colors={['#dc2626', '#7f1d1d', '#020617']}
                        className="absolute inset-0 opacity-40"
                    />
                    <View className="bg-primary/20 p-6 rounded-full border border-primary/30 mb-6">
                        <Ionicons name="star" size={60} color="#dc2626" />
                    </View>
                    <Text className="text-white text-4xl font-black text-center">CineCodex Pro</Text>
                    <Text className="text-slate-400 text-center px-12 mt-2 leading-5">
                        {t('premium.sub') || 'Sınırsız film notu ve özel istatistiklerin kilidini aç.'}
                    </Text>
                </View>

                {/* 2. Özellikler Listesi */}
                <View className="px-8 space-y-8 mt-4">
                    {features.map((item, index) => (
                        <View key={index} className="flex-row items-start mb-6">
                            <View className="bg-surface p-3 rounded-2xl border border-slate-800 mr-4">
                                <Ionicons name={item.icon as any} size={24} color="#dc2626" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-white font-bold text-lg">{item.title}</Text>
                                <Text className="text-slate-500 text-sm mt-1">{item.sub}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* 3. Satın Alma Alanı */}
                <View className="p-8 mt-4 mb-12">
                    <TouchableOpacity
                        onPress={handlePurchase}
                        disabled={loading}
                        activeOpacity={0.9}
                        className="bg-primary p-6 rounded-3xl items-center shadow-2xl shadow-primary/40"
                    >
                        {loading ? (
                            <Loader message={t('premium.processing') || "İşleniyor..."} />
                        ) : (
                            <View className="items-center">
                                <Text className="text-white font-black text-xl mb-1">
                                    {currentPackage?.product.priceString || t('premium.annual_plan')}
                                </Text>
                                <Text className="text-white/70 text-xs font-bold">
                                    {t('premium.annual_sub') || 'Yıllık Abonelik'}
                                </Text>
                            </View>
                        )}

                        {/* Tasarruf Rozeti */}
                        <View className="absolute -top-3 right-6 bg-accent px-3 py-1 rounded-full">
                            <Text className="text-black font-black text-[10px]">{t('premium.save_tag') || '%50 TASARRUF'}</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="mt-6 items-center"
                    >
                        <Text className="text-slate-500 font-bold">{t('premium.maybe_later') || 'Belki Daha Sonra'}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Kapatma Butonu */}
            <SafeAreaView className="absolute top-4 right-6" edges={['top']}>
                <TouchableOpacity onPress={() => router.back()} className="bg-black/40 p-2 rounded-full">
                    <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
            </SafeAreaView>
        </View>
    );
}