import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // server: {
  //   port: 5175,
  //   strictPort: true, // This forces it to fail if 5175 is already in use, instead of silently picking 5176
  // }
});
