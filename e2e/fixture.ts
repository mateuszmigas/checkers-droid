import { test, chromium, Page } from "@playwright/test";

type MyFixtures = {
  page: Page;
};

export const aiTest = test.extend<MyFixtures>({
  page: async ({}, use) => {
    const browser = await chromium.connectOverCDP("http://localhost:9222");
    const context = browser.contexts()[0] || (await browser.newContext());
    const page = await context.newPage();

    try {
      await page.goto("http://localhost:5173/");
      await use(page);
    } finally {
      await page.close();
    }
  },
});

