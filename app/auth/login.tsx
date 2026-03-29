import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../src/lib/supabase';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { t } = useTranslation();

    const handleLogin = async () => {
        if (!email || !password) return;
        setLoading(true);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            Alert.alert("Hata", error.message);
        } else {
            router.replace('/(tabs)');
        }
        setLoading(false);
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1 px-8 justify-center"
            >
                <View className="mb-12">
                    <Text className="text-white text-5xl font-black mb-2">CineCodex</Text>
                    <Text className="text-slate-500 text-lg font-medium">Günlüğüne kaldığın yerden devam et.</Text>
                </View>

                <View className="space-y-4">
                    {/* Email Input */}
                    <View className="bg-surface border border-slate-800 rounded-3xl px-6 py-5 flex-row items-center">
                        <Ionicons name="mail-outline" size={20} color="#64748b" />
                        <TextInput
                            placeholder="E-posta"
                            placeholderTextColor="#475569"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            className="flex-1 ml-4 text-white text-base"
                        />
                    </View>

                    {/* Password Input */}
                    <View className="bg-surface border border-slate-800 rounded-3xl px-6 py-5 flex-row items-center mt-4">
                        <Ionicons name="lock-closed-outline" size={20} color="#64748b" />
                        <TextInput
                            placeholder="Şifre"
                            placeholderTextColor="#475569"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            className="flex-1 ml-4 text-white text-base"
                        />
                    </View>
                </View>

                <TouchableOpacity
                    onPress={handleLogin}
                    disabled={loading}
                    className="bg-primary py-5 rounded-full mt-10 shadow-xl shadow-primary/30"
                >
                    <Text className="text-white text-center font-black text-lg">
                        {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => router.push('/auth/register')}
                    className="mt-8"
                >
                    <Text className="text-slate-500 text-center font-bold">
                        Hesabın yok mu? <Text className="text-primary">Kayıt Ol</Text>
                    </Text>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}