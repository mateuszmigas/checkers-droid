import test, { expect } from "@playwright/test";
import { evalTest } from "./fixture";
const prompt = `Given the set of possible move consequences, select the best move. Avoid moves that lead to risk being captured.

<Moves Consequences>
0. Risk of capture
1. Risk of capture, Capture chance
2. Risk of capture, Capture chance
3. Risk of capture
4. Blocks opponent
5. Risk of capture
6. Risk of capture
</Moves Consequences>

<Response Format>
{
  "shot": "chosen move index"
}
</Response Format>`;

evalTest("can create session and send prompt", async ({ prompt }) => {
  const response = await prompt("How are you?");

  expect(response).toBeTruthy();
  expect(response).toBe({ shot: 4 });
});

evalTest("can create session and send prompt 2", async ({ prompt }) => {
  const response = await prompt("Say 'Hello, World!'", {
    systemPrompt: "You are a helpful assistant.",
  });

  expect(response).toBeTruthy();
  expect(response).toBe({ shot: 5 });
});

