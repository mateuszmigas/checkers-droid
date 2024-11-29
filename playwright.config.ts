import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./evals",
  fullyParallel: false,
  workers: 1,
  reporter: "html",
  testMatch: "**/*.eval.ts",
});

