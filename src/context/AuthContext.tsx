import { Session, User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Purchases from 'react-native-purchases';
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
            // 3. Çıkış İşlemleri
            setProfile(null);
            setIsPremium(false);

            // Güvenli çıkış: Yapılandırılmamışsa bile hata vermemesi için try-catch
            try {
                await Purchases.logOut();
            } catch (e) {
                // Sessizce geç
            }
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
            // RevenueCat'i yapılandır (Doğrudan deniyoruz, catch ile hatayı yönetiyoruz)
            await Purchases.configure({
                apiKey: Platform.OS === 'ios' ? 'YOUR_IOS_KEY' : 'test_aKZOpOpanLygSVPmyLVbPdBCFLn',
                appUserID: userId
            });

            // İlk abonelik kontrolü
            const customerInfo = await Purchases.getCustomerInfo();
            setIsPremium(!!customerInfo.entitlements.active['CineCodex Pro']);

            // Dinamik dinleyici: Satın alma anında tetiklenir
            Purchases.addCustomerInfoUpdateListener((info) => {
                setIsPremium(!!info.entitlements.active['CineCodex Pro']);
            });

        } catch (err: any) {
            // Eğer zaten yapılandırıldı hatası gelirse, sadece bilgileri güncelle
            if (err.message?.includes("already set") || err.message?.includes("instance already set")) {
                try {
                    const info = await Purchases.getCustomerInfo();
                    setIsPremium(!!info.entitlements.active['CineCodex Pro']);
                } catch (innerErr) {
                    // Veri çekilemezse sessiz kal
                }
                return;
            }
            console.log("RevenueCat Yapılandırma Notu:", err.message);
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

// Custom Hook
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};