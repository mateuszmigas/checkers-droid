import { GameState, getPlayerValidMoves, updateGameState } from "../gameState";
import {
  AIPlayerEmotion,
  aiPlayerEmotions,
  CheckerPosition,
  PlayerType,
} from "../types";
import { EventEmitter } from "@/utils/eventEmitter";
import { GameEvent } from "../gameEvent";
import { chromeApi, ChromeAiSession } from "@/chromeAI";
import { createMovePromptRequest } from "./prompts/movePrompt";
import { createSystemPrompt } from "./prompts/systemPrompt";
import { createWelcomePrompt } from "./prompts/welcomePrompt";
import { createEventsPrompt } from "./prompts/eventsPrompt";
import { runWithStructuredOutput } from "@/utils/prompt";
export type AIPlayerEvents =
  | { type: "EMOTION_CHANGED"; emotion: AIPlayerEmotion }
  | { type: "MESSAGE_CHANGED"; message: string | ReadableStream<string> };

export type MoveConsequence =
  | "TURN_DIDNT_CHANGE"
  | "PROMOTED_TO_KING"
  | "EXPOSES_TO_OPPONENT_CAPTURE";

const isValidEmotion = (emotion: string): emotion is AIPlayerEmotion => {
  return (
    typeof emotion === "string" &&
    aiPlayerEmotions.map((e) => e.toLowerCase()).includes(emotion.toLowerCase())
  );
};

const simulateMoveConsequences = (
  gameState: GameState,
  move: { from: CheckerPosition; to: CheckerPosition }
): MoveConsequence[] => {
  const me = gameState.gameStatus as PlayerType;
  const { state, events } = updateGameState(gameState, {
    type: "MOVE_PIECE",
    ...move,
  });
  const opponent = me === "PLAYER_ONE" ? "PLAYER_TWO" : "PLAYER_ONE";

  const exposesToOpponentCapture = getPlayerValidMoves(opponent, state)
    .entries()
    .some((e) => e[1].some((m) => m.isCapture));
  const turnDidntChange = events.every(
    (event) => event.type !== "TURN_CHANGED"
  );
  const promotedToKing = events.some((event) => event.type === "PIECE_CROWNED");

  const consequences: MoveConsequence[] = [];
  if (promotedToKing) consequences.push("PROMOTED_TO_KING");
  if (turnDidntChange) consequences.push("TURN_DIDNT_CHANGE");
  if (exposesToOpponentCapture)
    consequences.push("EXPOSES_TO_OPPONENT_CAPTURE");
  return consequences;
};

export class AIPlayer extends EventEmitter<AIPlayerEvents> {
  private session: ChromeAiSession | undefined;

  constructor(private readonly playerType: PlayerType) {
    super();

    const systemPrompt = createSystemPrompt("AI");
    chromeApi.createSession(systemPrompt).then((session) => {
      this.session = session;
      const promptStream = this.session.promptStreaming(createWelcomePrompt());

      setTimeout(() => {
        this.emit({
          type: "MESSAGE_CHANGED",
          message: promptStream,
        });
        this.emit({
          type: "EMOTION_CHANGED",
          emotion: "happy",
        });
      }, 100);
    });
  }

  async getMove(gameState: GameState) {
    const moves = getPlayerValidMoves(this.playerType, gameState)
      .entries()
      .flatMap(([position, moves]) =>
        moves.map((move) => {
          const consequences = simulateMoveConsequences(gameState, {
            from: position,
            to: move.targetPosition,
          });
          return { from: position, to: move.targetPosition, consequences };
        })
      );

    if (moves.length === 0) return null;

    const promptRequest = createMovePromptRequest(
      moves,
      { shot: 0 },
      ({ shot }) => shot >= 0 && shot < moves.length
    );

    const response = await runWithStructuredOutput(
      this.session!,
      promptRequest
    );

    return moves[response.data.shot];
  }

  async notify(gameState: GameState, gameEvents: GameEvent[]) {
    if (gameState.gameStatus === this.playerType) {
      return;
    }

    const filteredEvents = gameEvents.filter(
      (event) => event.type !== "GAME_OVER"
    );

    const prompt = createEventsPrompt(filteredEvents, this.playerType);
    const response = await this.session!.prompt(prompt);

    try {
      const parsedResponse = JSON.parse(response) as {
        message: string;
        emotion: AIPlayerEmotion;
      };

      if (parsedResponse.message) {
        this.emit({
          type: "MESSAGE_CHANGED",
          message: parsedResponse.message,
        });
      }

      const emotion = parsedResponse.emotion;
      if (isValidEmotion(emotion)) {
        this.emit({ type: "EMOTION_CHANGED", emotion });
      }
    } catch {
      // ignore
    }
  }
}
// // Create a TransformStream to process the emotion and message
// const transformStream = new TransformStream({
//   transform: (chunk, controller) => {
//     const text = chunk.toString();
//     if (text.includes("|")) {
//       const [emotion, message] = text.split("|");
//       // Emit emotion change if it's a valid AIPlayerEmotion
//       if (emotion.trim() as AIPlayerEmotion) {
//         console.log("emotion", emotion.trim());
//         // this.emit({
//         //   type: "EMOTION_CHANGED",
//         //   emotion: emotion.trim() as AIPlayerEmotion,
//         // });
//       }
//       controller.enqueue(message);
//     } else {
//       controller.enqueue(chunk);
//     }
//   },
// });

