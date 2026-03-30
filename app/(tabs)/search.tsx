import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Keyboard, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Loader from '../../src/components/Loader';
import MovieCard from '../../src/components/MovieCard';
import { getMoviesByActor, getMoviesByGenre, searchMovies } from '../../src/lib/tmdb';
import { useStore } from '../../src/store/useStore';
import { Movie } from '../../src/types/movie';

const GENRES = [
    { id: 28, name: 'Aksiyon', en: 'Action' },
    { id: 35, name: 'Komedi', en: 'Comedy' },
    { id: 18, name: 'Dram', en: 'Drama' },
    { id: 27, name: 'Korku', en: 'Horror' },
    { id: 878, name: 'Bilim Kurgu', en: 'Sci-Fi' },
    { id: 14, name: 'Fantastik', en: 'Fantasy' },
    { id: 10749, name: 'Romantik', en: 'Romance' },
    { id: 53, name: 'Gerilim', en: 'Thriller' },
];

export default function SearchScreen() {
    const params = useLocalSearchParams();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeGenre, setActiveGenre] = useState<number | null>(null);
    const [activeActor, setActiveActor] = useState<{ id: number, name: string } | null>(null);

    const { language } = useStore();
    const { t } = useTranslation();
    const langCode = language === 'tr' ? 'tr-TR' : 'en-US';

    // 1. Parametre Kontrolü (Genre veya Actor gelmişse)
    useEffect(() => {
        if (params.personId) {
            const aid = Number(params.personId);
            const aName = params.personName as string;
            setActiveActor({ id: aid, name: aName });
            setActiveGenre(null);
            fetchByActor(aid);
        } else if (params.genreId) {
            const gid = Number(params.genreId);
            setActiveGenre(gid);
            setActiveActor(null);
            fetchByGenre(gid);
        }
    }, [params.personId, params.genreId]);

    // 2. Metin ile Arama (Debounce)
    useEffect(() => {
        if (query.trim().length < 2) {
            if (!activeGenre && !activeActor) setResults([]);
            return;
        }

        setActiveGenre(null);
        setActiveActor(null);

        const delayDebounceFn = setTimeout(async () => {
            setLoading(true);
            try {
                const data = await searchMovies(query, langCode);
                setResults(data);
            } catch (error) {
                console.error("Arama hatası:", error);
            } finally {
                setLoading(false);
            }
        }, 600);

        return () => clearTimeout(delayDebounceFn);
    }, [query, language]);

    // Kategoriye göre getir
    const fetchByGenre = async (genreId: number) => {
        setLoading(true);
        setQuery('');
        try {
            const data = await getMoviesByGenre(genreId, langCode);
            setResults(data);
        } catch (error) {
            console.error("Kategori hatası:", error);
        } finally {
            setLoading(false);
        }
    };

    // Oyuncuya göre getir
    const fetchByActor = async (actorId: number) => {
        setLoading(true);
        setQuery('');
        try {
            const data = await getMoviesByActor(actorId, langCode);
            setResults(data);
        } catch (error) {
            console.error("Oyuncu hatası:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenreSelect = (id: number) => {
        if (activeGenre === id) {
            setActiveGenre(null);
            setResults([]);
        } else {
            setActiveActor(null);
            setActiveGenre(id);
            fetchByGenre(id);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            <View className="px-6 pt-4">
                <Text className="text-white text-3xl font-black mb-6 tracking-tight">
                    {activeActor
                        ? `${activeActor.name}`
                        : activeGenre
                            ? GENRES.find(g => g.id === activeGenre)?.[language === 'tr' ? 'name' : 'en']
                            : t('search_title')}
                </Text>

                <View className="relative mb-6">
                    <View className="absolute left-4 top-4 z-10">
                        <Ionicons name="search" size={20} color="#64748b" />
                    </View>

                    <TextInput
                        value={query}
                        onChangeText={setQuery}
                        placeholder={t('search_placeholder')}
                        placeholderTextColor="#475569"
                        autoCapitalize="none"
                        className="bg-surface text-white pl-12 pr-12 py-4 rounded-2xl border border-slate-800 text-base"
                    />

                    {(query.length > 0 || activeGenre || activeActor) && (
                        <TouchableOpacity
                            onPress={() => {
                                setQuery('');
                                setActiveGenre(null);
                                setActiveActor(null);
                                setResults([]);
                            }}
                            className="absolute right-4 top-4"
                        >
                            <Ionicons name="close-circle" size={20} color="#64748b" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Kategori Şeridi */}
            <View className="mb-4">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24 }}>
                    {GENRES.map((genre) => (
                        <TouchableOpacity
                            key={genre.id}
                            onPress={() => handleGenreSelect(genre.id)}
                            className={`mr-3 px-6 py-3 rounded-full border ${activeGenre === genre.id ? 'bg-primary border-primary' : 'bg-surface border-slate-800'}`}
                        >
                            <Text className={`font-bold text-xs uppercase tracking-widest ${activeGenre === genre.id ? 'text-white' : 'text-slate-400'}`}>
                                {language === 'tr' ? genre.name : genre.en}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View className="flex-1 px-6">
                {loading ? (
                    <Loader />
                ) : results.length > 0 ? (
                    <FlatList
                        data={results}
                        numColumns={2}
                        columnWrapperClassName="justify-between"
                        keyExtractor={(item, index) => item.id.toString() + index}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        renderItem={({ item }) => <MovieCard movie={item} />}
                        onScrollBeginDrag={Keyboard.dismiss}
                    />
                ) : (
                    <View className="flex-1 justify-center items-center px-10 pb-20">
                        <View className="bg-surface p-8 rounded-full mb-6">
                            <Ionicons name={query.length >= 2 ? "alert-circle-outline" : "film-outline"} size={50} color="#dc2626" />
                        </View>
                        <Text className="text-white text-xl font-bold text-center mb-2">
                            {query.length >= 2 ? t('no_results') : t('search_empty_state')}
                        </Text>
                        <Text className="text-slate-500 text-center leading-6">
                            {query.length >= 2 ? `"${query}" için sonuç bulamadık.` : t('search_description')}
                        </Text>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}