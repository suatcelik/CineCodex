import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Image, Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ActionModal from '../../src/components/ActionModal';
import Loader from '../../src/components/Loader';
import { useAuth } from '../../src/context/AuthContext';
import { getImageUrl, getMovieDetails } from '../../src/lib/tmdb';

export default function MovieDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { t } = useTranslation();
    const { isPremium, user } = useAuth();

    const [movie, setMovie] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);

    useEffect(() => {
        if (id) fetchDetails();
    }, [id]);

    const fetchDetails = async () => {
        setLoading(true);
        try {
            const data = await getMovieDetails(Number(id));
            setMovie(data);
        } catch (error) {
            console.error("Film detayları çekilemedi:", error);
        } finally {
            setLoading(false);
        }
    };

    // Fragman ve Platform Verileri
    const trailer = movie?.videos?.results?.find((v: any) => v.type === "Trailer" && v.site === "YouTube");
    const watchProviders = movie?.['watch/providers']?.results?.TR;

    const openTrailer = () => {
        if (trailer) {
            Linking.openURL(`https://www.youtube.com/watch?v=${trailer.key}`);
        } else {
            Alert.alert("Bilgi", "Bu film için fragman bulunamadı.");
        }
    };

    const handleActorPress = (personId: number) => {
        router.push(`/person/${personId}`);
    };

    const handleGenrePress = (genreId: number, genreName: string) => {
        router.push({
            pathname: '/search',
            params: { genreId, genreName }
        });
    };

    if (loading) return <Loader fullScreen />;

    return (
        <View className="flex-1 bg-background">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

                {/* 1. Kapak Görseli ve Fragman Butonu */}
                <View className="relative h-[550px]">
                    <Image
                        source={{ uri: getImageUrl(movie?.poster_path) }}
                        className="w-full h-full"
                        resizeMode="cover"
                    />
                    <LinearGradient
                        colors={['transparent', 'rgba(2, 6, 23, 0.5)', '#020617']}
                        className="absolute inset-0"
                    />

                    <SafeAreaView className="absolute top-0 left-6" edges={['top']}>
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="bg-black/40 p-3 rounded-full border border-white/10"
                        >
                            <Ionicons name="chevron-back" size={24} color="white" />
                        </TouchableOpacity>
                    </SafeAreaView>

                    {/* YouTube Play Butonu */}
                    {trailer && (
                        <TouchableOpacity
                            onPress={openTrailer}
                            className="absolute bottom-40 right-6 bg-red-600 w-16 h-16 rounded-full items-center justify-center shadow-2xl shadow-red-600/50"
                        >
                            <Ionicons name="play" size={32} color="white" className="ml-1" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* 2. Film Detayları */}
                <View className="px-6 -mt-28">
                    <Text className="text-white text-4xl font-black mb-3 leading-tight">
                        {movie?.title}
                    </Text>

                    <View className="flex-row items-center mb-6">
                        <Text className="text-accent font-bold text-lg">★ {movie?.vote_average?.toFixed(1)}</Text>
                        <View className="w-1.5 h-1.5 rounded-full bg-slate-700 mx-3" />
                        <Text className="text-slate-400 font-medium">{movie?.release_date?.split('-')[0]}</Text>
                        <View className="w-1.5 h-1.5 rounded-full bg-slate-700 mx-3" />
                        <Text className="text-slate-400 font-medium">{movie?.runtime} dk</Text>
                    </View>

                    {/* Platformlar */}
                    {watchProviders?.flatrate && (
                        <View className="mb-8">
                            <Text className="text-slate-500 font-bold mb-4 uppercase tracking-[2px] text-[10px]">NEREDE İZLENİR?</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {watchProviders.flatrate.map((provider: any) => (
                                    <View key={provider.provider_id} className="mr-5 items-center">
                                        <Image
                                            source={{ uri: `https://image.tmdb.org/t/p/original${provider.logo_path}` }}
                                            className="w-12 h-12 rounded-2xl border border-slate-800"
                                        />
                                    </View>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    {/* Türler */}
                    <View className="flex-row flex-wrap gap-2 mb-8">
                        {movie?.genres?.map((genre: any) => (
                            <TouchableOpacity
                                key={genre.id}
                                onPress={() => handleGenrePress(genre.id, genre.name)}
                                className="bg-surface px-4 py-2 rounded-xl border border-slate-800"
                            >
                                <Text className="text-slate-300 text-[10px] font-bold uppercase tracking-wider">{genre.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Özet */}
                    <Text className="text-slate-500 font-bold mb-3 uppercase tracking-widest text-[10px]">ÖZET</Text>
                    <Text className="text-slate-300 text-base leading-7 mb-10">{movie?.overview}</Text>

                    {/* Oyuncu Kadrosu */}
                    <Text className="text-slate-500 font-bold mb-4 uppercase tracking-widest text-[10px]">OYUNCU KADROSU</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-12">
                        {movie?.credits?.cast?.slice(0, 10).map((person: any) => (
                            <TouchableOpacity key={person.id} onPress={() => handleActorPress(person.id)} className="mr-6 items-center w-20">
                                <Image
                                    source={{ uri: getImageUrl(person.profile_path) }}
                                    className="w-20 h-20 rounded-full bg-surface border border-slate-800"
                                />
                                <Text className="text-white text-[10px] font-bold mt-3 text-center" numberOfLines={2}>{person.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* --- BENZER FİLMLER (DÜZELTİLDİ) --- */}
                    {movie?.recommendations?.results?.length > 0 && (
                        <View className="mb-48">
                            <Text className="text-slate-500 font-bold mb-6 uppercase tracking-widest text-[10px]">BENZER FİLMLER</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {movie.recommendations.results.slice(0, 12).map((item: any) => (
                                    <TouchableOpacity
                                        key={item.id}
                                        onPress={() => router.push(`/movie/${item.id}`)}
                                        className="mr-4 w-32"
                                    >
                                        <Image
                                            source={{ uri: getImageUrl(item.poster_path) }}
                                            className="w-32 h-48 rounded-3xl bg-surface"
                                            resizeMode="cover"
                                        />
                                        <Text className="text-white text-[10px] font-bold mt-2 px-1" numberOfLines={1}>
                                            {item.title}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Not Ekle Butonu */}
            <View className="absolute bottom-10 left-0 right-0 px-8">
                <TouchableOpacity
                    onPress={() => setIsModalVisible(true)}
                    className="bg-primary flex-row items-center justify-center py-5 rounded-3xl shadow-2xl shadow-primary/60"
                >
                    <Ionicons name={isPremium ? "add-circle" : "lock-closed"} size={22} color="white" />
                    <Text className="text-white font-black text-lg ml-3">Günlüğüme Not Ekle</Text>
                </TouchableOpacity>
            </View>

            <ActionModal
                isVisible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                movieId={Number(id)}
                movieTitle={movie?.title}
                posterPath={movie?.poster_path}
            />
        </View>
    );
}