import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { supabase } from '../../src/lib/supabase';

export default function ProfileScreen() {
    const { user, profile } = useAuth();
    const [interactions, setInteractions] = useState<any[]>([]);
    const { t } = useTranslation();
    const router = useRouter();

    useEffect(() => {
        if (user) fetchUserInteractions();
    }, [user]);

    const fetchUserInteractions = async () => {
        const { data } = await supabase
            .from('user_interactions')
            .select('*')
            .eq('user_id', user?.id)
            .order('created_at', { ascending: false });

        setInteractions(data || []);
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            <View className="px-6 pt-10 pb-6">
                {/* Kullanıcı Bilgisi */}
                <View className="flex-row items-center justify-between mb-8">
                    <View>
                        <Text className="text-white text-3xl font-black">@{profile?.username || 'sinephile'}</Text>
                        <Text className="text-slate-500 font-medium">Sinema Günlüğüm</Text>
                    </View>
                    {profile?.is_premium && (
                        <View className="bg-primary/20 px-4 py-1.5 rounded-full border border-primary/30">
                            <Text className="text-primary font-bold text-xs">PRO MEMBER</Text>
                        </View>
                    )}
                </View>

                {/* İstatistik Kartları */}
                <View className="flex-row gap-x-4 mb-8">
                    <View className="flex-1 bg-surface p-4 rounded-3xl border border-slate-800">
                        <Text className="text-white text-2xl font-black">{interactions.length}</Text>
                        <Text className="text-slate-500 text-xs font-bold uppercase tracking-widest">İzlenen</Text>
                    </View>
                    <View className="flex-1 bg-surface p-4 rounded-3xl border border-slate-800">
                        <Text className="text-accent text-2xl font-black">
                            {interactions.filter(i => i.rating).length > 0
                                ? (interactions.reduce((acc, curr) => acc + (curr.rating || 0), 0) / interactions.filter(i => i.rating).length).toFixed(1)
                                : '0.0'}
                        </Text>
                        <Text className="text-slate-500 text-xs font-bold uppercase tracking-widest">Ort. Puan</Text>
                    </View>
                </View>

                <Text className="text-white text-xl font-bold mb-4">Zaman Tüneli</Text>
            </View>

            {/* Timeline Listesi */}
            <FlatList
                data={interactions}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
                ListEmptyComponent={() => (
                    <View className="mt-20 items-center">
                        <Text className="text-slate-600 text-center px-10">Henüz bir film notlamadın. İlk filmini ekleyerek günlüğünü oluşturmaya başla!</Text>
                    </View>
                )}
                renderItem={({ item, index }) => (
                    <TouchableOpacity
                        onPress={() => router.push(`/movie/${item.movie_id}`)}
                        activeOpacity={0.7}
                        className="flex-row mb-8"
                    >
                        {/* Sol Taraf: Zaman Çizgisi */}
                        <View className="items-center mr-6">
                            <View className="w-4 h-4 rounded-full bg-primary border-4 border-background z-10" />
                            {index !== interactions.length - 1 && (
                                <View className="w-[2px] flex-1 bg-slate-800 -mt-1" />
                            )}
                        </View>

                        {/* Sağ Taraf: Kart İçeriği */}
                        <View className="flex-1 bg-surface rounded-3xl p-4 border border-slate-800 flex-row">
                            {/* Buraya TMDB'den gelen afiş gelecek (İdeal olarak etkileşim tablosuna poster_path eklenmelidir) */}
                            <View className="w-16 h-24 bg-slate-800 rounded-xl mr-4" />

                            <View className="flex-1 justify-center">
                                <Text className="text-white font-bold text-lg mb-1" numberOfLines={1}>
                                    {item.status === 'watched' ? 'İzlendi' : 'Listeye Eklendi'}
                                </Text>
                                {item.rating && (
                                    <Text className="text-accent font-black mb-1">★ {item.rating}/10</Text>
                                )}
                                <Text className="text-slate-400 text-sm italic" numberOfLines={2}>
                                    "{item.note || 'Not eklenmedi...'}"
                                </Text>
                                <Text className="text-slate-600 text-[10px] mt-2 font-bold uppercase">
                                    {new Date(item.created_at).toLocaleDateString('tr-TR')}
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </SafeAreaView>
    );
}