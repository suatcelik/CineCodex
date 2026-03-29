import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';

const API_KEY = Platform.select({
    ios: 'goog_xxx_ios_key', // RevenueCat'ten alacağın anahtar
    android: 'goog_xxx_android_key',
});

export const initPurchases = async (userId: string) => {
    if (!API_KEY) return;

    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    await Purchases.configure({ apiKey: API_KEY, appUserID: userId });
};

// Mevcut paketleri getir (Aylık, Yıllık vb.)
export const getOfferings = async () => {
    try {
        const offerings = await Purchases.getOfferings();
        if (offerings.current !== null) {
            return offerings.current.availablePackages;
        }
    } catch (e) {
        console.log("Offerings hatası:", e);
    }
    return [];
};