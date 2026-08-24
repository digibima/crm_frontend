import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    host: "0.0.0.0", // ya host: true
    port: 3334,

    proxy: {
      "/api": {
        target: "http://192.168.29.182:3333/",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});