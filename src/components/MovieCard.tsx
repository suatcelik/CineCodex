import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { getImageUrl } from '../lib/tmdb';
import { Movie } from '../types/movie'; // Daha önce oluşturduğumuz tip

interface MovieCardProps {
    movie: Movie;
    showRating?: boolean;
}

export default function MovieCard({ movie, showRating = true }: MovieCardProps) {
    const router = useRouter();
    const { t } = useTranslation();

    // Görsel yolu yoksa boş dönmemesi için kontrol
    const posterUri = getImageUrl(movie.poster_path);

    return (
        <TouchableOpacity
            onPress={() => router.push(`/movie/${movie.id}`)}
            activeOpacity={0.85}
            className="w-[47%] mb-6" // İki sütunlu yapıda yan yana gelmesi için
        >
            {/* Film Afişi Konteynırı */}
            <View className="relative w-full h-64 rounded-[24px] overflow-hidden bg-surface border border-slate-800 shadow-sm">
                {posterUri ? (
                    <Image
                        source={{ uri: posterUri }}
                        className="w-full h-full"
                        resizeMode="cover"
                    />
                ) : (
                    // Görsel yoksa gösterilecek alan
                    <View className="flex-1 justify-center items-center bg-slate-900">
                        <Ionicons name="image-outline" size={40} color="#334155" />
                    </View>
                )}

                {/* Küçük Puan Rozeti (Opsiyonel) */}
                {showRating && movie.vote_average > 0 && (
                    <View className="absolute top-3 right-3 bg-black/60 px-2 py-1 rounded-lg border border-white/10 backdrop-blur-md">
                        <View className="flex-row items-center">
                            <Ionicons name="star" size={10} color="#f59e0b" />
                            <Text className="text-white text-[10px] font-bold ml-1">
                                {movie.vote_average.toFixed(1)}
                            </Text>
                        </View>
                    </View>
                )}
            </View>

            {/* Film Bilgileri */}
            <View className="mt-3 px-1">
                <Text
                    className="text-white font-bold text-sm leading-5"
                    numberOfLines={1}
                >
                    {movie.title}
                </Text>

                <Text className="text-slate-500 text-xs mt-1 font-medium">
                    {movie.release_date ? movie.release_date.split('-')[0] : t('unknown_date')}
                </Text>
            </View>
        </TouchableOpacity>
    );
}