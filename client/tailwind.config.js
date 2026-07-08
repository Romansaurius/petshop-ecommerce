/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f4f7f2',
          100: '#e6ede3',
          200: '#cddcc7',
          300: '#b9ccb3',
          400: '#96b48e',
          500: '#7c9d70',
          600: '#658257',
          700: '#506847',
          800: '#3d5037',
          900: '#2c3a28',
        },
        secondary: {
          50:  '#faf9f6',
          100: '#f5f2eb',
          200: '#ede9dd',
          300: '#ddd7c8',
          400: '#c4bba8',
          500: '#a89e8a',
          600: '#8a7f6c',
          700: '#6b6254',
          800: '#4a4438',
          900: '#2e2a22',
        }
      },
      fontFamily: {
        sans: ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      }
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.line-clamp-2': {
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '2',
        },
      }
      addUtilities(newUtilities)
    }
  ],
}