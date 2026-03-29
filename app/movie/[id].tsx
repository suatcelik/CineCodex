import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import ActionModal from '../../src/components/ActionModal';
import Loader from '../../src/components/Loader';
import { useAuth } from '../../src/context/AuthContext';
import { getImageUrl, getMovieDetails } from '../../src/lib/tmdb';

export default function MovieDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { t } = useTranslation();
    const { isPremium } = useAuth(); // Premium kontrolü

    const [movie, setMovie] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);

    useEffect(() => {
        if (id) {
            fetchDetails();
        }
    }, [id]);

    const fetchDetails = async () => {
        const data = await getMovieDetails(Number(id));
        setMovie(data);
        setLoading(false);
    };

    if (loading) return <Loader fullScreen />;

    return (
        <View className="flex-1 bg-background">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

                {/* 1. Üst Kısım: Afiş ve Geri Tuşu */}
                <View className="relative h-[500px]">
                    <Image
                        source={{ uri: getImageUrl(movie?.poster_path) }}
                        className="w-full h-full"
                        resizeMode="cover"
                    />
                    <LinearGradient
                        colors={['transparent', 'rgba(2, 6, 23, 0.8)', '#020617']}
                        className="absolute inset-0"
                    />

                    {/* Geri Butonu */}
                    <SafeAreaView className="absolute top-4 left-6">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="bg-black/40 p-3 rounded-full border border-white/10"
                        >
                            <Ionicons name="chevron-back" size={24} color="white" />
                        </TouchableOpacity>
                    </SafeAreaView>
                </View>

                {/* 2. Film Bilgileri */}
                <View className="px-6 -mt-20">
                    <Text className="text-white text-4xl font-black mb-2 leading-tight">
                        {movie?.title}
                    </Text>

                    <View className="flex-row items-center mb-6">
                        <Text className="text-accent font-bold text-lg">★ {movie?.vote_average?.toFixed(1)}</Text>
                        <View className="w-1.5 h-1.5 rounded-full bg-slate-700 mx-3" />
                        <Text className="text-slate-400 font-medium">
                            {movie?.release_date?.split('-')[0]}
                        </Text>
                        <View className="w-1.5 h-1.5 rounded-full bg-slate-700 mx-3" />
                        <Text className="text-slate-400 font-medium">
                            {movie?.runtime} {t('movie_detail.runtime_unit')}
                        </Text>
                    </View>

                    {/* Türler (Genres) */}
                    <View className="flex-row flex-wrap gap-2 mb-8">
                        {movie?.genres?.map((genre: any) => (
                            <View key={genre.id} className="bg-surface px-4 py-2 rounded-xl border border-slate-800">
                                <Text className="text-slate-300 text-xs font-bold uppercase">{genre.name}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Özet (Summary) */}
                    <Text className="text-slate-400 font-bold mb-3 uppercase tracking-widest text-xs">
                        {t('movie_detail.summary')}
                    </Text>
                    <Text className="text-slate-300 text-base leading-7 mb-10">
                        {movie?.overview || t('movie_detail.no_summary')}
                    </Text>

                    {/* Oyuncu Kadrosu (Cast - Yatay Scroll) */}
                    <Text className="text-slate-400 font-bold mb-4 uppercase tracking-widest text-xs">
                        {t('movie_detail.cast')}
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-32">
                        {movie?.credits?.cast?.slice(0, 10).map((person: any) => (
                            <View key={person.id} className="mr-6 items-center w-20">
                                <Image
                                    source={{ uri: getImageUrl(person.profile_path) }}
                                    className="w-20 h-20 rounded-full bg-surface border border-slate-800"
                                />
                                <Text className="text-white text-[10px] font-bold mt-3 text-center" numberOfLines={2}>
                                    {person.name}
                                </Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            </ScrollView>

            {/* 3. Sabit "Not Ekle" Butonu (Bottom Action) */}
            <View className="absolute bottom-10 left-0 right-0 px-6">
                <TouchableOpacity
                    onPress={() => setIsModalVisible(true)}
                    activeOpacity={0.9}
                    className="bg-primary flex-row items-center justify-center py-5 rounded-full shadow-2xl shadow-primary/40"
                >
                    <Ionicons name="add-circle-outline" size={24} color="white" />
                    <Text className="text-white font-black text-lg ml-2">
                        {t('movie_detail.add_note_btn')}
                    </Text>
                    {!isPremium && <Text className="ml-2">🔒</Text>}
                </TouchableOpacity>
            </View>

            {/* Not Ekleme Modal'ı */}
            <ActionModal
                isVisible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                movieId={Number(id)}
                movieTitle={movie?.title}
            />
        </View>
    );
}