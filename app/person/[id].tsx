import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

export default function PersonDetailScreen() {
    const { id } = useLocalSearchParams();
    return (
        <View className="flex-1 bg-background justify-center items-center">
            <Text className="text-white">Oyuncu ID: {id}</Text>
        </View>
    );
}