import fs from "fs";
import path from "path";
import { expect } from "@playwright/test";
import { test, chromium, Page } from "@playwright/test";

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
    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as {
      tests: TestDefinition[];
    };
  });
};

loadEvals().forEach((evals) => {
  evals.tests.forEach((testDef: TestDefinition) => {
    evalTest(`Eval Test: ${testDef.name}`, async ({ page }) => {
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
