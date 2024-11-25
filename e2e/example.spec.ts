import { test, expect, chromium } from "@playwright/test";

test("has title", async () => {
  const browser = await chromium.connectOverCDP("http://localhost:9222");
  const context = browser.contexts()[0] || (await browser.newContext());
  const page = await context.newPage();

  await page.goto("http://localhost:5173/");

  const ss = await page.evaluate(async () => {
    const capabilities = await window.ai.languageModel.capabilities();
    return capabilities.available;
  });

  expect(ss).toBe("readily2");
  await page.close();
});

