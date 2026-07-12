/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#1A3D7C',
          50: '#eef3fb',
          100: '#d6e2f4',
          200: '#aec5e9',
          300: '#7fa1d8',
          400: '#4f79c2',
          500: '#2f59a6',
          600: '#1A3D7C',
          700: '#173468',
          800: '#142b54',
          900: '#0f2040',
        },
        accent: {
          DEFAULT: '#F5821F',
          50: '#fff4e8',
          100: '#fee3c4',
          200: '#fdc98a',
          300: '#fbac50',
          400: '#f89327',
          500: '#F5821F',
          600: '#d96a0c',
          700: '#b3530a',
          800: '#8c410c',
          900: '#73370f',
        },
        ink: '#1F2933',
        mist: '#F4F6F9',
        success: '#28A745',
        danger: '#E63946',
        warn: '#E0A106',
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'Manrope', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 24px -8px rgba(26, 61, 124, 0.15)',
        soft: '0 2px 12px -4px rgba(31, 41, 51, 0.12)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'truck-move': {
          '0%': { transform: 'translateX(-6px)' },
          '50%': { transform: 'translateX(6px)' },
          '100%': { transform: 'translateX(-6px)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out both',
        'truck-move': 'truck-move 2.5s ease-in-out infinite',
        shimmer: 'shimmer 1.5s infinite',
      },
    },
  },
  plugins: [],
}
