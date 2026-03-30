import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
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

    // Modal her açıldığında verileri sıfırla (veya varsa mevcut notu çekmek için buraya useEffect eklenebilir)
    useEffect(() => {
        if (!isVisible) {
            setRating(0);
            setNote('');
        }
    }, [isVisible]);

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

                if (count !== null && count >= 5) {
                    // Eğer bu film için zaten bir notu varsa limit engeline takılmamalı (güncelleme serbest olmalı)
                    const { data: existingNote } = await supabase
                        .from('movie_notes')
                        .select('id')
                        .eq('user_id', user.id)
                        .eq('movie_id', movieId)
                        .single();

                    if (!existingNote && count >= 5) {
                        Alert.alert(
                            t('limit_reached') || 'Limit Doldu',
                            t('premium.sub') || 'Ücretsiz sürümde en fazla 5 not tutabilirsin.',
                            [
                                { text: t('cancel'), style: 'cancel' },
                                { text: 'Premium ✨', onPress: () => { onClose(); router.push('/premium'); } }
                            ]
                        );
                        setIsSaving(false);
                        return;
                    }
                }
            }

            // 2. Veriyi Supabase'e Kaydet (Upsert)
            // ÖNEMLİ: Tabloda user_id ve movie_id sütunlarının RLS politikasına açık olduğundan emin ol!
            const { error } = await supabase.from('movie_notes').upsert({
                user_id: user.id, // RLS için zorunlu
                movie_id: movieId,
                movie_title: movieTitle,
                rating: rating,
                note: note,
                updated_at: new Date().toISOString(),
            }, {
                onConflict: 'user_id,movie_id' // Eğer tabloda bu ikili unique ise güncelleme yapar
            });

            if (error) throw error;

            Alert.alert(t('success') || 'Başarılı', t('interaction_modal.save_btn') || 'Notun Kaydedildi!');
            onClose();
        } catch (error: any) {
            console.error("Kaydetme Hatası:", error.message);
            // RLS Hatası gelirse kullanıcıya daha anlamlı bir mesaj göster
            const errorMsg = error.message.includes('row-level security')
                ? "Veritabanı izni reddedildi. Lütfen çıkış yapıp tekrar girin veya RLS ayarlarını kontrol edin."
                : error.message;
            Alert.alert('Hata', errorMsg);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal visible={isVisible} animationType="slide" transparent statusBarTranslucent>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                className="flex-1 justify-end bg-black/70"
            >
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={onClose}
                    className="absolute inset-0"
                />

                <View className="bg-surface rounded-t-[40px] p-8 border-t border-slate-800 shadow-2xl">
                    {/* Tutamaç (Handle) */}
                    <View className="w-12 h-1.5 bg-slate-700 rounded-full self-center -mt-4 mb-6" />

                    {/* Header */}
                    <View className="flex-row justify-between items-start mb-6">
                        <View className="flex-1">
                            <Text className="text-slate-500 font-bold text-[10px] uppercase tracking-[2px] mb-1">
                                {movieTitle}
                            </Text>
                            <Text className="text-white text-2xl font-black">
                                {t('interaction_modal.title_suffix') || 'Notunu Bırak'}
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={onClose}
                            className="bg-slate-800/50 p-2 rounded-full border border-slate-700"
                        >
                            <Ionicons name="close" size={20} color="white" />
                        </TouchableOpacity>
                    </View>

                    {/* Rating Stars */}
                    <Text className="text-slate-400 font-bold mb-4 text-[10px] uppercase tracking-[3px]">
                        {t('interaction_modal.your_rating') || 'PUANIN'}
                    </Text>
                    <View className="flex-row justify-between mb-8 px-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <TouchableOpacity
                                key={star}
                                onPress={() => setRating(star)}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name={rating >= star ? "star" : "star-outline"}
                                    size={46}
                                    color={rating >= star ? "#f59e0b" : "#334155"}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Note Input */}
                    <Text className="text-slate-400 font-bold mb-4 text-[10px] uppercase tracking-[3px]">
                        {t('interaction_modal.your_note') || 'DÜŞÜNCELERİN'}
                    </Text>
                    <TextInput
                        multiline
                        numberOfLines={4}
                        placeholder={t('interaction_modal.note_placeholder') || 'Film hakkında ne düşünüyorsun?'}
                        placeholderTextColor="#64748b"
                        value={note}
                        onChangeText={setNote}
                        className="bg-background border border-slate-800 rounded-3xl p-5 text-white text-base mb-8 h-36"
                        textAlignVertical="top"
                    />

                    {/* Save Button */}
                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={isSaving || rating === 0}
                        className={`py-5 rounded-3xl items-center shadow-xl ${rating === 0 || isSaving ? 'bg-slate-800 opacity-50' : 'bg-primary shadow-primary/40'
                            }`}
                    >
                        {isSaving ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-black text-lg">
                                {t('interaction_modal.save_btn') || 'Günlüğüme Kaydet'}
                            </Text>
                        )}
                    </TouchableOpacity>

                    {/* Padding for Bottom Area */}
                    <View className="h-10" />
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}