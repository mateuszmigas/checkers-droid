import { GameEvent } from "./gameEvent";
import { GameState, getPlayerValidMoves } from "./gameState";
import {
  CheckerPosition,
  CheckerValidMove,
  CheckerValidMoveMap,
} from "./types";

export class AIPlayer {
  public static checkCapability() {
    return true;
  }

  getMove(
    gameState: GameState
  ): { from: CheckerPosition; to: CheckerPosition } | null {
    // Get all valid moves for black pieces
    const validMoves: CheckerValidMoveMap = getPlayerValidMoves(
      "PLAYER_TWO",
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

  async reactToEvent(_event: GameEvent): Promise<string> {
    return Promise.resolve("Calculating next move...");
  }

  async reset() {}
}

