import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Purchases from 'react-native-purchases';

export default function PremiumScreen() {
    const router = useRouter();
    const { t } = useTranslation();

    const handlePurchase = async (pkg: any) => {
        try {
            const { customerInfo } = await Purchases.purchasePackage(pkg);
            if (customerInfo.entitlements.active['pro']) {
                // Satın alma başarılı, kullanıcıyı tebrik et ve yönlendir
                router.back();
            }
        } catch (e: any) {
            if (!e.userCancelled) console.log(e);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            <ScrollView className="flex-1 px-6">
                {/* Üst Kısım: Görsel Şölen */}
                <View className="mt-10 items-center">
                    <LinearGradient
                        colors={['#f59e0b', '#dc2626']} // Altın sarısından kırmızıya geçiş
                        className="w-20 h-20 rounded-3xl items-center justify-center mb-6 rotate-12 shadow-2xl shadow-primary/50"
                    >
                        <Text className="text-4xl text-white">💎</Text>
                    </LinearGradient>
                    <Text className="text-white text-4xl font-black text-center mb-2">SineNot Premium</Text>
                    <Text className="text-slate-400 text-center text-lg px-4">
                        Sinema tutkunu bir üst seviyeye taşı, sınırları kaldır.
                    </Text>
                </View>

                {/* Özellik Listesi */}
                <View className="mt-12 space-y-6">
                    <FeatureItem icon="🚀" title="Sınırsız Not & Puanlama" sub="Hiçbir kısıtlama olmadan tüm izlediklerini kaydet." />
                    <FeatureItem icon="📊" title="Derin İstatistikler" sub="İzleme alışkanlıklarını görsel grafiklerle analiz et." />
                    <FeatureItem icon="🎨" title="Özel Uygulama Temaları" sub="Sinema salonu ve Retro gibi özel tasarımları aç." />
                    <FeatureItem icon="📑" title="Koleksiyonlar" sub="Sınırsız sayıda özel film listesi oluştur." />
                </View>

                {/* Satın Alma Butonları (Örnek Tasarım) */}
                <View className="mt-16 mb-10">
                    <TouchableOpacity
                        className="bg-white p-6 rounded-3xl mb-4 border-2 border-primary"
                        activeOpacity={0.8}
                    >
                        <View className="flex-row justify-between items-center">
                            <View>
                                <Text className="text-black font-black text-xl">Yıllık Plan</Text>
                                <Text className="text-slate-500 text-sm">7 gün ücretsiz dene, sonra ₺199/yıl</Text>
                            </View>
                            <View className="bg-primary px-3 py-1 rounded-full">
                                <Text className="text-white font-bold text-[10px] uppercase tracking-widest">%50 Tasarruf</Text>
                            </View>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="bg-surface p-6 rounded-3xl border border-slate-800"
                        onPress={() => router.back()}
                    >
                        <Text className="text-white text-center font-bold text-lg">Belki Daha Sonra</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

// Küçük Yardımcı Bileşen
function FeatureItem({ icon, title, sub }: { icon: string, title: string, sub: string }) {
    return (
        <View className="flex-row items-center mb-6">
            <View className="w-12 h-12 bg-surface rounded-2xl items-center justify-center border border-slate-800 mr-4">
                <Text className="text-xl">{icon}</Text>
            </View>
            <View className="flex-1">
                <Text className="text-white font-bold text-lg">{title}</Text>
                <Text className="text-slate-500 text-sm">{sub}</Text>
            </View>
        </View>
    );
}