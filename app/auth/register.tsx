import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../src/lib/supabase';

export default function RegisterScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async () => {
        setLoading(true);

        // 1. Kullanıcıyı Kaydet
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { username } // Kullanıcı adını metadata olarak ekliyoruz
            }
        });

        if (error) {
            Alert.alert("Hata", error.message);
        } else {
            Alert.alert("Başarılı", "Hesabın oluşturuldu! Lütfen e-postanı doğrula.");
            router.replace('/auth/login');
        }
        setLoading(false);
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            <KeyboardAvoidingView className="flex-1 px-8 justify-center">
                <Text className="text-white text-4xl font-black mb-10">Yeni Hesap Oluştur</Text>

                <View className="space-y-4">
                    <TextInput
                        placeholder="Kullanıcı Adı"
                        placeholderTextColor="#475569"
                        value={username}
                        onChangeText={setUsername}
                        className="bg-surface border border-slate-800 rounded-3xl px-6 py-5 text-white text-base mb-4"
                    />
                    <TextInput
                        placeholder="E-posta"
                        placeholderTextColor="#475569"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        className="bg-surface border border-slate-800 rounded-3xl px-6 py-5 text-white text-base mb-4"
                    />
                    <TextInput
                        placeholder="Şifre"
                        placeholderTextColor="#475569"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        className="bg-surface border border-slate-800 rounded-3xl px-6 py-5 text-white text-base mb-8"
                    />
                </View>

                <TouchableOpacity
                    onPress={handleRegister}
                    className="bg-primary py-5 rounded-full"
                >
                    <Text className="text-white text-center font-black text-lg">Kayıt Ol</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.back()} className="mt-6">
                    <Text className="text-slate-500 text-center">Geri Dön</Text>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}