import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AppState {
    hasOnboarded: boolean;
    language: string;
    setHasOnboarded: (val: boolean) => void;
    setLanguage: (lang: string) => void;
}

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            hasOnboarded: false,
            language: 'tr',
            setHasOnboarded: (val) => set({ hasOnboarded: val }),
            setLanguage: (lang) => set({ language: lang }),
        }),
        {
            name: 'sinenot-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);