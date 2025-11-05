/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: { 
      
      colors: {
        // Palette “Nuvolino”
        nuv: {
          50:  '#f0fbff',
          100: '#e0f6ff',
          200: '#bae9fd',
          300: '#8fd9f7',
          400: '#5ac2ea',
          500: '#2aa7d4',     // primary
          600: '#1a8bb8',
          700: '#166f92',
          800: '#155a74',
          900: '#134a5f'
        },
        midnight: '#0b1b2b',   // testo scuro blu
        glass: 'rgba(255,255,255,0.08)'
      },
      backdropBlur: {
        xs: '2px'
      },
      boxShadow: {
        glass: '0 10px 30px rgba(0,0,0,0.15)'
      },
      borderRadius: {
        '2xl': '1.25rem'
      }
    }
  },
  plugins: []
};
