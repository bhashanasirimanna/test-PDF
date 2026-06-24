import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
        // Brand palette sourced from Figma design tokens
        brand: {
          purple: '#693b89',        // Brand Primary / Brand-purple
          primary: '#551b8c',       // primary action buttons
          'primary-hover': '#46176f',
          light: '#e2d4ed',         // Primary-Purple-100 (tints, avatars)
          tint: 'rgba(146,31,255,0.14)', // round add-button background
          blue: '#2d9cdb',          // Brand Secondary / Brand-Sec-blue
          cyan: '#00979d',          // Brand Secondary / Brand-Sec-Cyan
        },
      },
      animation: {
        'pulse-once': 'pulse 0.3s ease-in-out',
        'fade-in': 'fadeIn 0.1s ease-in',
        'slide-in': 'slideIn 0.15s ease-out',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideIn: { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
      },
    },
  },
  plugins: [],
};

export default config;
