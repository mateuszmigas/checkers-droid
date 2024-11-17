import { delay } from "@/utils/promise";
import { GameState, getPlayerValidMoves } from "../gameState";
import {
  CheckerPosition,
  CheckerValidMove,
  CheckerValidMoveMap,
  PlayerType,
} from "../types";
import { EventEmitter } from "@/utils/eventEmitter";
import { GameEvent } from "../gameEvent";

export type AIPlayerEvents =
  | { type: "EMOTION_CHANGED"; emotion: string }
  | { type: "MESSAGE_CHANGED"; message: string };

export class AIPlayer extends EventEmitter<AIPlayerEvents> {
  constructor(private readonly playerType: PlayerType) {
    super();

    setTimeout(() => {
      this.emit({
        type: "MESSAGE_CHANGED",
        message: "Hello, I'm your AI opponent!",
      });
    }, Math.random() * 1000);
  }

  async getMove(
    gameState: GameState
  ): Promise<{ from: CheckerPosition; to: CheckerPosition } | null> {
    // Get all valid moves for black pieces
    await delay(Math.random() * 250);
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

  async notify(gameEvents: GameEvent[]) {
    const types = gameEvents.map((event) => event.type);

    if (types.includes("PIECE_CAPTURED")) {
      console.log("PIECE_CAPTURED");
      setTimeout(() => {
        this.emit({
          type: "MESSAGE_CHANGED",
          message: "I'm so happy for you!",
        });
      }, Math.random() * 1000);
      return;
    }
    if (types.includes("PIECE_MOVED")) {
      setTimeout(() => {
        this.emit({
          type: "MESSAGE_CHANGED",
          message: "Oh no, you moved a piece!",
        });
      }, Math.random() * 1000);
    }
  }
}
