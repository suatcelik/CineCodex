import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { getImageUrl, getTrendingMovies } from '../../src/lib/tmdb';
import { Movie } from '../../src/types';

export default function HomeScreen() {
    const [trending, setTrending] = useState<Movie[]>([]);
    const router = useRouter();

    useEffect(() => {
        getTrendingMovies().then(setTrending);
    }, []);

    return (
        <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>
            {/* 1. Hero Section (Trend Slider) */}
            <View className="h-[450px] w-full">
                <FlatList
                    data={trending.slice(0, 5)}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => router.push(`/movie/${item.id}`)}
                            activeOpacity={0.9}
                            className="w-screen h-full"
                        >
                            <Image
                                source={{ uri: getImageUrl(item.poster_path) || '' }}
                                className="w-full h-full"
                                resizeMode="cover"
                            />
                            <LinearGradient
                                colors={['transparent', 'rgba(2, 6, 23, 0.8)', '#020617']}
                                className="absolute bottom-0 w-full h-40 justify-end px-6 pb-6"
                            >
                                <Text className="text-white text-3xl font-black">{item.title}</Text>
                                <Text className="text-primary font-bold mt-1">#1 Bu Hafta Trendlerde</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {/* 2. Topluluk Verileri (En Çok Konuşulanlar) */}
            <View className="px-6 mt-8">
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-white text-xl font-bold tracking-tight">Topluluk Ne İzliyor?</Text>
                    {/* YENİ: Yönlendirme eklendi */}
                    <TouchableOpacity onPress={() => router.push('/trending')} activeOpacity={0.7}>
                        <Text className="text-primary font-medium">Tümünü Gör</Text>
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={trending.slice(5, 15)}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => router.push(`/movie/${item.id}`)}
                            className="mr-4 w-32"
                            activeOpacity={0.8}
                        >
                            <Image
                                source={{ uri: getImageUrl(item.poster_path) || '' }}
                                className="w-32 h-48 rounded-2xl border border-slate-800"
                            />
                            <Text className="text-slate-300 mt-2 font-semibold" numberOfLines={1}>{item.title}</Text>
                            <View className="flex-row items-center mt-1">
                                <Text className="text-accent text-xs font-bold">★ {item.vote_average?.toFixed(1) || '0.0'}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {/* 3. CTA */}
            <View className="mx-6 my-10 p-6 bg-surface rounded-3xl border border-slate-800">
                <Text className="text-white text-lg font-bold">Unutma, Kaydet!</Text>
                <Text className="text-slate-400 mt-1">İzlediğin filmlere not tutarak kendi sinema kütüphaneni oluştur.</Text>
                <TouchableOpacity
                    onPress={() => router.push('/search')}
                    activeOpacity={0.8}
                    className="bg-white mt-4 py-3 rounded-full"
                >
                    <Text className="text-black text-center font-bold text-base">Keşfetmeye Başla</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}