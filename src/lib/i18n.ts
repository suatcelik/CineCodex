import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Dil dosyalarını import ediyoruz
import en from '../locales/en.json';
import tr from '../locales/tr.json';

// 1. Kaynakları (Metinleri) tanımlıyoruz
const resources = {
    tr: { translation: tr },
    en: { translation: en },
};

// 2. Cihazın mevcut dil kodunu alıyoruz (Örn: 'tr-TR' -> 'tr')
const deviceLanguage = Localization.getLocales()[0].languageCode ?? 'en';

i18n
    .use(initReactI18next) // react-i18next modülünü bağla
    .init({
        resources,
        lng: deviceLanguage, // Başlangıç dili (Cihaz dili)
        fallbackLng: 'en',    // Eğer dil bulunamazsa varsayılan dil
        interpolation: {
            escapeValue: false, // React XSS korumasını zaten yaptığı için false
        },
        react: {
            useSuspense: false, // Expo/React Native ile uyum için false olması önerilir
        },
    });

export default i18n;