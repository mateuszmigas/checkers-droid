import { delay } from "@/utils/promise";
import { GameState, getPlayerValidMoves } from "../gameState";
import {
  AIPlayerEmotion,
  CheckerPosition,
  CheckerValidMove,
  CheckerValidMoveMap,
  PlayerType,
} from "../types";
import { EventEmitter } from "@/utils/eventEmitter";
import { GameEvent } from "../gameEvent";
import { chromeApi, ChromeSession } from "@/chromeAI";
import { createEventsPrompt, systemPrompt, welcomePrompt } from "./aiPrompt";

export type AIPlayerEvents =
  | { type: "EMOTION_CHANGED"; emotion: AIPlayerEmotion }
  | { type: "MESSAGE_CHANGED"; message: string | ReadableStream<string> };

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
    // Get all valid moves for black pieces
    await delay(Math.random() * 1000 + 1000);
    const validMoves: CheckerValidMoveMap = getPlayerValidMoves(
      this.playerType,
      gameState
    );

    // Convert the map to an array of moves with their starting positions
    const allMoves: { from: CheckerPosition; move: CheckerValidMove }[] = [];

    // Use entries() to iterate over the CustomMap
    validMoves.entries().forEach(([position, moves]) => {
      moves.forEach((move) => {
        allMoves.push({ from: position, move });
      });
    });

    // Prioritize capture moves
    const captureMoves = allMoves.filter(({ move }) => move.isCapture);

    if (captureMoves.length > 0) {
      // Choose a random capture move
      const randomMove =
        captureMoves[Math.floor(Math.random() * captureMoves.length)];
      return {
        from: randomMove.from,
        to: randomMove.move.targetPosition,
      };
    }

    // If no capture moves, choose a random regular move
    if (allMoves.length > 0) {
      const randomMove = allMoves[Math.floor(Math.random() * allMoves.length)];
      return {
        from: randomMove.from,
        to: randomMove.move.targetPosition,
      };
    }

    return null;
  }

  async notify(gameState: GameState, gameEvents: GameEvent[]) {
    if (gameState.gameStatus !== this.playerType) return;

    console.log("notify", gameEvents);
    const prompt = createEventsPrompt(gameEvents, this.playerType);
    console.log(prompt);

    const response = await this.session!.prompt(prompt);

    try {
      console.log("response:", response);
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
    // console.log("response:", response);
  }
}

