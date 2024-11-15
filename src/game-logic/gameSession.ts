import { useState, useCallback, useEffect } from "react";
import {
  GameState,
  createInitialGameState,
  updateGameState,
  getPlayerValidMoves,
} from "./gameState";
import {
  CheckerPosition,
  CheckerValidMove,
  CheckerValidMoveMap,
} from "./types";
import { AIPlayer } from "./aiPlayer";
import { GameEvent } from "./gameEvent";
import EventEmitter from "events";

type AIReaction = {
  mood: "happy" | "sad" | "focused";
  message: string;
};

export interface IPlayer {
  getMove: (gameState: GameState) => Promise<CheckerValidMove>;
  getReaction: () => Promise<AIReaction>;
}

export function useGameSession() {
  const [gameState, setGameState] = useState<GameState>(
    createInitialGameState()
  );
  const [selectedPosition, setSelectedPosition] =
    useState<CheckerPosition | null>(null);
  const [validMoves, setValidMoves] = useState<CheckerValidMoveMap | null>(
    null
  );
  const [aiPlayer] = useState(() => new AIPlayer());

  // const getCurrentPlayer = useCallback(() => {
  //   return gameState.gameStatus;
  // }, [gameState.gameStatus]);

  // Calculate valid moves only when necessary
  useEffect(() => {
    if (gameState.gameStatus === "GAME_OVER") {
      setValidMoves(null);
      return;
    }

    // Only calculate moves for the current player
    const moves = getPlayerValidMoves(gameState.gameStatus, gameState);
    setValidMoves(moves);
  }, [gameState.gameStatus, gameState.grid]); // Only recalculate when these change

  // Handle AI moves
  useEffect(() => {
    if (gameState.gameStatus === "PLAYER_TWO") {
      // Add a small delay to make the AI moves feel more natural
      const timeoutId = setTimeout(() => {
        const aiMove = aiPlayer.getMove(gameState);
        if (aiMove) {
          const { state, events } = updateGameState(gameState, {
            type: "MOVE_PIECE",
            from: aiMove.from,
            to: aiMove.to,
          });
          setGameState(state);
          handleEvents(events);
        }
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [gameState]);

  const handlePieceClick = useCallback(
    (position: CheckerPosition) => {
      // Prevent moves during AI turn
      if (gameState.gameStatus === "PLAYER_TWO") return;

      const piece = gameState.grid[position.row][position.col];
      if (!piece) return;

      if (piece.player === gameState.gameStatus) {
        if (
          selectedPosition?.row === position.row &&
          selectedPosition?.col === position.col
        ) {
          setSelectedPosition(null);
        } else {
          setSelectedPosition(position);
        }
      }
    },
    [gameState, selectedPosition]
  );

  const handleMoveClick = useCallback(
    (targetPosition: CheckerPosition) => {
      // Prevent moves during AI turn
      if (gameState.gameStatus === "PLAYER_TWO") return;

      if (selectedPosition) {
        const previousPlayer = gameState.gameStatus;
        const { state, events } = updateGameState(gameState, {
          type: "MOVE_PIECE",
          from: selectedPosition,
          to: targetPosition,
        });

        setGameState(state);
        handleEvents(events);

        if (state.gameStatus !== previousPlayer) {
          setSelectedPosition(null);
        } else {
          setSelectedPosition(targetPosition);
        }
      }
    },
    [selectedPosition, gameState]
  );

  const handleEvents = (events: GameEvent[]) => {
    events.forEach((event) => {
      switch (event.type) {
        case "PIECE_CAPTURED":
          // Handle capture animation or notification
          break;
        case "PIECE_CROWNED":
          // Handle crowning animation or notification
          break;
        case "TURN_CHANGED":
          // Handle turn change notification
          break;
      }
    });
  };

  const resetGame = useCallback(() => {
    setGameState(createInitialGameState());
    setSelectedPosition(null);
  }, []);

  return {
    gameState,
    selectedPosition,
    validMoves,
    handlePieceClick,
    handleMoveClick,
    resetGame,
  };
  //getMoves
  //getCheckers
  //getSelected
  //handleSelection
  //handleMove
  //resetGame
}

