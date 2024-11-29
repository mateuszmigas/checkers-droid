import { CheckerPosition } from "@/game-logic/types";
import { z } from "zod";
import { createSection, createStructuredResponse } from "@/utils/prompt";
import { coerceToNumber } from "@/utils/zod";
import { MoveConsequence } from "@/game-logic/moveConsequence";
import { translateMoveConsequence } from "@/utils/translator";

const resultSchema = z.object({
  shot: coerceToNumber.describe("chosen move index"),
});

const movesToString = (
  moves: {
    from: CheckerPosition;
    to: CheckerPosition;
    consequences: MoveConsequence[];
  }[]
) =>
  moves
    .map(
      (m, i) =>
        `${i}. ${m.consequences.map(translateMoveConsequence).join(", ")}`
    )
    .join("\n");

export const createMovePrompt = (
  moves: {
    from: CheckerPosition;
    to: CheckerPosition;
    consequences: MoveConsequence[];
  }[]
) => `
Given the set of possible move consequences, select the best move. Avoid moves that lead to risk being captured.

${createSection("Moves Consequences", movesToString(moves))}

${createStructuredResponse(resultSchema)}
`;

export const createMovePromptRequest = (
  moves: {
    from: CheckerPosition;
    to: CheckerPosition;
    consequences: MoveConsequence[];
  }[],
  defaultValue: z.infer<typeof resultSchema>,
  validator?: (result: z.infer<typeof resultSchema>) => boolean | string
) => ({
  prompt: createMovePrompt(moves),
  resultSchema,
  defaultValue,
  validator,
});

export const sessionOptions = {
  topK: 1,
  temperature: 1,
};

/* Example
Given the set of possible move consequences, select the best move. Avoid moves that lead to risk being captured.

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
</Response Format>
*/

