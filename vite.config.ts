import netlifyPlugin from "@netlify/vite-plugin-react-router";
import { reactRouter } from "@react-router/dev/vite";
import basicSsl from "@vitejs/plugin-basic-ssl";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), basicSsl(), netlifyPlugin()],
  resolve: {
    tsconfigPaths: true,
  },
});
