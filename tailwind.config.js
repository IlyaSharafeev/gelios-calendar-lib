/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,vue}'
  ],
  theme: {
    extend: {
      flex: {
        '2': '2 2 0%',
        '3': '3 3 0%'
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        }
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-in-out forwards',
        'fade-in': 'fadeIn 0.5s ease-in-out forwards'
      },
      colors: {
        gblack: {
          100: 'rgba(var(--color-gelios-black), 1)',
          80: 'rgba(var(--color-gelios-black), 0.8)',
          70: 'rgba(var(--color-gelios-black), 0.7)',
          66: 'rgba(var(--color-gelios-black), 0.66)',
          60: 'rgba(var(--color-gelios-black), 0.6)',
          50: 'rgba(var(--color-gelios-black), 0.5)',
          30: 'rgba(var(--color-gelios-black), 0.3)',
          20: 'rgba(var(--color-gelios-black), 0.2)',
          15: 'rgba(var(--color-gelios-black), 0.15)',
          10: 'rgba(var(--color-gelios-black), 0.1)',
          5: 'rgba(var(--color-gelios-black), 0.05)',
          3: 'rgba(var(--color-gelios-black), 0.03)'
        },
        gblue: {
          100: 'rgba(var(--color-gelios-blue), 1)',
          60: 'rgba(var(--color-gelios-blue), 0.6)',
          50: 'rgba(var(--color-gelios-blue), 0.6)',
          30: 'rgba(var(--color-gelios-blue), 0.3)',
          20: 'rgba(var(--color-gelios-blue), 0.2)',
          10: 'rgba(var(--color-gelios-blue), 0.1)',
          5: 'rgba(var(--color-gelios-blue), 0.05)'
        },
        gred: {
          100: 'rgba(var(--color-gelios-red), 1)',
          10: 'rgba(var(--color-gelios-red), 0.1)',
          5: 'rgba(var(--color-gelios-red), 0.05)'
        },
        gwhite: {
          100: 'rgba(var(--color-gelios-white), 1)',
          10: 'rgba(var(--color-gelios-white), 0.1)'
        },
        'ggrey-bg': '#f3f3f5',
        'ggrey-bg2': '#f9f9f9',
        'ggrey-stroke': '#bcc8d3',
        'ggrey-stroke2': '#eceff2',
      }
    }
  },
  plugins: []
}

