import {
  GameState,
  createInitialGameState,
  updateGameState,
  getPlayerValidMoves,
  GameAction,
} from "./gameState";
import { CheckerPosition, CheckerValidMoveMap } from "./types";
import { AIPlayer } from "./aiPlayer";
import { GameEvent } from "./gameEvent";
import { EventEmitter } from "../utils/eventEmitter";

type GameSessionEvent = { type: "stateChanged" };

export class GameSession extends EventEmitter<GameSessionEvent> {
  private gameState: GameState;
  private selectedPosition: CheckerPosition | null = null;
  private validMoves: CheckerValidMoveMap | null = null;
  private aiPlayer: AIPlayer;

  constructor() {
    super();
    this.gameState = createInitialGameState();
    this.aiPlayer = new AIPlayer();
    this.calculateValidMoves();
  }

  private isAiPlayer(gameState: GameState) {
    return gameState.gameStatus === "PLAYER_TWO";
  }

  private calculateValidMoves() {
    if (this.gameState.gameStatus === "GAME_OVER") {
      this.validMoves = null;
      return;
    }

    this.validMoves = getPlayerValidMoves(
      this.gameState.gameStatus,
      this.gameState
    );
  }

  private invokeGameAction(action: GameAction) {
    const { state: newState, events } = updateGameState(this.gameState, action);
    this.gameState = newState;
    this.calculateValidMoves();
    this.handleEvents(events);
    this.emit("stateChanged");
  }

  handlePieceClick = (position: CheckerPosition) => {
    if (this.gameState.gameStatus === "PLAYER_TWO") return;

    const piece = this.gameState.grid[position.row][position.col];
    if (!piece) return;

    if (piece.player === this.gameState.gameStatus) {
      if (
        this.selectedPosition?.row === position.row &&
        this.selectedPosition?.col === position.col
      ) {
        this.selectedPosition = null;
      } else {
        this.selectedPosition = position;
      }
      console.log("triggering state changed");
      // this.emit("stateChanged");
    }
  };

  handleMoveClick = (targetPosition: CheckerPosition) => {
    if (this.gameState.gameStatus === "PLAYER_TWO") return;

    if (this.selectedPosition) {
      const previousPlayer = this.gameState.gameStatus;
      this.invokeGameAction({
        type: "MOVE_PIECE",
        from: this.selectedPosition,
        to: targetPosition,
      });

      if (this.gameState.gameStatus !== previousPlayer) {
        this.selectedPosition = null;
      } else {
        this.selectedPosition = targetPosition;
      }
    }
  };

  private async handleEvents(events: GameEvent[]) {
    for (const event of events) {
      switch (event.type) {
        case "PIECE_CROWNED":
          break;
        case "TURN_CHANGED":
          if (this.isAiPlayer(this.gameState)) {
            const aiMove = await this.aiPlayer.getMove(this.gameState);
            if (aiMove) {
              this.invokeGameAction({
                type: "MOVE_PIECE",
                from: aiMove.from,
                to: aiMove.to,
              });
            }
          } else {
            this.selectedPosition = null;
            this.emit("stateChanged");
          }
          break;
      }
    }
  }

  resetGame = () => {
    this.gameState = createInitialGameState();
    this.selectedPosition = null;
    this.calculateValidMoves();
    this.emit("stateChanged");
  };

  getState() {
    return {
      gameState: this.gameState,
      selectedPosition: this.selectedPosition,
      validMoves: this.validMoves,
    };
  }
}
