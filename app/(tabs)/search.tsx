import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Image, Keyboard, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Loader from '../../src/components/Loader';
import {
    getImageUrl // Afişleri çekmek için eklendi
    ,
    getMoviesByActor, getMoviesByGenre,
    getNowPlayingMovies,
    getPopularMovies,
    getTopRatedMovies,
    getUpcomingMovies,
    searchMovies
} from '../../src/lib/tmdb';
import { useStore } from '../../src/store/useStore';
import { Movie } from '../../src/types/movie';

// Keşfet Koleksiyonları
const QUICK_COLLECTIONS = [
    { id: 'top_rated', name: 'IMDb Top 10', icon: 'star', color: '#f59e0b', bg: 'bg-amber-500/10' },
    { id: 'popular', name: 'En Çok İzlenenler', icon: 'flame', color: '#ef4444', bg: 'bg-red-500/10' },
    { id: 'upcoming', name: '2026 Yeni Filmler', icon: 'calendar', color: '#3b82f6', bg: 'bg-blue-500/10' },
    { id: 'now_playing', name: 'Şu An Vizyonda', icon: 'ticket', color: '#10b981', bg: 'bg-emerald-500/10' },
];

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
    const router = useRouter(); // Yönlendirme için eklendi
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(false);

    // Aktif Filtreler
    const [activeGenre, setActiveGenre] = useState<number | null>(null);
    const [activeActor, setActiveActor] = useState<{ id: number, name: string } | null>(null);
    const [activeCollection, setActiveCollection] = useState<{ id: string, name: string } | null>(null);

    const { language } = useStore();
    const { t } = useTranslation();
    const langCode = language === 'tr' ? 'tr-TR' : 'en-US';

    // 1. Parametre Kontrolü
    useEffect(() => {
        if (params.personId) {
            const aid = Number(params.personId);
            setActiveActor({ id: aid, name: params.personName as string });
            clearOtherFilters();
            fetchByActor(aid);
        } else if (params.genreId) {
            const gid = Number(params.genreId);
            setActiveGenre(gid);
            clearOtherFilters();
            fetchByGenre(gid);
        }
    }, [params.personId, params.genreId]);

    // 2. Metin Arama (Debounce)
    useEffect(() => {
        if (query.trim().length < 2) {
            if (!activeGenre && !activeActor && !activeCollection) setResults([]);
            return;
        }

        clearOtherFilters();
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

    // --- Veri Çekme Fonksiyonları ---
    const fetchByGenre = async (id: number) => {
        setLoading(true);
        const data = await getMoviesByGenre(id, langCode);
        setResults(data);
        setLoading(false);
    };

    const fetchByActor = async (id: number) => {
        setLoading(true);
        const data = await getMoviesByActor(id, langCode);
        setResults(data);
        setLoading(false);
    };

    const fetchCollection = async (collectionId: string, name: string) => {
        setLoading(true);
        setQuery('');
        clearOtherFilters();
        setActiveCollection({ id: collectionId, name });

        try {
            let data: Movie[] = [];
            switch (collectionId) {
                case 'top_rated': data = await getTopRatedMovies(langCode); break;
                case 'popular': data = await getPopularMovies(langCode); break;
                case 'upcoming': data = await getUpcomingMovies(langCode); break;
                case 'now_playing': data = await getNowPlayingMovies(langCode); break;
            }
            setResults(data);
        } catch (error) {
            console.error("Koleksiyon hatası:", error);
        } finally {
            setLoading(false);
        }
    };

    // Yardımcı: Filtreleri Temizle
    const clearOtherFilters = () => {
        setActiveGenre(null);
        setActiveActor(null);
        setActiveCollection(null);
    };

    const resetSearch = () => {
        setQuery('');
        clearOtherFilters();
        setResults([]);
    };

    // Ekranın Aktif Başlığı
    const getScreenTitle = () => {
        if (activeActor) return activeActor.name;
        if (activeCollection) return activeCollection.name;
        if (activeGenre) return GENRES.find(g => g.id === activeGenre)?.[language === 'tr' ? 'name' : 'en'];
        return t('search_title') || 'Keşfet';
    };

    // Arama yapılmıyorsa gösterilecek "Boş Durum (Keşfet)" Ekranı
    const isExploring = !query && !activeGenre && !activeActor && !activeCollection && results.length === 0;

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>

            {/* --- ÜST KISIM (Arama Çubuğu) --- */}
            <View className="px-6 pt-4 pb-2">
                <Text className="text-white text-3xl font-black mb-6 tracking-tight">
                    {getScreenTitle()}
                </Text>

                <View className="relative mb-2">
                    <View className="absolute left-4 top-4 z-10">
                        <Ionicons name="search" size={20} color="#64748b" />
                    </View>

                    <TextInput
                        value={query}
                        onChangeText={setQuery}
                        placeholder={t('search_placeholder') || 'Film, dizi veya oyuncu ara...'}
                        placeholderTextColor="#475569"
                        autoCapitalize="none"
                        className="bg-surface text-white pl-12 pr-12 py-4 rounded-2xl border border-slate-800 text-base"
                    />

                    {(!isExploring || query.length > 0) && (
                        <TouchableOpacity onPress={resetSearch} className="absolute right-4 top-4">
                            <Ionicons name="close-circle" size={20} color="#64748b" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* --- İÇERİK BÖLÜMÜ --- */}
            <View className="flex-1">
                {isExploring ? (
                    // HİÇBİR ŞEY ARANMIYORKEN GÖSTERİLEN KEŞFET EKRANI
                    <ScrollView showsVerticalScrollIndicator={false} className="px-6 pt-4">

                        {/* Hızlı Keşfet Grid */}
                        <Text className="text-white font-bold text-lg mb-4">Hızlı Keşfet</Text>
                        <View className="flex-row flex-wrap justify-between mb-8">
                            {QUICK_COLLECTIONS.map((col) => (
                                <TouchableOpacity
                                    key={col.id}
                                    onPress={() => fetchCollection(col.id, col.name)}
                                    activeOpacity={0.8}
                                    className={`w-[48%] ${col.bg} border border-slate-800 p-4 rounded-2xl mb-4 flex-row items-center`}
                                >
                                    <View className="bg-black/20 p-2 rounded-full mr-3">
                                        <Ionicons name={col.icon as any} size={20} color={col.color} />
                                    </View>
                                    <Text className="text-white font-bold text-xs flex-1" numberOfLines={2}>
                                        {col.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Kategoriler Grid */}
                        <Text className="text-white font-bold text-lg mb-4">Kategoriler</Text>
                        <View className="flex-row flex-wrap gap-3 mb-10">
                            {GENRES.map((genre) => (
                                <TouchableOpacity
                                    key={genre.id}
                                    onPress={() => {
                                        setActiveGenre(genre.id);
                                        fetchByGenre(genre.id);
                                    }}
                                    activeOpacity={0.8}
                                    className="bg-surface border border-slate-800 px-5 py-3 rounded-full"
                                >
                                    <Text className="text-slate-300 font-bold text-xs uppercase tracking-widest">
                                        {language === 'tr' ? genre.name : genre.en}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>

                ) : loading ? (
                    <Loader />
                ) : results.length > 0 ? (
                    // --- DÜZELTİLEN KUSURSUZ 2'Lİ GRID ARAMA SONUÇLARI ---
                    <FlatList
                        data={results}
                        numColumns={2}
                        columnWrapperStyle={{ justifyContent: 'space-between' }}
                        keyExtractor={(item, index) => `${item.id}-${index}`}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100, paddingTop: 10 }}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => router.push(`/movie/${item.id}`)}
                                activeOpacity={0.8}
                                style={{ width: '48%' }}
                                className="mb-6"
                            >
                                <Image
                                    source={{ uri: getImageUrl(item.poster_path) || '' }}
                                    style={{ width: '100%', aspectRatio: 2 / 3 }} // Kaymayı ve sünüklüğü önleyen altın oran
                                    className="rounded-3xl border border-slate-800 bg-slate-800"
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
                        onScrollBeginDrag={Keyboard.dismiss}
                    />
                ) : (
                    // BULUNAMADI EKRANI
                    <View className="flex-1 justify-center items-center px-10 pb-20">
                        <View className="bg-surface p-8 rounded-full mb-6">
                            <Ionicons name="alert-circle-outline" size={50} color="#dc2626" />
                        </View>
                        <Text className="text-white text-xl font-bold text-center mb-2">
                            {t('no_results') || 'Sonuç Bulunamadı'}
                        </Text>
                        <Text className="text-slate-500 text-center leading-6">
                            "{query}" için aradığınız kriterlere uygun bir içerik yok.
                        </Text>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}