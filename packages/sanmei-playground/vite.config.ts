import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // sanmei-bff がデフォルト 3000 番で起動される前提
      "/api": "http://localhost:3000",
    },
  },
});

