import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary colors from design guide
        primary: {
          DEFAULT: '#28CB88',
          50: '#E8F5E0',
          100: '#C8E6C9',
          200: '#A5D6A7',
          300: '#81C784',
          400: '#66BB69',
          500: '#28CB88',
          600: '#388E3B',
          700: '#237D31',
          800: '#103E13',
          900: '#103E13',
        },
        secondary: {
          DEFAULT: '#263238',
          light: '#899399',
          dark: '#103E13',
        },
        info: {
          DEFAULT: '#2194f3',
        },
        // Neutral colors
        neutral: {
          black: '#263238',
          'dark-grey': '#4D4D4D',
          grey: '#717171',
          'light-grey': '#89939E',
          'grey-blue': '#ABBED1',
          silver: '#F5F7FA',
          white: '#FFFFFF',
        },
        // Action colors
        warning: '#FBC02D',
        error: '#E53835',
        success: '#2E7D31',
        // Shades
        shade: {
          1: '#43A048',
          2: '#388E3B',
          3: '#237D31',
          4: '#1B5E1F',
          5: '#103E13',
        },
        // Tints
        tint: {
          1: '#66BB69',
          2: '#81C784',
          3: '#A5D6A7',
          4: '#C8E6C9',
          5: '#E8F5E0',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Headlines
        'h1': ['64px', { lineHeight: '76px', fontWeight: '600' }],
        'h2': ['36px', { lineHeight: '44px', fontWeight: '600' }],
        'h3': ['28px', { lineHeight: '36px', fontWeight: '600' }],
        'h4': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        // Body
        'body-1': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'body-1-medium': ['18px', { lineHeight: '28px', fontWeight: '500' }],
        'body-2': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-2-medium': ['16px', { lineHeight: '24px', fontWeight: '500' }],
        'body-3': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'body-3-medium': ['14px', { lineHeight: '20px', fontWeight: '500' }],
        'body-4': ['12px', { lineHeight: '16px', fontWeight: '400' }],
        'body-4-medium': ['12px', { lineHeight: '16px', fontWeight: '500' }],
      },
      borderRadius: {
        lg: '12px',
        md: '8px',
        sm: '4px',
      },
      boxShadow: {
        'card': '0px 2px 8px rgba(0, 0, 0, 0.08)',
        'button': '0px 1px 2px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
