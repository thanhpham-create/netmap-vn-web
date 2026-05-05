import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Vietnamese flag-inspired accents
        vnred: {
          50:  '#fef2f2',
          500: '#da251d',
          600: '#b91c1c',
          700: '#991b1b',
        },
        carrier: {
          viettel:      '#ee0033',
          vnpt:         '#005bbb',
          mobifone:     '#1a76d4',
          vietnamobile: '#ff6600',
        },
      },
    },
  },
  plugins: [],
};

export default config;
