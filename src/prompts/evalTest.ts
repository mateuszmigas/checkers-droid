import { test, chromium, Page } from "@playwright/test";

/*
1. Open Chrome with remote debugging --remote-debugging-port=9222
2. Run tests with: pnpm test:evals
*/

type TestFixtures = {
  page: Page;
  prompt: (prompt: string, options?: { systemPrompt?: string }) => Promise<any>;
};

export type PromptOptions = {
  systemPrompt?: string;
  topK?: number;
  temperature?: number;
};

export const evalTest = test.extend<TestFixtures>({
  page: async ({}, use) => {
    const browser = await chromium.connectOverCDP("http://localhost:9222");
    const context = browser.contexts()[0] || (await browser.newContext());
    const page = await context.newPage();

    try {
      await page.goto("http://localhost:5010/");
      await use(page);
    } finally {
      await page.close();
    }
  },
  prompt: async ({ page }, use) => {
    await use(async (prompt: string, options?: PromptOptions) => {
      await test.step("Prompt", async () => {
        if (options?.systemPrompt) {
          test.info().annotations.push({
            type: "System Prompt",
            description: options.systemPrompt,
          });
        }
        test.info().annotations.push({
          type: "Prompt Text",
          description: prompt,
        });
      });

      const result = await test.step("AI Response", async () => {
        const result = await page.evaluate(
          async (args: [string, PromptOptions | undefined]) => {
            const [promptText, options] = args;
            const session = await window.ai.languageModel.create({
              ...options,
            });
            return await session.prompt(promptText);
          },
          [prompt, options] as [string, PromptOptions | undefined]
        );

        test.info().annotations.push({
          type: "Result",
          description: JSON.stringify(result, null, 2),
        });

        return result;
      });

      return result;
    });
  },
});

