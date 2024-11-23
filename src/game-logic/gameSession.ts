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
  createAiPlayer,
  createHumanPlayer,
  GamePlayer,
} from "./players/gamePlayer";
import { GameMode } from "./gameMode";

export type GameSessionEvent = { type: "stateChanged" } | GameEvent;

export class GameSession extends EventEmitter<GameSessionEvent> {
  private gameState: GameState;
  private selectedCheckerPosition: CheckerPosition | null = null;
  private playerOne: GamePlayer;
  private playerTwo: GamePlayer;

  constructor(gameMode: GameMode, aiAvailable: boolean) {
    super();

    this.gameState = createInitialGameState();

    switch (gameMode) {
      case "AI_VS_AI":
        this.playerOne = createAiPlayer("PLAYER_ONE", aiAvailable);
        this.playerTwo = createAiPlayer("PLAYER_TWO", aiAvailable);
        break;
      case "HUMAN_VS_AI":
        this.playerOne = createHumanPlayer();
        this.playerTwo = createAiPlayer("PLAYER_TWO", aiAvailable);
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
    const { state, events } = updateGameState(this.gameState, action);
    this.gameState = state;
    this.handleEvents(events);
    this.emit({ type: "stateChanged" });
    events.forEach((event) => this.emit(event));

    if (this.playerOne.type === "AI")
      this.playerOne.getInstance().notify(this.gameState, events);
    if (this.playerTwo.type === "AI")
      this.playerTwo.getInstance().notify(this.gameState, events);
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
      this.emit({ type: "stateChanged" });
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
        case "PIECE_CAPTURED":
        case "TURN_CHANGED":
          if (this.getCurrentPlayer()?.type === "AI") {
            this.triggerAutomaticMoves();
          } else {
            this.selectedCheckerPosition = null;
            this.emit({ type: "stateChanged" });
          }
          break;
      }
    }
  }

  private async triggerAutomaticMoves() {
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

  getPlayer(playerType: PlayerType): GamePlayer {
    if (playerType === "PLAYER_ONE") return this.playerOne;
    if (playerType === "PLAYER_TWO") return this.playerTwo;
    throw new Error("Invalid player type");
  }

  restart = () => {
    this.gameState = createInitialGameState();
    this.selectedCheckerPosition = null;
    this.triggerAutomaticMoves();
    this.emit({ type: "stateChanged" });
  };

  getState() {
    return {
      gameState: this.gameState,
      selectedPosition: this.selectedCheckerPosition,
    };
  }
}

