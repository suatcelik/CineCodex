import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Loader from '../../src/components/Loader';
import { getImageUrl, getPersonDetails } from '../../src/lib/tmdb';

export default function PersonDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const [person, setPerson] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isBioExpanded, setIsBioExpanded] = useState(false);

    useEffect(() => {
        if (id) {
            fetchPersonData();
        }
    }, [id]);

    const fetchPersonData = async () => {
        try {
            const data = await getPersonDetails(Number(id));
            setPerson(data);
        } catch (error) {
            console.error("Oyuncu detayları çekilemedi:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader fullScreen />;

    // Filmleri popülerliğe göre sırala
    const movies = person?.movie_credits?.cast?.sort((a: any, b: any) => b.popularity - a.popularity) || [];

    return (
        <View className="flex-1 bg-background">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

                {/* 1. Üst Kısım: Büyük Portre */}
                <View className="relative h-[550px]">
                    <Image
                        // DÜZELTME: || '' eklendi
                        source={{ uri: getImageUrl(person?.profile_path) || '' }}
                        className="w-full h-full"
                        resizeMode="cover"
                    />
                    <LinearGradient
                        colors={['transparent', 'rgba(2, 6, 23, 0.6)', '#020617']}
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
                </View>

                {/* 2. İçerik Alanı */}
                <View className="px-6 -mt-32">
                    <Text className="text-white text-5xl font-black mb-2 leading-tight">
                        {person?.name}
                    </Text>

                    <View className="flex-row items-center mb-8">
                        <Text className="text-primary font-bold text-xs uppercase tracking-[2px]">
                            {person?.known_for_department === 'Acting' ? 'OYUNCU' : 'SİNEMACI'}
                        </Text>
                        {person?.birthday && (
                            <>
                                <View className="w-1.5 h-1.5 rounded-full bg-slate-700 mx-3" />
                                <Text className="text-slate-400 font-medium">
                                    {new Date().getFullYear() - new Date(person.birthday).getFullYear()} Yaşında
                                </Text>
                            </>
                        )}
                    </View>

                    {/* Biyografi */}
                    {person?.biography ? (
                        <View className="mb-10">
                            <Text className="text-slate-500 font-bold mb-3 uppercase tracking-widest text-[10px]">
                                BİYOGRAFİ
                            </Text>
                            <TouchableOpacity
                                activeOpacity={0.9}
                                onPress={() => setIsBioExpanded(!isBioExpanded)}
                            >
                                <Text
                                    className="text-slate-300 text-base leading-7"
                                    numberOfLines={isBioExpanded ? undefined : 4}
                                >
                                    {person.biography}
                                </Text>
                                <Text className="text-primary font-bold mt-2 text-xs">
                                    {isBioExpanded ? 'Daha Az Gör' : 'Devamını Oku...'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : null}

                    {/* --- DÜZELTİLEN FİLM GRİDİ --- */}
                    <Text className="text-white text-2xl font-black mb-6">
                        Oynadığı Filmler
                    </Text>

                    <View className="flex-row flex-wrap justify-between pb-20">
                        {movies.slice(0, 24).map((movie: any) => (
                            <TouchableOpacity
                                key={movie.id + Math.random()}
                                onPress={() => router.push(`/movie/${movie.id}`)}
                                style={{ width: '48%' }}
                                className="mb-6 shadow-2xl"
                            >
                                <View className="bg-surface rounded-[28px] overflow-hidden border border-slate-800">
                                    <Image
                                        // DÜZELTME: || '' eklendi
                                        source={{ uri: getImageUrl(movie.poster_path) || '' }}
                                        className="w-full h-64"
                                        resizeMode="cover"
                                    />
                                    <View className="p-3">
                                        <Text className="text-white font-bold text-[11px]" numberOfLines={1}>
                                            {movie.title}
                                        </Text>
                                        <View className="flex-row items-center mt-1">
                                            <Ionicons name="star" size={10} color="#f59e0b" />
                                            <Text className="text-slate-400 text-[9px] ml-1 font-bold">
                                                {/* DÜZELTME: || '0.0' eklendi */}
                                                {movie.vote_average?.toFixed(1) || '0.0'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}