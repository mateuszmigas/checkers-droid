import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import {
  GameState,
  createInitialGameState,
  updateGameState,
  getPlayerValidMoves,
  GameAction,
} from "./gameState";
import {
  CheckerPosition,
  CheckerValidMove,
  CheckerValidMoveMap,
} from "./types";
import { AIPlayer } from "./aiPlayer";
import { GameEvent } from "./gameEvent";

type AIReaction = {
  mood: "happy" | "sad" | "focused";
  message: string;
};

export interface IPlayer {
  getMove: (gameState: GameState) => Promise<CheckerValidMove>;
  getReaction: () => Promise<AIReaction>;
}

const useTriggerRender = () => {
  const [, setTriggerRender] = useState(0);
  return () => setTriggerRender((prev) => prev + 1);
};

export function useGameSession() {
  const triggerRender = useTriggerRender();
  const gameStateRef = useRef<GameState>(createInitialGameState());
  const [selectedPosition, setSelectedPosition] =
    useState<CheckerPosition | null>(null);
  const [validMoves, setValidMoves] = useState<CheckerValidMoveMap | null>(
    null
  );
  const aiPlayer = useMemo(() => new AIPlayer(), []);

  const isAiPlayer = (gameState: GameState) =>
    gameState.gameStatus === "PLAYER_TWO";

  // const getCurrentPlayer = useCallback(() => {
  //   return gameState.gameStatus;
  // }, [gameState.gameStatus]);

  // Calculate valid moves only when necessary
  useEffect(() => {
    if (gameStateRef.current.gameStatus === "GAME_OVER") {
      setValidMoves(null);
      return;
    }

    // Only calculate moves for the current player
    const moves = getPlayerValidMoves(
      gameStateRef.current.gameStatus,
      gameStateRef.current
    );
    setValidMoves(moves);
  }, [gameStateRef.current.gameStatus, gameStateRef.current.grid]); // Only recalculate when these change

  const invokeGameAction = useCallback(
    (action: GameAction) => {
      console.log("invokeGameAction", action);
      const { state: newState, events } = updateGameState(
        gameStateRef.current,
        action
      );
      gameStateRef.current = newState;
      handleEvents(events);
      triggerRender();
    },
    [gameStateRef]
  );

  const handlePieceClick = useCallback(
    (position: CheckerPosition) => {
      // Prevent moves during AI turn
      if (gameStateRef.current.gameStatus === "PLAYER_TWO") return;

      const piece = gameStateRef.current.grid[position.row][position.col];
      if (!piece) return;

      if (piece.player === gameStateRef.current.gameStatus) {
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
    [gameStateRef, selectedPosition]
  );

  const handleMoveClick = useCallback(
    (targetPosition: CheckerPosition) => {
      // Prevent moves during AI turn
      if (gameStateRef.current.gameStatus === "PLAYER_TWO") return;

      if (selectedPosition) {
        const previousPlayer = gameStateRef.current.gameStatus;
        invokeGameAction({
          type: "MOVE_PIECE",
          from: selectedPosition,
          to: targetPosition,
        });

        if (gameStateRef.current.gameStatus !== previousPlayer) {
          setSelectedPosition(null);
        } else {
          setSelectedPosition(targetPosition);
        }
      }
    },
    [selectedPosition, gameStateRef]
  );

  const handleEvents = (events: GameEvent[]) => {
    events.forEach(async (event) => {
      switch (event.type) {
        case "PIECE_CROWNED":
          // Handle crowning animation or notification
          break;
        case "TURN_CHANGED":
          if (isAiPlayer(gameStateRef.current)) {
            const aiMove = await aiPlayer.getMove(gameStateRef.current);
            if (aiMove) {
              invokeGameAction({
                type: "MOVE_PIECE",
                from: aiMove.from,
                to: aiMove.to,
              });
            }
          } else {
            setSelectedPosition(null);
          }
          break;
      }
    });
  };

  const resetGame = useCallback(() => {
    // setGameState(createInitialGameState());
    // setSelectedPosition(null);
  }, []);

  return {
    gameState: gameStateRef.current,
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

