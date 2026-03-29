import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, SafeAreaView, Text, TextInput, View } from 'react-native';
import MovieCard from '../../src/components/MovieCard';
import { searchMovies } from '../../src/lib/tmdb';
import { useStore } from '../../src/store/useStore'; // Zustand store'dan dil bilgisi

export default function SearchScreen() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const { language } = useStore(); // Kullanıcının seçtiği dil
    const { t } = useTranslation();

    // Arama Logic'i (Debounce özelliği ekleyerek API'yi yormayalım)
    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            return;
        }

        const delayDebounceFn = setTimeout(() => {
            setLoading(true);
            searchMovies(query, language === 'tr' ? 'tr-TR' : 'en-US').then((data) => {
                setResults(data);
                setLoading(false);
            });
        }, 500); // Kullanıcı yazmayı bıraktıktan 500ms sonra ara

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    return (
        <SafeAreaView className="flex-1 bg-background">
            {/* Header & Arama Çubuğu */}
            <View className="px-6 pt-6 pb-4 border-b border-slate-900 bg-background/90">
                <Text className="text-white text-3xl font-black mb-4 tracking-tighter">
                    {t('search_title')}
                </Text>
                <TextInput
                    value={query}
                    onChangeText={setQuery}
                    placeholder={t('search_placeholder')}
                    placeholderTextColor="#64748b" // slate-500
                    className="bg-surface text-white p-4 rounded-full border border-slate-800 text-base"
                />
            </View>

            {/* Arama Sonuçları */}
            <View className="flex-1 px-6 mt-4">
                {loading ? (
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color="#dc2626" />
                    </View>
                ) : results.length > 0 ? (
                    <FlatList
                        data={results}
                        numColumns={2}
                        columnWrapperClassName="justify-between" // İki sütun arası boşluk
                        keyExtractor={(item) => item.id.toString()}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => <MovieCard movie={item} />}
                    />
                ) : query.length >= 2 ? (
                    // Sonuç Bulunamadı Durumu
                    <View className="flex-1 justify-center items-center">
                        <Text className="text-slate-500 text-lg">
                            "{query}" {t('no_results')}
                        </Text>
                    </View>
                ) : (
                    // Boş Durum (İlk açılış)
                    <View className="flex-1 justify-center items-center px-10">
                        <Text className="text-primary text-5xl mb-4">🔍</Text>
                        <Text className="text-slate-600 text-center text-base leading-6">
                            {t('search_empty_state')}
                        </Text>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}