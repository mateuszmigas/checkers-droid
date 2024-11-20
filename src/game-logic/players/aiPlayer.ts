import { GameState, getPlayerValidMoves, updateGameState } from "../gameState";
import { AIPlayerEmotion, CheckerPosition, PlayerType } from "../types";
import { EventEmitter } from "@/utils/eventEmitter";
import { GameEvent } from "../gameEvent";
import { chromeApi, ChromeSession } from "@/chromeAI";
import { createEventsPrompt, systemPrompt, welcomePrompt } from "./aiPrompt";

export type AIPlayerEvents =
  | { type: "EMOTION_CHANGED"; emotion: AIPlayerEmotion }
  | { type: "MESSAGE_CHANGED"; message: string | ReadableStream<string> };

/*
  1. get all valid moves
  2. select capture moves if any, otherwise select all moves
  3. for each move, simulate a state after the move
  4. ai will evaluate move + state after move
*/

const simulateMove = (
  gameState: GameState,
  move: { from: CheckerPosition; to: CheckerPosition }
) =>
  updateGameState(gameState, {
    type: "MOVE_PIECE",
    ...move,
  });

export class AIPlayer extends EventEmitter<AIPlayerEvents> {
  private session: ChromeSession | undefined;

  constructor(private readonly playerType: PlayerType) {
    super();

    chromeApi.createSession(systemPrompt).then((session) => {
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
      }, 500);
    });
  }

  async getMove(
    gameState: GameState
  ): Promise<{ from: CheckerPosition; to: CheckerPosition } | null> {
    const validMovesMap = getPlayerValidMoves(this.playerType, gameState)
      .entries()
      .flatMap(([position, moves]) =>
        moves.map((move) => ({ from: position, to: move.targetPosition }))
      );

    //map moves for ai
    const aiMoves = validMovesMap.map((move) => {
      const simulatedGameState = simulateMove(gameState, move);
      const simulatedValidMoves = getPlayerValidMoves(
        this.playerType,
        simulatedGameState.state
      );

      //count captures

      return {
        from: move.from,
        to: move.to,
        score: 0,
      };
    });

    return null;
  }

  async notify(gameState: GameState, gameEvents: GameEvent[]) {
    if (gameState.gameStatus !== this.playerType) return;

    const filteredEvents = gameEvents.filter(
      (event) => event.type !== "GAME_OVER"
    );
    // console.log("notify", gameEvents);
    const prompt = createEventsPrompt(filteredEvents, this.playerType);
    // console.log(prompt);

    const response = await this.session!.prompt(prompt);

    try {
      // console.log("response:", response);
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
