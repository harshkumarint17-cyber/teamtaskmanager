/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dp: {
          bg:      '#0e0a1e',
          surface: '#160c2e',
          raised:  '#1c1238',
          high:    '#221844',
          border:  '#2d1d5a',
          bsoft:   '#1e1440',
          bstrong: '#3d2a7a',
        }
      }
    }
  },
  plugins: [],
}
