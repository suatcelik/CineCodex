import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Keyboard, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Loader from '../../src/components/Loader';
import MovieCard from '../../src/components/MovieCard';
import { searchMovies } from '../../src/lib/tmdb';
import { useStore } from '../../src/store/useStore';
import { Movie } from '../../src/types/movie';

export default function SearchScreen() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(false);
    const { language } = useStore();
    const { t } = useTranslation();

    // Arama Fonksiyonu (Debounce uygulanmış)
    useEffect(() => {
        if (query.trim().length < 2) {
            setResults([]);
            setLoading(false);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setLoading(true);
            try {
                const langCode = language === 'tr' ? 'tr-TR' : 'en-US';
                const data = await searchMovies(query, langCode);
                setResults(data);
            } catch (error) {
                console.error("Arama hatası:", error);
            } finally {
                setLoading(false);
            }
        }, 600); // Kullanıcı yazmayı bıraktıktan 600ms sonra API'ye gider

        return () => clearTimeout(delayDebounceFn);
    }, [query, language]);

    return (
        <SafeAreaView className="flex-1 bg-background">
            {/* 1. Üst Kısım: Arama Çubuğu */}
            <View className="px-6 pt-4 pb-2">
                <Text className="text-white text-3xl font-black mb-6 tracking-tight">
                    {t('search_title')}
                </Text>

                <View className="relative">
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

                    {query.length > 0 && (
                        <TouchableOpacity
                            onPress={() => { setQuery(''); setResults([]); }}
                            className="absolute right-4 top-4"
                        >
                            <Ionicons name="close-circle" size={20} color="#64748b" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* 2. Sonuç Alanı */}
            <View className="flex-1 px-6 mt-4">
                {loading ? (
                    <Loader />
                ) : results.length > 0 ? (
                    <FlatList
                        data={results}
                        numColumns={2}
                        columnWrapperClassName="justify-between"
                        keyExtractor={(item) => item.id.toString()}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        renderItem={({ item }) => <MovieCard movie={item} />}
                        onScrollBeginDrag={Keyboard.dismiss} // Kaydırırken klavyeyi kapat
                    />
                ) : query.length >= 2 ? (
                    // Sonuç Bulunamadı
                    <View className="flex-1 justify-center items-center px-10">
                        <Ionicons name="alert-circle-outline" size={60} color="#1e293b" />
                        <Text className="text-slate-500 text-center text-lg mt-4 font-medium">
                            "{query}" {t('no_results')}
                        </Text>
                    </View>
                ) : (
                    // Boş Durum (İlk açılış)
                    <View className="flex-1 justify-center items-center px-10">
                        <View className="bg-surface p-8 rounded-full mb-6">
                            <Ionicons name="film-outline" size={50} color="#dc2626" />
                        </View>
                        <Text className="text-white text-xl font-bold text-center mb-2">
                            {t('search_empty_state')}
                        </Text>
                        <Text className="text-slate-500 text-center leading-6">
                            {language === 'tr'
                                ? 'Milyonlarca film ve dizi arasından dilediğini bul, notlarını tutmaya başla.'
                                : 'Find any movie among millions and start keeping your notes.'}
                        </Text>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}