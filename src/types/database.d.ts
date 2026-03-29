export interface UserNote {
    id: string; // uuid
    user_id: string;
    movie_id: number;
    movie_title: string;
    rating: number; // 1-5 arası
    note: string;
    updated_at: string; // ISO date string
}

export interface UserProfile {
    id: string;
    username: string;
    avatar_url?: string;
    is_premium: boolean;
    created_at: string;
}