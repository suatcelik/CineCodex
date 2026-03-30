import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
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

    const [notes, setNotes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Verileri çekme ve Focus yönetimi
    const fetchUserNotes = async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('movie_notes')
                .select('*')
                .eq('user_id', user.id)
                .order('updated_at', { ascending: false });

            if (error) throw error;
            setNotes(data || []);
        } catch (error: any) {
            console.error("Veri çekme hatası:", error.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchUserNotes();
        }, [user])
    );

    // --- SİLME İŞLEMİ ---
    const handleDelete = (noteId: string, title: string) => {
        Alert.alert(
            "Notu Sil",
            `"${title}" hakkındaki notunu kalıcı olarak silmek istediğine emin misin?`,
            [
                { text: "Vazgeç", style: "cancel" },
                {
                    text: "Sil",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const { error } = await supabase
                                .from('movie_notes')
                                .delete()
                                .eq('id', noteId)
                                .eq('user_id', user?.id); // Güvenlik katmanı

                            if (error) throw error;

                            // Sadece başarılıysa listeden çıkar
                            setNotes(prev => prev.filter(n => n.id !== noteId));
                        } catch (err: any) {
                            Alert.alert("Hata", "Not silinemedi: " + err.message);
                        }
                    }
                }
            ]
        );
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchUserNotes();
    };

    if (loading) return <Loader fullScreen />;

    return (
        <SafeAreaView className="flex-1 bg-background">
            {/* Header ve Profil Bilgisi */}
            <View className="px-6 py-4 flex-row justify-between items-center">
                <View>
                    <Text className="text-primary font-bold text-[10px] uppercase tracking-widest mb-1">
                        {isPremium ? "PRO ÜYE" : "ÜCRETSİZ PLAN"}
                    </Text>
                    <Text className="text-white text-3xl font-black">
                        {user?.email?.split('@')[0]}
                    </Text>
                </View>
                <TouchableOpacity onPress={() => router.push('/profile_settings')} className="bg-surface p-3 rounded-2xl border border-slate-800">
                    <Ionicons name="settings-outline" size={24} color="white" />
                </TouchableOpacity>
            </View>

            {/* Premium İlerleme Barı */}
            {!isPremium && (
                <View className="px-6 mb-6">
                    <TouchableOpacity onPress={() => router.push('/premium')} className="bg-surface border border-slate-800 rounded-3xl p-5">
                        <View className="flex-row justify-between items-center mb-3">
                            <Text className="text-slate-400 text-[10px] font-black uppercase tracking-tighter">Kotan</Text>
                            <Text className="text-white text-xs font-bold">{notes.length} / 5</Text>
                        </View>
                        <View className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                            <View className="h-full bg-primary" style={{ width: `${Math.min((notes.length / 5) * 100, 100)}%` }} />
                        </View>
                    </TouchableOpacity>
                </View>
            )}

            {/* İstatistikler */}
            <View className="flex-row px-6 mb-8 justify-between">
                <View className="bg-surface border border-slate-800 rounded-3xl p-5 flex-1 mr-2 items-center">
                    <Text className="text-primary text-2xl font-black">{notes.length}</Text>
                    <Text className="text-slate-500 text-[10px] font-bold uppercase mt-1">İzlenen</Text>
                </View>
                <View className="bg-surface border border-slate-800 rounded-3xl p-5 flex-1 ml-2 items-center">
                    <Text className="text-accent text-2xl font-black">
                        {notes.length > 0 ? (notes.reduce((acc, curr) => acc + curr.rating, 0) / notes.length).toFixed(1) : "0.0"}
                    </Text>
                    <Text className="text-slate-500 text-[10px] font-bold uppercase mt-1">Ortalama</Text>
                </View>
            </View>

            {/* Liste */}
            <View className="flex-1 px-6">
                <Text className="text-white text-xl font-black mb-6">Sinema Günlüğüm</Text>

                <FlatList
                    data={notes}
                    keyExtractor={(item) => item.id.toString()}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#dc2626" />}
                    ListEmptyComponent={() => (
                        <View className="items-center py-20 border border-dashed border-slate-800 rounded-[40px]">
                            <Ionicons name="film-outline" size={60} color="#334155" />
                            <TouchableOpacity onPress={() => router.push('/')} className="mt-8 bg-white px-10 py-4 rounded-full">
                                <Text className="text-black font-black text-sm">KEŞFETMEYE BAŞLA</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    renderItem={({ item, index }) => (
                        <View className="flex-row mb-8">
                            <View className="items-center mr-4">
                                <View className="w-3 h-3 rounded-full bg-primary mt-2" />
                                {index !== notes.length - 1 && <View className="w-[2px] flex-1 bg-slate-800 my-2" />}
                            </View>

                            <TouchableOpacity
                                onPress={() => router.push(`/movie/${item.movie_id}`)}
                                onLongPress={() => handleDelete(item.id, item.movie_title)}
                                className="flex-1 bg-surface border border-slate-800 rounded-3xl p-5 flex-row items-center"
                            >
                                <View className="flex-1 pr-4">
                                    <Text className="text-white font-bold text-lg mb-1" numberOfLines={1}>
                                        {item.movie_title}
                                    </Text>
                                    <View className="flex-row mb-2">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <Ionicons key={s} name="star" size={12} color={item.rating >= s ? "#f59e0b" : "#1e293b"} style={{ marginRight: 2 }} />
                                        ))}
                                    </View>
                                    <Text className="text-slate-400 text-xs italic" numberOfLines={2}>
                                        "{item.note || '...'}"
                                    </Text>
                                </View>

                                <TouchableOpacity onPress={() => handleDelete(item.id, item.movie_title)} className="p-2">
                                    <Ionicons name="trash-outline" size={20} color="#475569" />
                                </TouchableOpacity>
                            </TouchableOpacity>
                        </View>
                    )}
                />
            </View>
        </SafeAreaView>
    );
}