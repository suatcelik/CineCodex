import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Loader from '../../src/components/Loader';
import { useAuth } from '../../src/context/AuthContext';
import { supabase } from '../../src/lib/supabase';

export default function ProfileScreen() {
    const { user, isPremium } = useAuth();
    const { t } = useTranslation();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<'watched' | 'watchlist'>('watched');
    const [notes, setNotes] = useState<any[]>([]);
    const [watchlist, setWatchlist] = useState<any[]>([]); // Watchlist için yeni state
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Her iki tabloyu (Notlar ve Watchlist) aynı anda çek
    const fetchData = useCallback(async () => {
        if (!user) return;
        try {
            // 1. İzlediklerim (Notlar tablosu)
            const { data: notesData, error: notesError } = await supabase
                .from('movie_notes')
                .select('*')
                .eq('user_id', user.id)
                .order('updated_at', { ascending: false });

            if (notesError) throw notesError;

            // 2. İzleyeceklerim (Watchlist tablosu)
            const { data: watchData, error: watchError } = await supabase
                .from('watchlist')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (watchError) throw watchError;

            setNotes(notesData || []);
            setWatchlist(watchData || []);
        } catch (error: any) {
            console.error("Veri çekme hatası:", error.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user]);

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [fetchData])
    );

    // İstatistikler sadece İzlenenler üzerinden hesaplanır
    const stats = useMemo(() => {
        const count = notes.length;
        const avg = count > 0
            ? (notes.reduce((acc, curr) => acc + curr.rating, 0) / count).toFixed(1)
            : "0.0";
        return { count, avg };
    }, [notes]);

    // Uzun basınca silme işlemi (Hangi sekmedeysek ona göre tablo seçer)
    const handleDelete = (itemId: string, title: string) => {
        const isWatched = activeTab === 'watched';
        const tableName = isWatched ? 'movie_notes' : 'watchlist';
        const msg = isWatched ? 'notlarından' : 'izlenecekler listesinden';

        Alert.alert("Silme İşlemi", `"${title}" ${msg} kalıcı olarak silinecek.`, [
            { text: "Vazgeç", style: "cancel" },
            {
                text: "Sil",
                style: "destructive",
                onPress: async () => {
                    const { error } = await supabase.from(tableName).delete().eq('id', itemId);
                    if (!error) fetchData(); // Başarılıysa listeyi yenile
                }
            }
        ]);
    };

    // Kart Tasarımı (Sekmeye göre içerik değişir)
    const renderMovieItem = ({ item }: { item: any }) => {
        const isWatched = activeTab === 'watched';

        return (
            <TouchableOpacity
                onPress={() => router.push(`/movie/${item.movie_id}`)}
                onLongPress={() => handleDelete(item.id, item.movie_title)}
                activeOpacity={0.8}
                className="flex-row mb-4 items-center bg-surface border border-slate-800/50 p-4 rounded-[24px]"
            >
                <View className="flex-1 pr-4">
                    <Text className="text-white font-bold text-base mb-1" numberOfLines={1}>
                        {item.movie_title}
                    </Text>
                    <View className="flex-row items-center">
                        {isWatched ? (
                            <>
                                <Ionicons name="star" size={12} color="#f59e0b" />
                                <Text className="text-slate-400 text-[10px] ml-1 font-bold">{item.rating}/5</Text>
                                <View className="w-1 h-1 rounded-full bg-slate-700 mx-2" />
                                <Text className="text-slate-500 text-[10px]">
                                    {new Date(item.updated_at).toLocaleDateString()}
                                </Text>
                            </>
                        ) : (
                            <>
                                <Ionicons name="time-outline" size={12} color="#64748b" />
                                <Text className="text-slate-500 text-[10px] ml-1">
                                    {new Date(item.created_at).toLocaleDateString()} tarihinde eklendi
                                </Text>
                            </>
                        )}
                    </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#334155" />
            </TouchableOpacity>
        );
    };

    if (loading) return <Loader fullScreen />;

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            {/* Header */}
            <View className="px-6 py-4 flex-row justify-between items-center">
                <View>
                    <Text className="text-white text-3xl font-black tracking-tighter">Kütüphanem</Text>
                    <Text className="text-slate-500 text-xs font-bold uppercase mt-1">
                        @{user?.email?.split('@')[0]}
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={() => router.push('/profile_settings')}
                    className="w-12 h-12 rounded-2xl bg-surface border border-slate-800 items-center justify-center"
                >
                    <Ionicons name="settings-sharp" size={20} color="white" />
                </TouchableOpacity>
            </View>

            {/* İstatistikler */}
            <View className="flex-row px-6 mt-4 gap-x-4">
                <View className="flex-1 bg-primary/10 border border-primary/20 rounded-[32px] p-5">
                    <Text className="text-primary text-3xl font-black">{stats.count}</Text>
                    <Text className="text-primary/60 text-[10px] font-bold uppercase mt-1 tracking-widest">İzlenen</Text>
                </View>
                <View className="flex-1 bg-accent/10 border border-accent/20 rounded-[32px] p-5">
                    <Text className="text-accent text-3xl font-black">{stats.avg}</Text>
                    <Text className="text-accent/60 text-[10px] font-bold uppercase mt-1 tracking-widest">Ort. Puan</Text>
                </View>
            </View>

            {/* Tab Switcher */}
            <View className="flex-row px-6 mt-8 mb-6 bg-slate-900/50 mx-6 rounded-2xl p-1 border border-slate-800">
                <TouchableOpacity
                    onPress={() => setActiveTab('watched')}
                    className={`flex-1 py-3 rounded-xl items-center ${activeTab === 'watched' ? 'bg-surface' : ''}`}
                >
                    <Text className={`font-bold text-xs ${activeTab === 'watched' ? 'text-white' : 'text-slate-500'}`}>İzlediklerim</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setActiveTab('watchlist')}
                    className={`flex-1 py-3 rounded-xl items-center ${activeTab === 'watchlist' ? 'bg-surface' : ''}`}
                >
                    <Text className={`font-bold text-xs ${activeTab === 'watchlist' ? 'text-white' : 'text-slate-500'}`}>İzleyeceklerim</Text>
                </TouchableOpacity>
            </View>

            {/* İçerik Listesi */}
            <View className="flex-1 px-6">
                <FlatList
                    data={activeTab === 'watched' ? notes : watchlist}
                    keyExtractor={(item) => item.id.toString()}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchData} tintColor="#dc2626" />}
                    ListEmptyComponent={
                        <View className="items-center py-20 opacity-30">
                            <Ionicons
                                name={activeTab === 'watched' ? "film-outline" : "bookmark-outline"}
                                size={64}
                                color="#475569"
                            />
                            <Text className="text-slate-500 mt-4 font-bold text-center px-4">
                                {activeTab === 'watched'
                                    ? 'Henüz hiç film puanlamadın. Keşfetmeye başla!'
                                    : 'İzlemek istediğin filmleri kaydet, burada biriksin.'}
                            </Text>
                        </View>
                    }
                    renderItem={renderMovieItem}
                    contentContainerStyle={{ paddingBottom: 120 }}
                />
            </View>

            {/* Pro Badge */}
            {!isPremium && (
                <TouchableOpacity
                    onPress={() => router.push('/premium')}
                    className="absolute bottom-6 left-6 right-6 bg-surface border border-slate-800 p-4 rounded-3xl flex-row justify-between items-center"
                >
                    <View className="flex-row items-center">
                        <View className="w-8 h-8 rounded-full bg-primary items-center justify-center mr-3">
                            <Ionicons name="flash" size={16} color="white" />
                        </View>
                        <Text className="text-white font-bold text-[10px] uppercase tracking-wider">PRO'YA GEÇ VE SINIRLARI KALDIR</Text>
                    </View>
                    <Ionicons name="arrow-forward" size={16} color="#475569" />
                </TouchableOpacity>
            )}
        </SafeAreaView>
    );
}