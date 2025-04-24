// frontend/postcss.config.cjs
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},   // ← loads Tailwind core
    autoprefixer: {},             // ← still need autoprefixer
  }
}
