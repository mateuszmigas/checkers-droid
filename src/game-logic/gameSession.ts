import {
  GameState,
  createInitialGameState,
  updateGameState,
  GameAction,
  getPlayerValidMoves,
} from "./gameState";
import { CheckerPosition, CheckerValidMoveMap, PlayerType } from "./types";
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
  private playerOne: GamePlayer;
  private playerTwo: GamePlayer;

  constructor(gameMode: GameMode) {
    super();

    this.gameState = createInitialGameState();

    switch (gameMode) {
      case "AI_VS_AI":
        this.playerOne = createAIPlayer("PLAYER_ONE");
        this.playerTwo = createAIPlayer("PLAYER_TWO");
        break;
      case "HUMAN_VS_AI":
        this.playerOne = createHumanPlayer();
        this.playerTwo = createAIPlayer("PLAYER_TWO");
        break;
      case "HUMAN_VS_HUMAN":
        this.playerOne = createHumanPlayer();
        this.playerTwo = createHumanPlayer();
        break;
    }

    setTimeout(() => {
      this.triggerAutomaticMoves();
    }, 1000);
  }

  private invokeGameAction(action: GameAction) {
    console.log("invokeGameAction", action, this.gameState);
    const { state, events } = updateGameState(this.gameState, action);
    this.gameState = state;
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
    console.log("handleEvents", events);
    for (const event of events) {
      switch (event.type) {
        case "PIECE_CROWNED":
          break;
        case "PIECE_CAPTURED":
        case "TURN_CHANGED":
          console.log("TURN_CHANGED", this.getCurrentPlayer()?.type);
          if (this.getCurrentPlayer()?.type === "AI") {
            this.triggerAutomaticMoves();
          } else {
            this.selectedCheckerPosition = null;
            this.emit("stateChanged");
          }
          break;
      }
    }
  }

  private async triggerAutomaticMoves() {
    console.log("triggerAutomaticMoves");
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer || currentPlayer.type !== "AI") return;

    const agentMove = await currentPlayer.getInstance().getMove(this.gameState);

    if (agentMove) {
      this.invokeGameAction({ type: "MOVE_PIECE", ...agentMove });
    }
  }

  getHumanValidMoves(): CheckerValidMoveMap | null {
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer || currentPlayer.type !== "HUMAN") return null;

    return getPlayerValidMoves(
      this.gameState.gameStatus as PlayerType,
      this.gameState
    );
  }

  restart = () => {
    this.gameState = createInitialGameState();
    this.selectedCheckerPosition = null;
    this.emit("stateChanged");
  };

  getState() {
    return {
      gameState: this.gameState,
      selectedPosition: this.selectedCheckerPosition,
    };
  }
}

