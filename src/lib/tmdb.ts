import axios from 'axios';

const TMDB_API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

const tmdbApi = axios.create({
    baseURL: BASE_URL,
    params: {
        api_key: TMDB_API_KEY,
        language: 'tr-TR',
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

export const getImageUrl = (path: string | null | undefined) =>
    path ? `https://image.tmdb.org/t/p/w500${path}` : null;

export const searchMovies = async (query: string, language: string = 'tr-TR') => {
    if (!query) return [];
    const { data } = await tmdbApi.get('/search/movie', {
        params: {
            query,
            language,
            include_adult: false,
        },
    });
    return data.results;
};

export const getMovieDetails = async (movieId: number) => {
    const { data } = await tmdbApi.get(`/movie/${movieId}`, {
        params: {
            // credits: Oyuncular, videos: Fragmanlar, watch/providers: Platformlar, recommendations: Benzerler
            append_to_response: 'credits,videos,watch/providers,recommendations',
        },
    });
    return data;
};

// --- DÜZELTİLEN BÖLÜM ---
export const getMoviesByGenre = async (genreId: number, language: string = 'tr-TR') => {
    try {
        const { data } = await tmdbApi.get('/discover/movie', {
            params: {
                with_genres: genreId,
                language: language,
                sort_by: 'popularity.desc',
                include_adult: false,
            },
        });
        return data.results;
    } catch (error) {
        console.error("Kategori filmleri çekilemedi:", error);
        return [];
    }
};

export const getMoviesByActor = async (personId: number, language: string = 'tr-TR') => {
    try {
        const { data } = await tmdbApi.get(`/person/${personId}/movie_credits`, {
            params: { language },
        });
        // Oyuncunun en popüler filmlerini başa almak için oylama sayısına göre sıralayabiliriz
        return data.cast.sort((a: any, b: any) => b.popularity - a.popularity);
    } catch (error) {
        console.error("Oyuncu filmleri çekilemedi:", error);
        return [];
    }
};


export const getPersonDetails = async (personId: number) => {
    const { data } = await tmdbApi.get(`/person/${personId}`, {
        params: {
            append_to_response: 'movie_credits', // Filmleri de tek seferde getirir
        },
    });
    return data;
};