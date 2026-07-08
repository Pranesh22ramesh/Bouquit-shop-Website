/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", "system-ui", "sans-serif"]
      },
      colors: {
        floralBg: "#fff7f8",
        floralMaroon: "#6b1b3f",
        floralGold: "#d4a24b",
        floralGreen: "#4a7c59"
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,0.06)"
      }
    }
  },
  plugins: []
};
