import { CheckerPosition } from "@/game-logic/types";
import { MoveConsequence } from "@/game-logic/players/aiPlayer";
import { z } from "zod";
import { createSection, createStructuredResponse } from "@/utils/prompt";
import { coerceToNumber } from "@/utils/zod";

const resultSchema = z.object({
  shot: coerceToNumber.describe("best move index"),
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
Analyze the given set of possible move consequences and select the best move index with structured output.

${createSection("Moves Consequences", mapMoves(moves))}

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
