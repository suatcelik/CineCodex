import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { getImageUrl } from '../lib/tmdb'; // Daha önce yazdığımız servis

interface MovieCardProps {
    movie: any;
    showRating?: boolean;
}

export default function MovieCard({ movie, showRating = true }: MovieCardProps) {
    const router = useRouter();
    const { t } = useTranslation();

    return (
        <TouchableOpacity
            onPress={() => router.push(`/movie/${movie.id}`)}
            activeOpacity={0.8}
            className="w-[47%] mb-6" // İki sütunlu yapıda her kart %47 genişliğinde
        >
            <Image
                source={{ uri: getImageUrl(movie.poster_path) }}
                className="w-full h-64 rounded-2xl border border-slate-800 bg-surface" // nativewind'den surface rengi
                resizeMode="cover"
            />
            <Text className="text-white mt-3 font-semibold text-sm" numberOfLines={1}>
                {movie.title}
            </Text>

            {showRating && (
                <View className="flex-row items-center mt-1">
                    <Text className="text-accent text-xs font-bold">★ {movie.vote_average?.toFixed(1)}</Text>
                    <Text className="text-slate-500 text-xs ml-2">
                        {movie.release_date?.split('-')[0] || t('unknown_date')}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
}