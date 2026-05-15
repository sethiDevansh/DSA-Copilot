/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,html}",
    "./public/**/*.html",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand palette — deep space noir with electric accents
        brand: {
          50:  '#edfcff',
          100: '#d6f7ff',
          200: '#a8f0ff',
          300: '#5ce6ff',
          400: '#09d2f5',
          500: '#00b9e0',
          600: '#0093bb',
          700: '#007598',
          800: '#05607c',
          900: '#0a5069',
          950: '#043347',
        },
        accent: {
          50:  '#fff0fe',
          100: '#ffdefe',
          200: '#ffbdfd',
          300: '#ff8efb',
          400: '#fd53f5',
          500: '#ef21e8',
          600: '#ce0ec8',
          700: '#a90da5',
          800: '#8b1085',
          900: '#741270',
          950: '#4d0049',
        },
        surface: {
          0:   '#09090b',
          50:  '#0f0f12',
          100: '#141418',
          200: '#1c1c22',
          300: '#26262f',
          400: '#313140',
          500: '#3d3d52',
          600: '#52526d',
          700: '#737394',
          800: '#9b9bba',
          900: '#c4c4d8',
          950: '#e8e8f2',
        },
      },
      fontFamily: {
        display: ['"Space Mono"', 'monospace'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'slide-in-right': 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-up':    'slideInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in':        'fadeIn 0.2s ease-out',
        'pulse-glow':     'pulseGlow 2s ease-in-out infinite',
        'spin-slow':      'spin 3s linear infinite',
        'bounce-subtle':  'bounceSubtle 1s ease-in-out infinite',
        'shimmer':        'shimmer 2s linear infinite',
        'count-up':       'countUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        slideInRight: {
          from: { transform: 'translateX(100%)', opacity: 0 },
          to:   { transform: 'translateX(0)',    opacity: 1 },
        },
        slideInUp: {
          from: { transform: 'translateY(20px)', opacity: 0 },
          to:   { transform: 'translateY(0)',    opacity: 1 },
        },
        fadeIn: {
          from: { opacity: 0 },
          to:   { opacity: 1 },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(9, 210, 245, 0.3)' },
          '50%':      { boxShadow: '0 0 20px rgba(9, 210, 245, 0.8)' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-4px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        countUp: {
          from: { transform: 'translateY(10px)', opacity: 0 },
          to:   { transform: 'translateY(0)',    opacity: 1 },
        },
      },
      backgroundImage: {
        'gradient-radial':  'radial-gradient(var(--tw-gradient-stops))',
        'gradient-mesh':    'radial-gradient(at 40% 20%, hsla(191,100%,50%,0.1) 0, transparent 50%), radial-gradient(at 80% 0%, hsla(280,100%,60%,0.08) 0, transparent 50%), radial-gradient(at 0% 50%, hsla(191,80%,40%,0.08) 0, transparent 50%)',
        'grid-pattern':     'linear-gradient(rgba(9,210,245,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(9,210,245,0.05) 1px, transparent 1px)',
        'shimmer-gradient': 'linear-gradient(90deg, transparent 25%, rgba(9,210,245,0.1) 50%, transparent 75%)',
      },
      backgroundSize: {
        'grid': '32px 32px',
      },
      boxShadow: {
        'brand':    '0 0 15px rgba(9, 210, 245, 0.3)',
        'brand-lg': '0 0 30px rgba(9, 210, 245, 0.5)',
        'accent':   '0 0 15px rgba(239, 33, 232, 0.3)',
        'card':     '0 1px 3px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
        'card-hover': '0 4px 20px rgba(0,0,0,0.6), 0 0 0 1px rgba(9,210,245,0.2)',
        'panel':    '0 25px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06)',
        'glow-sm':  '0 0 8px rgba(9,210,245,0.4)',
      },
      borderColor: {
        DEFAULT: 'rgba(255,255,255,0.08)',
      },
    },
  },
  plugins: [],
};
