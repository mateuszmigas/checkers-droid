import { TestDefinition } from "./testDefinition";

export const welcomePromptEvals: TestDefinition[] = [
  {
    name: "eventPrompt3",
    prompt: `Given the set of possible move consequences, select the best move. Avoid moves that lead to risk being captured.

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
</Response Format>`,
    criteria: [
      { type: "includes", value: "event" },
      { type: "notIncludes", value: "event" },
    ],
  },
];
