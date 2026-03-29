import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface ActionModalProps {
    isVisible: boolean;
    onClose: () => void;
    movieId: number;
    movieTitle: string;
}

export default function ActionModal({ isVisible, onClose, movieId, movieTitle }: ActionModalProps) {
    const [rating, setRating] = useState(0);
    const [note, setNote] = useState('');
    const [status, setStatus] = useState<'watched' | 'watchlist'>('watched');
    const { user } = useAuth();

    const handleSave = async () => {
        const { error } = await supabase.from('user_interactions').insert({
            user_id: user?.id,
            movie_id: movieId,
            rating: rating,
            note: note,
            status: status,
            media_type: 'movie'
        });

        if (!error) onClose();
    };

    return (
        <Modal visible={isVisible} animationType="slide" transparent>
            <View className="flex-1 justify-end bg-black/60">
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                    <View className="bg-surface p-8 rounded-t-[40px] border-t border-slate-800">
                        {/* Sürükleme Çubuğu Görüntüsü */}
                        <View className="w-12 h-1.5 bg-slate-800 rounded-full self-center mb-6" />

                        <Text className="text-white text-2xl font-black mb-1">{movieTitle}</Text>
                        <Text className="text-slate-500 mb-6 font-medium">Bu yapım hakkında ne düşünüyorsun?</Text>

                        {/* Durum Seçimi (Segmented Control) */}
                        <View className="flex-row bg-background p-1.5 rounded-2xl mb-6">
                            <TouchableOpacity
                                onPress={() => setStatus('watched')}
                                className={`flex-1 py-3 rounded-xl ${status === 'watched' ? 'bg-slate-800' : ''}`}
                            >
                                <Text className={`text-center font-bold ${status === 'watched' ? 'text-white' : 'text-slate-500'}`}>İzledim</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setStatus('watchlist')}
                                className={`flex-1 py-3 rounded-xl ${status === 'watchlist' ? 'bg-slate-800' : ''}`}
                            >
                                <Text className={`text-center font-bold ${status === 'watchlist' ? 'text-white' : 'text-slate-500'}`}>İzleyeceğim</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Yıldız Puanlama (1-10) */}
                        <Text className="text-slate-400 font-bold mb-3 uppercase tracking-widest text-xs">Puanın</Text>
                        <View className="flex-row justify-between mb-8">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <TouchableOpacity key={star} onPress={() => setRating(star * 2)}>
                                    <Text className={`text-4xl ${rating >= star * 2 ? 'text-accent' : 'text-slate-800'}`}>★</Text>
                                </TouchableOpacity>
                            ))}
                            <Text className="text-accent text-3xl font-black ml-2 self-center">{rating}/10</Text>
                        </View>

                        {/* Not Girişi */}
                        <Text className="text-slate-400 font-bold mb-3 uppercase tracking-widest text-xs">Kişisel Notun</Text>
                        <TextInput
                            multiline
                            numberOfLines={4}
                            placeholder="Filmle ilgili düşüncelerini buraya dök..."
                            placeholderTextColor="#475569"
                            value={note}
                            onChangeText={setNote}
                            className="bg-background text-white p-5 rounded-3xl border border-slate-800 text-base mb-8 h-32"
                            textAlignVertical="top"
                        />

                        {/* Kaydet Butonu */}
                        <TouchableOpacity
                            onPress={handleSave}
                            className="bg-primary py-5 rounded-full shadow-xl shadow-primary/20"
                        >
                            <Text className="text-white text-center font-black text-lg">Günlüğüme Kaydet</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}