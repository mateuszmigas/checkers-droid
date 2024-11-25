import { expect } from "@playwright/test";
import { aiTest } from "./fixture";

aiTest("can create session and send prompt", async ({ page }) => {
  const response = await page.evaluate(async () => {
    const session = await window.ai.languageModel.create();
    const result = await session.prompt("Say 'Hello, World!'");
    return result;
  });

  expect(response).toBeTruthy();
  expect(response).toBe("Hello, World!");
});

aiTest("another test using the same page setup", async ({ page }) => {
  const response = await page.evaluate(async () => {
    const session = await window.ai.languageModel.create();
    const result = await session.prompt("Tell me a short joke");
    return result;
  });

  expect(response).toBeTruthy();
});

