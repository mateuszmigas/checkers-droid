import { expect } from "@playwright/test";
import { test, chromium, Page } from "@playwright/test";
import { welcomePromptEvals } from "./welcomePrompt.evals";

/*
1. Open Chrome with remote debugging --remote-debugging-port=9222
2. Run tests with: pnpm test:evals
*/

const evalTest = test.extend<{ page: Page }>({
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

[...welcomePromptEvals].forEach((test) => {
  evalTest(`${test.name}`, async ({ page }) => {
    const response = await page.evaluate(async (prompt) => {
      const session = await window.ai.languageModel.create();
      const result = await session.prompt(prompt);
      return result;
    }, test.prompt);

    expect(response).toBeTruthy();

    test.criteria.forEach((criterion) => {
      if (criterion.type === "includes") {
        expect(response).toContain(criterion.value);
      } else if (criterion.type === "notIncludes") {
        expect(response).not.toContain(criterion.value);
      }
    });
  });
});
