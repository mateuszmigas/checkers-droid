import { GameState, getPlayerValidMoves, updateGameState } from "../gameState";
import { AIPlayerEmotion, CheckerPosition, PlayerType } from "../types";
import { EventEmitter } from "@/utils/eventEmitter";
import { GameEvent } from "../gameEvent";
import { chromeApi, ChromeSession } from "@/chromeAI";
import { createEventsPrompt, welcomePrompt } from "./aiPrompt";
import { createMovePrompt } from "./prompts/movePrompt";
import { createSystemPrompt } from "./prompts/systemPrompt";

export type AIPlayerEvents =
  | { type: "EMOTION_CHANGED"; emotion: AIPlayerEmotion }
  | { type: "MESSAGE_CHANGED"; message: string | ReadableStream<string> };

/*
  1. get all valid moves
  2. select capture moves if any, otherwise select all moves
  3. for each move, simulate a state after the move
  4. ai will evaluate move + state after move
*/

export type MoveConsequence =
  | "TURN_DIDNT_CHANGE"
  | "PROMOTED_TO_KING"
  | "EXPOSES_TO_OPPONENT_CAPTURE";

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
  private session: ChromeSession | undefined;

  constructor(private readonly playerType: PlayerType) {
    super();

    chromeApi
      .createSession(createSystemPrompt(playerType, "AI"))
      .then((session) => {
        this.session = session;
        const promptStream = this.session.promptStreaming(welcomePrompt);

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

  async getMove(
    gameState: GameState
  ): Promise<{ from: CheckerPosition; to: CheckerPosition } | null> {
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

    try {
      const prompt = createMovePrompt(moves);
      const response = await this.session!.prompt(prompt);
      const parsedResponse = JSON.parse(response) as {
        shot: number;
      };
      const isValidIndex =
        parsedResponse.shot >= 0 && parsedResponse.shot < moves.length;
      const move = isValidIndex ? moves[parsedResponse.shot] : moves[0];
      return move;
    } catch (error) {
      return moves[0];
    }
  }

  async notify(gameState: GameState, gameEvents: GameEvent[]) {
    if (gameState.gameStatus !== this.playerType) {
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
    } catch (error) {
      console.error("Error in notify:", error);
    }
  }
}

