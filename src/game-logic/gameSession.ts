import { useState, useCallback, useEffect } from "react";
import {
  GameState,
  createInitialGameState,
  updateGameState,
  getPlayerValidMoves,
} from "./gameState";
import { CheckerPosition, GameEvent, CheckerValidMoveMap } from "./types";
import { AIPlayer } from "./aiPlayer";

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

  // Update valid moves whenever game state changes
  useEffect(() => {
    if (gameState.gameStatus !== "GAME_OVER") {
      const moves = getPlayerValidMoves(gameState.gameStatus, gameState);
      setValidMoves(moves);
    } else {
      setValidMoves(null);
    }
  }, [gameState]);

  // Handle AI moves
  useEffect(() => {
    if (gameState.gameStatus === "BLACK") {
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
    }
  }, [gameState]);

  const handlePieceClick = useCallback(
    (position: CheckerPosition) => {
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
}

