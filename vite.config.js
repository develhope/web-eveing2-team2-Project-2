import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  plugins: [react(), svgr()],
  server: {
    host: true,       //permette accesso da localhost e rete
    port: 5173,       //puoi cambiarla se serve
    strictPort: false //usa una porta libera se 5173 è occupata
  }
});
