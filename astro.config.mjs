import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import vercel from "@astrojs/vercel";
// import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
    output: 'server',
    adapter: vercel({
        webAnalytics: { enabled: true },   
    }),
    vite: {
        plugins: [tailwindcss()],
    },
});
