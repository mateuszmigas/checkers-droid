import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./evals",
  fullyParallel: false,
  reporter: "html",
});
