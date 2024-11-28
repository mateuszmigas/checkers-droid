import { delay } from "@/utils/promise";
import { GameState, getPlayerValidMoves } from "../gameState";
import { PlayerType } from "../types";
import { EventEmitter } from "@/utils/eventEmitter";
import { GameEvent } from "../gameEvent";
import { AIPlayerEvents } from "./aiPlayer";

export class FakeAiPlayer extends EventEmitter<AIPlayerEvents> {
  constructor(private readonly playerType: PlayerType) {
    super();

    const init = async () => {
      await delay(500);
      this.emit({
        type: "MESSAGE_CHANGED",
        message: "Hello, I'm your fake AI opponent!",
      });
      this.emit({ type: "EMOTION_CHANGED", emotion: "joy" });
    };
    init();
  }

  async getMove(gameState: GameState) {
    const moves = getPlayerValidMoves(this.playerType, gameState)
      .entries()
      .flatMap(([position, moves]) =>
        moves.map((move) => {
          return { from: position, to: move.targetPosition };
        })
      );

    /* Simulate thinking time */
    await delay(Math.random() * 1000 + 1000);

    if (moves.length === 0) return null;
    return moves[Math.floor(Math.random() * moves.length)];
  }

  async notify(gameState: GameState, events: GameEvent[]) {
    if (events.some((e) => e.type === "GAME_OVER")) {
      if (gameState.winner === this.playerType) {
        this.emit({ type: "EMOTION_CHANGED", emotion: "joy" });
        this.emit({
          type: "MESSAGE_CHANGED",
          message: "I won the game! Great job!",
        });
      } else {
        this.emit({ type: "EMOTION_CHANGED", emotion: "sadness" });
        this.emit({
          type: "MESSAGE_CHANGED",
          message: "I'm sorry, I lost the game. Better luck next time!",
        });
      }
    }
  }
}
