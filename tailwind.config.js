/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
        },
      },
      boxShadow: {
        card: '0 4px 12px -2px rgba(16,24,40,0.06), 0 2px 4px -1px rgba(16,24,40,0.04)',
      },
      keyframes: {
        slideUp: { '0%': { opacity: 0, transform: 'translateY(8px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        ping1: { '0%,100%': { transform: 'scale(1)', opacity: 1 }, '50%': { transform: 'scale(1.6)', opacity: 0 } },
        bounceSlow: { '0%, 100%': { transform: 'translateY(-20%)', animationTimingFunction: 'cubic-bezier(0.8,0,1,1)' }, '50%': { transform: 'none', animationTimingFunction: 'cubic-bezier(0,0,0.2,1)' } },
      },
      animation: {
        'slide-up': 'slideUp .2s ease-out',
        'ping1': 'ping1 1.6s ease-in-out infinite',
        'bounce-slow': 'bounceSlow 3s infinite',
      },
    },
  },
  plugins: [],
};
