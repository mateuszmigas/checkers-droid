import { defineConfig } from "@playwright/test";

// to run e2e test first start chrome with --remote-debugging-port=9222
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  reporter: "html",
});

