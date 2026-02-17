import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['Inter', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },
      colors: {
        // Gradient-optimized color palette
        brand: {
          50: '#FEF8F5',
          100: '#FDE6DB',
          200: '#FBD4B7',
          300: '#F9B891',
          400: '#F7A06F',
          500: '#F08249',
          600: '#DC6F39',
          700: '#C25C2F',
          800: '#A84D27',
          900: '#8D3E1F',
        },
        warm: {
          cream: '#FEF5F0',
          peach: '#FFD9B3',
          orange: '#FF9D3D',
          coral: '#FF6B4A',
          brown: '#8B4513',
        },
        gradient: {
          primary: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 50%, #FDB750 100%)',
          secondary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          accent: 'linear-gradient(135deg, #F093FB 0%, #F5576C 100%)',
          cool: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          warm: 'linear-gradient(135deg, #FA8BFF 0%, #2BD2FF 90%, #2BFF88 100%)',
          sunset: 'linear-gradient(135deg, #FF6B9D 0%, #C06C84 50%, #6C567B 100%)',
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #FF6B35 0%, #F7931E 50%, #FDB750 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-accent': 'linear-gradient(135deg, #F093FB 0%, #F5576C 100%)',
        'gradient-cool': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'gradient-warm': 'linear-gradient(135deg, #FA8BFF 0%, #2BD2FF 90%, #2BFF88 100%)',
        'gradient-sunset': 'linear-gradient(135deg, #FF6B9D 0%, #C06C84 50%, #6C567B 100%)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-in-out',
        slideUp: 'slideUp 0.3s ease-out',
        slideDown: 'slideDown 0.3s ease-out',
      },
    },
  },
  plugins: [],
}

export default config
