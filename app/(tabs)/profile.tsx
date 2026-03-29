import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Loader from '../../src/components/Loader';
import { useAuth } from '../../src/context/AuthContext';
import { supabase } from '../../src/lib/supabase';

export default function ProfileScreen() {
    const { user, isPremium, signOut } = useAuth();
    const { t } = useTranslation();
    const router = useRouter();

    const [notes, setNotes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Verileri Supabase'den Çek
    const fetchUserNotes = async () => {
        if (!user) return;

        const { data, error } = await supabase
            .from('movie_notes')
            .select('*')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false });

        if (error) {
            console.error("Notlar çekilemedi:", error.message);
        } else {
            setNotes(data || []);
        }
        setLoading(false);
        setRefreshing(false);
    };

    useEffect(() => {
        fetchUserNotes();
    }, [user]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchUserNotes();
    };

    if (loading) return <Loader fullScreen />;

    return (
        <SafeAreaView className="flex-1 bg-background">
            {/* 1. Header & Profil Bilgisi */}
            <View className="px-6 py-4 flex-row justify-between items-center">
                <View>
                    <Text className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-1">
                        {t('profile.pro_member')}
                    </Text>
                    <Text className="text-white text-3xl font-black">
                        {user?.email?.split('@')[0] || t('profile_tab')}
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={() => router.push('/profile_settings')}
                    className="bg-surface p-3 rounded-2xl border border-slate-800"
                >
                    <Ionicons name="settings-outline" size={24} color="white" />
                </TouchableOpacity>
            </View>

            {/* 2. İstatistik Şeridi */}
            <View className="flex-row px-6 mb-8 mt-4 justify-between">
                <View className="bg-surface border border-slate-800 rounded-3xl p-5 flex-1 mr-2 items-center">
                    <Text className="text-primary text-2xl font-black">{notes.length}</Text>
                    <Text className="text-slate-500 text-[10px] font-bold uppercase mt-1">
                        {t('profile.stats_watched')}
                    </Text>
                </View>
                <View className="bg-surface border border-slate-800 rounded-3xl p-5 flex-1 ml-2 items-center">
                    <Text className="text-accent text-2xl font-black">
                        {notes.length > 0
                            ? (notes.reduce((acc, curr) => acc + curr.rating, 0) / notes.length).toFixed(1)
                            : "0.0"}
                    </Text>
                    <Text className="text-slate-500 text-[10px] font-bold uppercase mt-1">
                        {t('profile.stats_avg')}
                    </Text>
                </View>
            </View>

            {/* 3. Timeline Listesi */}
            <View className="flex-1 px-6">
                <Text className="text-white text-xl font-black mb-6">{t('profile.timeline')}</Text>

                <FlatList
                    data={notes}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#dc2626" />
                    }
                    ListEmptyComponent={() => (
                        <View className="items-center py-20">
                            <Ionicons name="journal-outline" size={60} color="#1e293b" />
                            <Text className="text-slate-500 text-center mt-4 px-10 leading-6">
                                {t('profile.empty_timeline')}
                            </Text>
                        </View>
                    )}
                    renderItem={({ item, index }) => (
                        <TouchableOpacity
                            onPress={() => router.push(`/movie/${item.movie_id}`)}
                            className="flex-row mb-8"
                        >
                            {/* Sol Taraf: Zaman Çizgisi Noktası */}
                            <View className="items-center mr-4">
                                <View className="w-3 h-3 rounded-full bg-primary mt-2" />
                                {index !== notes.length - 1 && <View className="w-[2px] flex-1 bg-slate-800 my-2" />}
                            </View>

                            {/* Sağ Taraf: Kart İçeriği */}
                            <View className="flex-1 bg-surface border border-slate-800 rounded-3xl p-4 flex-row items-center">
                                <View className="flex-1 pr-4">
                                    <Text className="text-white font-bold text-lg mb-1" numberOfLines={1}>
                                        {item.movie_title}
                                    </Text>
                                    <View className="flex-row items-center mb-2">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <Ionicons
                                                key={s}
                                                name="star"
                                                size={12}
                                                color={item.rating >= s ? "#f59e0b" : "#334155"}
                                                style={{ marginRight: 2 }}
                                            />
                                        ))}
                                    </View>
                                    <Text className="text-slate-400 text-xs italic" numberOfLines={2}>
                                        "{item.note || '...'}"
                                    </Text>
                                </View>

                                {/* Tarih Rozeti */}
                                <View className="items-end">
                                    <Text className="text-slate-600 text-[10px] font-bold">
                                        {new Date(item.updated_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            </View>
        </SafeAreaView>
    );
}