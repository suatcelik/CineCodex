import axios from 'axios';

const TMDB_API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

const tmdbApi = axios.create({
    baseURL: BASE_URL,
    params: {
        api_key: TMDB_API_KEY,
        language: 'tr-TR', // Bu dinamik olarak i18n'den gelecek
    },
});

export const getTrendingMovies = async () => {
    const { data } = await tmdbApi.get('/trending/movie/week');
    return data.results;
};

export const getPopularMovies = async () => {
    const { data } = await tmdbApi.get('/movie/popular');
    return data.results;
};

// src/lib/tmdb.ts içindeki fonksiyonu buna çevir:
export const getImageUrl = (path: string | null | undefined) =>
    path ? `https://image.tmdb.org/t/p/w500${path}` : null;



// Film arama fonksiyonu
export const searchMovies = async (query: string, language: string = 'tr-TR') => {
    if (!query) return [];
    const { data } = await tmdbApi.get('/search/movie', {
        params: {
            query,
            language,
            include_adult: false, // Kullanıcının seçtiği dili kullanıyoruz
        },
    });
    return data.results;
};

export const getMovieDetails = async (movieId: number) => {
    const { data } = await tmdbApi.get(`/movie/${movieId}`, {
        params: {
            append_to_response: 'credits', // Oyuncuları da beraberinde getirir
        },
    });
    return data;
};