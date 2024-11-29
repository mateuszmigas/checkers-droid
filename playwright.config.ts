import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./src/prompts",
  fullyParallel: false,
  workers: 1,
  reporter: "html",
  testMatch: "**/*.eval.ts",
});

