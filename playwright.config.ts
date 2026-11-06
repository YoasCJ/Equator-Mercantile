import { defineConfig } from "@playwright/test";

const port = process.env.PLAYWRIGHT_PORT || "4173";
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./tests/browser",
  use: {
    baseURL,
    channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
  },
  webServer: {
    command: `npm run dev -- --host 127.0.0.1 --port ${port} --strictPort`,
    url: baseURL,
    env: {
      VITE_SUPABASE_URL: "https://equator-test.invalid",
      VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_browser_test",
    },
  },
});
