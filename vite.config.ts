import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/expenses/", // <-- Add this line (include the trailing slashes)
  plugins: [react(), tailwindcss()],
});
