import {
  GameState,
  createInitialGameState,
  updateGameState,
  getPlayerValidMoves,
  GameAction,
} from "./gameState";
import { CheckerPosition, CheckerValidMoveMap } from "./types";
import { GameEvent } from "./gameEvent";
import { EventEmitter } from "../utils/eventEmitter";
import {
  createAIPlayer,
  createHumanPlayer,
  GamePlayer,
} from "./players/gamePlayer";
import { GameMode } from "./gameMode";

export type GameSessionEvent = { type: "stateChanged" };

export class GameSession extends EventEmitter<GameSessionEvent> {
  private gameState: GameState;
  private selectedCheckerPosition: CheckerPosition | null = null;
  private validMoves: CheckerValidMoveMap | null = null;
  private playerOne: GamePlayer;
  private playerTwo: GamePlayer;

  constructor(gameMode: GameMode) {
    super();

    this.gameState = createInitialGameState();

    switch (gameMode) {
      case "AI_VS_AI":
        this.playerOne = createAIPlayer();
        this.playerTwo = createAIPlayer();
        break;
      case "HUMAN_VS_AI":
        this.playerOne = createHumanPlayer();
        this.playerTwo = createAIPlayer();
        break;
      case "HUMAN_VS_HUMAN":
        this.playerOne = createHumanPlayer();
        this.playerTwo = createHumanPlayer();
        break;
    }

    this.calculateValidMoves();
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
    const { state, events } = updateGameState(this.gameState, action);
    this.gameState = state;
    this.calculateValidMoves();
    this.handleEvents(events);
    this.emit("stateChanged");
  }

  private getCurrentPlayer(): GamePlayer | null {
    if (this.gameState.gameStatus === "PLAYER_ONE") return this.playerOne;
    if (this.gameState.gameStatus === "PLAYER_TWO") return this.playerTwo;
    return null;
  }

  handlePieceClick(position: CheckerPosition) {
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer || currentPlayer.type !== "HUMAN") return;

    const piece = this.gameState.grid[position.row][position.col];
    if (!piece) return;

    if (piece.player === this.gameState.gameStatus) {
      if (
        this.selectedCheckerPosition?.row === position.row &&
        this.selectedCheckerPosition?.col === position.col
      ) {
        this.selectedCheckerPosition = null;
      } else {
        this.selectedCheckerPosition = position;
      }
      this.emit("stateChanged");
    }
  }

  handleMoveClick(targetPosition: CheckerPosition) {
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer || currentPlayer.type !== "HUMAN") return;

    if (this.selectedCheckerPosition) {
      const previousPlayer = this.gameState.gameStatus;
      this.invokeGameAction({
        type: "MOVE_PIECE",
        from: this.selectedCheckerPosition,
        to: targetPosition,
      });

      if (this.gameState.gameStatus !== previousPlayer) {
        this.selectedCheckerPosition = null;
      } else {
        this.selectedCheckerPosition = targetPosition;
      }
    }
  }

  private async handleEvents(events: GameEvent[]) {
    for (const event of events) {
      switch (event.type) {
        case "PIECE_CROWNED":
          break;
        case "TURN_CHANGED":
          const currentPlayer = this.getCurrentPlayer();

          if (currentPlayer && currentPlayer.type === "AI") {
            const agentMove = await currentPlayer
              .getInstance()
              .getMove(this.gameState);

            if (agentMove) {
              this.invokeGameAction({ type: "MOVE_PIECE", ...agentMove });
            }
          } else {
            this.selectedCheckerPosition = null;
            this.emit("stateChanged");
          }
          break;
      }
    }
  }

  restart = () => {
    this.gameState = createInitialGameState();
    this.selectedCheckerPosition = null;
    this.calculateValidMoves();
    this.emit("stateChanged");
  };

  getState() {
    return {
      gameState: this.gameState,
      selectedPosition: this.selectedCheckerPosition,
      validMoves: this.validMoves,
    };
  }
}

