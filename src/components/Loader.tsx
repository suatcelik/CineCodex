import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Text, View } from 'react-native';

interface LoaderProps {
    fullScreen?: boolean; // Tüm ekranı mı kaplasın?
    message?: string;      // Altında özel bir yazı görünsün mü?
}

export default function Loader({ fullScreen = false, message }: LoaderProps) {
    const { t } = useTranslation();

    const containerStyle = fullScreen
        ? "flex-1 justify-center items-center bg-background" // Tam ekran koyu arka plan
        : "py-10 justify-center items-center";               // Sadece bulunduğu yer kadar

    return (
        <View className={containerStyle}>
            {/* ActivityIndicator: iOS'te gri çark, Android'de dönen daire olur.
          color="#dc2626" (primary - kırmızı) ile marka rengimizi veriyoruz.
      */}
            <ActivityIndicator size={fullScreen ? "large" : "small"} color="#dc2626" />

            {(message || fullScreen) && (
                <Text className="text-slate-500 mt-4 font-medium tracking-wide">
                    {message || t('loading', 'Yükleniyor...')}
                </Text>
            )}
        </View>
    );
}