/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],

  theme: {
    extend: {
      colors: {
        primary: "#33B8B5",     
        secondary: "#144E96",  

        background: "#F8FAFC",
        card: "#FFFFFF",
        border: "#E2E8F0",

        heading: "#0F172A",
        text: "#64748B",

        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",

        sidebar: "#FFFFFF",
        sidebarHover: "#ECFEFF",
        sidebarActive: "#DDF5F4",
      },

      borderRadius: {
        xl: "14px",
        "2xl": "18px",
      },

      boxShadow: {
        card: "0 4px 20px rgba(15,23,42,.08)",
        sidebar: "0 4px 25px rgba(15,23,42,.08)",
      },

      transitionDuration: {
        400: "400ms",
      },
    },
  },

  plugins: [],
};