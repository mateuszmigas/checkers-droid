import { GameEvent } from "@/game-logic/gameEvent";
import { aiPlayerEmotions, PlayerType } from "@/game-logic/types";
import { z } from "zod";
import { coerceToEnum } from "@/utils/zod";
import { createSection, createStructuredResponse } from "@/utils/prompt";
import { translateEvent } from "@/utils/translator";

const promptEventTypes: GameEvent["type"][] = [
  "PIECE_MOVED",
  "PIECE_CAPTURED",
  "PIECE_CROWNED",
  "GAME_OVER",
];

const resultSchema = z
  .object({
    message: z.string().describe("Concise, event-focused comment"),
    emotion: coerceToEnum(aiPlayerEmotions).describe(
      "Emotion matching game state"
    ),
  })
  .partial();

const createEventsPrompt = (events: GameEvent[], aiPlayerType: PlayerType) => {
  const eventDescriptions = events
    .filter((event) => promptEventTypes.includes(event.type))
    .map((event) => translateEvent(event, aiPlayerType))
    .join("\n");

  return `Based on the recent game events described below, generate:
message: short, vivid message that captures the essence of the events
emotion: authentically reflects the game state, one of:
${aiPlayerEmotions.join(", ")}

${createSection("Events", eventDescriptions)}

${createStructuredResponse(resultSchema)}
`;
};

export const createEventsPromptRequest = (
  events: GameEvent[],
  aiPlayerType: PlayerType,
  defaultValue: z.infer<typeof resultSchema>
) => ({
  prompt: createEventsPrompt(events, aiPlayerType),
  resultSchema,
  defaultValue,
});
