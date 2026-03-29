// src/lib/stats.ts

export const getCommunityStats = async (movieId: number) => {
    const { data, error } = await supabase
        .from('user_interactions')
        .select('rating')
        .eq('movie_id', movieId)
        .not('rating', 'is', null);

    if (error || !data.length) return { avg: 0, count: 0 };

    const total = data.reduce((acc, curr) => acc + curr.rating, 0);
    return {
        avg: (total / data.length).toFixed(1),
        count: data.length
    };
};