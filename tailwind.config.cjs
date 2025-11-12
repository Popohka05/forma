module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1E90FF',
      },
      boxShadow: {
        card: '0 6px 18px rgba(16,24,40,0.06)',
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto'],
      },
    },
  },
  plugins: [],
}
