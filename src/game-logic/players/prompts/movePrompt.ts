import { CheckerPosition } from "@/game-logic/types";
import { MoveConsequence } from "../aiPlayer";
import { z } from "zod";

const resultSchema = z.object({
  shot: z.number(),
});

const consequenceMap: Record<MoveConsequence, string> = {
  TURN_DIDNT_CHANGE: "I keep my turn",
  PROMOTED_TO_KING: "My piece became king",
  EXPOSES_TO_OPPONENT_CAPTURE: "I risk being captured",
};

const mapConsequences = (consequences: MoveConsequence[]) => {
  if (consequences.length === 0) return "Neutral move";
  return consequences
    .map((consequence) => consequenceMap[consequence])
    .join(", ");
};

const mapMove = (move: {
  from: CheckerPosition;
  to: CheckerPosition;
  consequences: MoveConsequence[];
}) => `${mapConsequences(move.consequences)}`;

const mapMoves = (
  moves: {
    from: CheckerPosition;
    to: CheckerPosition;
    consequences: MoveConsequence[];
  }[]
) => moves.map((m, i) => `${i}. ${mapMove(m)}`).join("\n");

export const createMovePrompt = (
  moves: {
    from: CheckerPosition;
    to: CheckerPosition;
    consequences: MoveConsequence[];
  }[]
) => `
Analyze the given set of possible move consequences and select the best move index based on the following criteria:
- Avoid moves that risk being captured.
- Prioritize neutral moves over risky ones.
- Return the index of the best move in the specified response format.

<Moves Consequences>
${mapMoves(moves)}
</Moves Consequences>

<Response Format>
{
  "shot": best move index
}
</Response Format>
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

// const systemPrompt = `;
// You're a billiards bot playing as a skilled but casual player. Given a set of possible shots, each with:
// - Type: direct, wall-first, double wall hit
// - Chance to score (percentage)
// - Risk of illegal shot (e.g., white ball foul)
// - Positioning advantage for the opponent after shot

// Choose the best shot based on these factors, and add a brief, player-style comment.

// <Examples>
// Shot: Direct | Chance: 85% | Risk: Low | Position: Neutral
// Message: 'Nice and easy—this one's practically in the bag!'
// Shot: Wall-first | Chance: 60% | Risk: Moderate | Position: Slight advantage
// Message: 'Tricky, but let's give it a shot. Might just surprise us both!'
// Shot: Double wall hit | Chance: 30% | Risk: High | Position: Strong advantage
// Message: 'Oof, this one's risky, but hey, go big or go home!'
// </Examples>

// <Response Format>
// Shot: [index]
// Message: [message]
// </Response Format>
// `;

// const aiTest = async () => {
//   const ai = (window as any).ai;
//   const session = await ai.assistant.create({systemPrompt});
//   console.time("aiTest");
//   const result = await session.prompt(`
// 1.Direct | Chance: 85% | Risk: Low | Position: Neutral
// 2.Wall-first | Chance: 60% | Risk: Moderate | Position: Slight advantage
// 3.Double wall hit | Chance: 30% | Risk: High | Position: Strong advantage
//     `);
//   console.timeEnd("aiTest");
//   console.log("aiTest", result);
// }

