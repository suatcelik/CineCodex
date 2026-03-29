import { Session, User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Purchases, { CustomerInfo } from 'react-native-purchases';
import { supabase } from '../lib/supabase';

// 1. Context Tipi Tanımlama
type AuthContextType = {
    user: User | null;
    session: Session | null;
    profile: any | null;
    isPremium: boolean;
    loading: boolean;
    refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    profile: null,
    isPremium: false,
    loading: true,
    refreshProfile: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<any | null>(null);
    const [isPremium, setIsPremium] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // A. İlk açılışta oturumu al
        supabase.auth.getSession().then(({ data: { session } }) => {
            handleSession(session);
        });

        // B. Oturum değişikliklerini dinle (Giriş/Çıkış)
        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                handleSession(session);
            }
        );

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    // Oturum ve Profil Yönetimi
    const handleSession = async (currentSession: Session | null) => {
        setSession(currentSession);
        const currentUser = currentSession?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
            // 1. Supabase Profilini Getir
            await fetchProfile(currentUser.id);

            // 2. RevenueCat Yapılandırması ve Premium Kontrolü
            await setupRevenueCat(currentUser.id);
        } else {
            setProfile(null);
            setIsPremium(false);
        }
        setLoading(false);
    };

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (!error) setProfile(data);
        } catch (err) {
            console.error("Profil çekme hatası:", err);
        }
    };

    const setupRevenueCat = async (userId: string) => {
        try {
            // RevenueCat'i kullanıcı ID'si ile bağla
            await Purchases.configure({
                apiKey: Platform.OS === 'ios' ? 'YOUR_IOS_KEY' : 'YOUR_ANDROID_KEY',
                appUserID: userId
            });

            // Abonelik durumunu kontrol et
            const customerInfo: CustomerInfo = await Purchases.getCustomerInfo();
            // 'pro' RevenueCat dashboard'da tanımladığın Entitlement ID olmalı
            setIsPremium(!!customerInfo.entitlements.active['pro']);

            // Dinamik dinleyici: Abonelik durumu anlık değişirse (satın alma anı)
            Purchases.addCustomerInfoUpdateListener((info) => {
                setIsPremium(!!info.entitlements.active['pro']);
            });
        } catch (err) {
            console.error("RevenueCat hatası:", err);
        }
    };

    const refreshProfile = async () => {
        if (user) await fetchProfile(user.id);
    };

    return (
        <AuthContext.Provider value={{ user, session, profile, isPremium, loading, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom Hook: Uygulama içinde kolay erişim için
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};