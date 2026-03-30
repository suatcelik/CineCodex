/** @type {import('tailwindcss').Config} */
module.exports = {
  // 1. Hangi dosyalarda Tailwind sınıflarının taranacağını belirliyoruz
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Uygulamanın Ana Renkleri
        primary: "#dc2626",    // CineCodex Kırmızısı (red-600)
        background: "#020617", // Çok koyu lacivert/siyah (slate-950)
        surface: "#0f172a",    // Kartlar ve Inputlar için (slate-900)
        accent: "#f59e0b",     // Yıldızlar ve Premium vurgular için (amber-500)

        // Yardımcı Renk Paleti (Slate serisi)
        secondary: {
          500: "#64748b",
          700: "#334155",
          800: "#1e293b",
        }
      },
      // Özel Yazı Tipleri (Eğer Google Fonts yüklediysen buraya ekleyebilirsin)
      fontFamily: {
        black: ["Inter-Black", "sans-serif"],
        bold: ["Inter-Bold", "sans-serif"],
        medium: ["Inter-Medium", "sans-serif"],
      },
      // Özel Köşe Ovalleştirme
      borderRadius: {
        '4xl': '40px',
      }
    },
  },
  plugins: [],
};