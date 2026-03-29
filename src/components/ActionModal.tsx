import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, KeyboardAvoidingView, Modal, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface ActionModalProps {
    isVisible: boolean;
    onClose: () => void;
    movieId: number;
    movieTitle: string;
}

export default function ActionModal({ isVisible, onClose, movieId, movieTitle }: ActionModalProps) {
    const { t } = useTranslation();
    const { user, isPremium } = useAuth();
    const router = useRouter();

    const [rating, setRating] = useState(0);
    const [note, setNote] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!user) {
            Alert.alert(t('error'), t('login_required'));
            return;
        }

        setIsSaving(true);

        try {
            // 1. Premium Değilse Limit Kontrolü Yap
            if (!isPremium) {
                const { count, error: countError } = await supabase
                    .from('movie_notes')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id);

                if (count && count >= 5) {
                    Alert.alert(
                        t('limit_reached'),
                        t('premium.sub'),
                        [
                            { text: t('cancel'), style: 'cancel' },
                            { text: 'Premium ✨', onPress: () => { onClose(); router.push('/premium'); } }
                        ]
                    );
                    setIsSaving(false);
                    return;
                }
            }

            // 2. Veriyi Supabase'e Kaydet (Upsert: Varsa Güncelle, Yoksa Ekle)
            const { error } = await supabase.from('movie_notes').upsert({
                user_id: user.id,
                movie_id: movieId,
                movie_title: movieTitle,
                rating: rating,
                note: note,
                updated_at: new Date(),
            });

            if (error) throw error;

            Alert.alert(t('success'), t('interaction_modal.save_btn'));
            onClose();
        } catch (error: any) {
            Alert.alert('Hata', error.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal visible={isVisible} animationType="slide" transparent>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1 justify-end bg-black/60"
            >
                <View className="bg-surface rounded-t-[40px] p-8 border-t border-slate-800">

                    {/* Header */}
                    <View className="flex-row justify-between items-center mb-6">
                        <View className="flex-1">
                            <Text className="text-slate-500 font-bold text-xs uppercase tracking-widest">
                                {movieTitle}
                            </Text>
                            <Text className="text-white text-2xl font-black">
                                {t('interaction_modal.title_suffix')}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={onClose} className="bg-slate-800 p-2 rounded-full">
                            <Ionicons name="close" size={20} color="white" />
                        </TouchableOpacity>
                    </View>

                    {/* Rating Stars */}
                    <Text className="text-slate-400 font-bold mb-3 text-[10px] uppercase tracking-[3px]">
                        {t('interaction_modal.your_rating')}
                    </Text>
                    <View className="flex-row justify-between mb-8">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <TouchableOpacity key={star} onPress={() => setRating(star)}>
                                <Ionicons
                                    name={rating >= star ? "star" : "star-outline"}
                                    size={44}
                                    color={rating >= star ? "#f59e0b" : "#334155"}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Note Input */}
                    <Text className="text-slate-400 font-bold mb-3 text-[10px] uppercase tracking-[3px]">
                        {t('interaction_modal.your_note')}
                    </Text>
                    <TextInput
                        multiline
                        numberOfLines={4}
                        placeholder={t('interaction_modal.note_placeholder')}
                        placeholderTextColor="#64748b"
                        value={note}
                        onChangeText={setNote}
                        className="bg-background border border-slate-800 rounded-3xl p-5 text-white text-base mb-8 h-32"
                        textAlignVertical="top"
                    />

                    {/* Save Button */}
                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={isSaving || rating === 0}
                        className={`py-5 rounded-full items-center shadow-xl ${rating === 0 ? 'bg-slate-800' : 'bg-primary shadow-primary/30'
                            }`}
                    >
                        <Text className="text-white font-black text-lg">
                            {isSaving ? '...' : t('interaction_modal.save_btn')}
                        </Text>
                    </TouchableOpacity>

                    <View className="h-6" />
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}