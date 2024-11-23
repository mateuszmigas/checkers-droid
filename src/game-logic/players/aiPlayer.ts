import { GameState, getPlayerValidMoves, updateGameState } from "../gameState";
import { AIPlayerEmotion, CheckerPosition, PlayerType } from "../types";
import { EventEmitter } from "@/utils/eventEmitter";
import { GameEvent } from "../gameEvent";
import { chromeApi, ChromeAiSession } from "@/chromeAI";
import { createMovePromptRequest } from "@/prompts/movePrompt";
import { createSystemPrompt } from "@/prompts/systemPrompt";
import { createWelcomePrompt } from "@/prompts/welcomePrompt";
import { runWithStructuredOutput } from "@/utils/prompt";
import { createEventsPromptRequest } from "@/prompts/eventsPrompt";
import { withMinDuration } from "@/utils/promise";

export type AIPlayerEvents =
  | { type: "EMOTION_CHANGED"; emotion: AIPlayerEmotion }
  | { type: "MESSAGE_CHANGED"; message: string | ReadableStream<string> };

export type MoveConsequence =
  | "TURN_DIDNT_CHANGE"
  | "PROMOTED_TO_KING"
  | "EXPOSES_TO_OPPONENT_CAPTURE";

const simulateMoveConsequences = (
  gameState: GameState,
  move: { from: CheckerPosition; to: CheckerPosition }
): MoveConsequence[] => {
  const me = gameState.currentTurn as PlayerType;
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

export class AiPlayer extends EventEmitter<AIPlayerEvents> {
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
          emotion: "joy",
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

    const response = await withMinDuration(
      runWithStructuredOutput(this.session!, promptRequest),
      1000 // in case the AI is too fast
    );

    console.log(response);

    return moves[response.data.shot];
  }

  async notify(gameState: GameState, gameEvents: GameEvent[]) {
    if (gameState.currentTurn === this.playerType) {
      return;
    }

    const filteredEvents = gameEvents.filter(
      (event) => event.type !== "GAME_OVER"
    );

    const promptRequest = createEventsPromptRequest(
      filteredEvents,
      this.playerType,
      { message: "...", emotion: "joy" }
    );

    const response = await runWithStructuredOutput(
      this.session!,
      promptRequest
    );

    this.emit({ type: "MESSAGE_CHANGED", message: response.data.message! });
    this.emit({ type: "EMOTION_CHANGED", emotion: response.data.emotion! });
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
