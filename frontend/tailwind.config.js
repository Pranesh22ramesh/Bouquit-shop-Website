/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", "system-ui", "sans-serif"],
        serif: ["Cormorant Garamond", "Georgia", "serif"],
      },
      colors: {
        // Royal Botanical Luxury Palette
        floralBg: "#FAF5EE",
        floralPrimary: "#651F3C",
        floralAccent: "#F6ECE7",
        // Named tokens
        burgundy: "#651F3C",
        "burgundy-hover": "#4D172D",
        gold: "#C5A15B",
        "gold-hover": "#AD8946",
        ivory: "#FAF5EE",
        plum: "#30232A",
        "dusty-rose": "#D9B8B8",
        sage: "#78836B",
        "soft-rose": "#F6ECE7",
        "border-luxury": "#E8DDD5",
        // Dark mode
        "dark-bg": "#160F17",
        "dark-card": "#231722",
        "dark-primary": "#A64B6B",
        "dark-gold": "#D5B36C",
        "dark-border": "#493640",
      },
      boxShadow: {
        soft: "0 18px 45px rgba(15, 23, 42, 0.08)",
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
        burgundy: "0 12px 30px rgba(101, 31, 60, 0.25)",
        "burgundy-lg": "0 16px 40px rgba(101, 31, 60, 0.35)",
      },
      animation: {
        'spin-slow': 'spin 12s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'fadeInUp': 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fadeIn': 'fadeIn 0.5s ease-out both',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeInUp: {
          'from': { opacity: 0, transform: 'translateY(20px)' },
          'to': { opacity: 1, transform: 'translateY(0)' },
        },
        fadeIn: {
          'from': { opacity: 0 },
          'to': { opacity: 1 },
        }
      }
    },
  },
  plugins: [],
};
