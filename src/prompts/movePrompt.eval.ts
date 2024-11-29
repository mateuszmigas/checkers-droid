import { expect } from "@playwright/test";
import { evalTest, PromptOptions } from "./evalTest";
import { createSystemPrompt } from "./systemPrompt";
import { createMovePromptRequest, sessionOptions } from "./movePrompt";
import { runWithStructuredOutput } from "@/utils/prompt";
import { ChromeAiManagedSession } from "@/chromeAI";

const systemPrompt = createSystemPrompt("HUMAN", "trickster");

const createSession = (
  prompt: (input: string, options: PromptOptions) => Promise<string>
) =>
  ({
    prompt: (input: string) =>
      prompt(input, { systemPrompt, ...sessionOptions }),
  } as ChromeAiManagedSession);

evalTest(`should select move with capture opportunity`, async ({ prompt }) => {
  const movePromptRequest = createMovePromptRequest(
    [
      {
        from: { row: 0, col: 0 },
        to: { row: 0, col: 1 },
        consequences: ["CAPTURE_RISK"],
      },
      {
        from: { row: 0, col: 0 },
        to: { row: 0, col: 1 },
        consequences: ["CAPTURE_OPPORTUNITY"],
      },
    ],
    { shot: 2 }
  );
  const response = await runWithStructuredOutput(
    createSession(prompt),
    movePromptRequest
  );
  expect(response.data).toEqual({ shot: 1 });
});

