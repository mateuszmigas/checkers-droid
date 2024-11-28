import { GameEvent } from "@/game-logic/gameEvent";
import { aiPlayerEmotions, PlayerType } from "@/game-logic/types";
import { coerceToEnum } from "@/utils/zod";
import { createSection } from "@/utils/prompt";
import { translateEvent } from "@/utils/translator";
import { z } from "zod";
import { withCompletionTracking, withFirstChunkHandler } from "@/utils/stream";

const promptEventTypes: GameEvent["type"][] = [
  "PIECE_MOVED",
  "PIECE_CAPTURED",
  "PIECE_CROWNED",
  "TURN_CHANGED",
  "GAME_OVER",
];

const resultSchema = coerceToEnum(aiPlayerEmotions);

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

${createSection("Response Format", "emotion|comment")}`;
};

export const createEventsPromptRequest = (
  events: GameEvent[],
  aiPlayerType: PlayerType,
  defaultValue: z.infer<typeof resultSchema>
) => ({
  prompt: createEventsPrompt(events, aiPlayerType),
  handleEmotionThenStreamMessage: (
    stream: ReadableStream<string>,
    emotionHandler: (chunk: z.infer<typeof resultSchema>) => void,
    onComplete: () => void
  ) =>
    stream
      .pipeThrough(
        withFirstChunkHandler((chunk) => {
          const parsed = resultSchema.safeParse(chunk);
          emotionHandler(parsed.success ? parsed.data : defaultValue);
        }, "|")
      )
      .pipeThrough(withCompletionTracking(onComplete)),
});
