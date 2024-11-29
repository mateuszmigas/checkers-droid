import fs from "fs";
import path from "path";
import { expect } from "@playwright/test";
import { test, chromium, Page } from "@playwright/test";

/*
1. Open Chrome with remote debugging --remote-debugging-port=9222
2. Run tests with: pnpm test:evals
*/

type TestDefinition = {
  name: string;
  prompt: string;
  criteria: {
    type: "includes" | "notIncludes";
    value: string;
  }[];
};

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

const loadEvals = () => {
  const files = fs
    .readdirSync(path.resolve("./evals"))
    .filter((file) => file.endsWith("evals.json"));

  return files.map((file) => {
    const filePath = path.join(path.resolve("./evals"), file);
    const evals = JSON.parse(fs.readFileSync(filePath, "utf-8")) as {
      tests: TestDefinition[];
    };
    const nameWithoutExtension = path.basename(file, ".evals.json");

    const formattedName = nameWithoutExtension
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/^./, (str) => str.toUpperCase());

    return {
      name: formattedName,
      evals,
    };
  });
};

loadEvals().forEach(({ name, evals }) => {
  evals.tests.forEach((testDef: TestDefinition) => {
    evalTest(`${name} - ${testDef.name}`, async ({ page }) => {
      const response = await page.evaluate(async (prompt) => {
        const session = await window.ai.languageModel.create();
        const result = await session.prompt(prompt);
        return result;
      }, testDef.prompt);

      expect(response).toBeTruthy();

      testDef.criteria.forEach((criterion) => {
        if (criterion.type === "includes") {
          expect(response).toContain(criterion.value);
        } else if (criterion.type === "notIncludes") {
          expect(response).not.toContain(criterion.value);
        }
      });
    });
  });
});
