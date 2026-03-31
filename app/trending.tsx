import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Loader from '../src/components/Loader';
import { getImageUrl, getTrendingMovies } from '../src/lib/tmdb';
import { Movie } from '../src/types';

export default function TrendingScreen() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchTrending();
    }, []);

    const fetchTrending = async () => {
        try {
            const data = await getTrendingMovies();
            setMovies(data);
        } catch (error) {
            console.error("Trend filmler çekilemedi:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader fullScreen />;

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            {/* Header / Üst Bilgi */}
            <View className="px-6 py-4 flex-row items-center border-b border-slate-800/50">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="mr-4 p-2 bg-surface rounded-full border border-slate-800"
                >
                    <Ionicons name="chevron-back" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-2xl font-bold tracking-tight">Topluluk Ne İzliyor?</Text>
            </View>

            {/* Grid Film Listesi */}
            <FlatList
                data={movies}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => router.push(`/movie/${item.id}`)}
                        activeOpacity={0.8}
                        style={{ width: '48%' }}
                        className="mb-6"
                    >
                        <Image
                            source={{ uri: getImageUrl(item.poster_path) || '' }}
                            className="w-full h-56 rounded-3xl border border-slate-800 bg-slate-800"
                            resizeMode="cover"
                        />
                        <View className="mt-3 px-1">
                            <Text className="text-slate-200 font-bold text-sm" numberOfLines={1}>
                                {item.title}
                            </Text>
                            <View className="flex-row items-center mt-1.5">
                                <Ionicons name="star" size={12} color="#f59e0b" />
                                <Text className="text-slate-400 text-xs font-bold ml-1">
                                    {item.vote_average?.toFixed(1) || '0.0'}
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </SafeAreaView>
    );
}