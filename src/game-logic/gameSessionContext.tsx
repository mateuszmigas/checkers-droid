import React, { createContext, useContext } from "react";
import { useGameSession } from "./gameSession";
import { CheckerPosition } from "./types";

// Define the context type
type GameSessionContextType = {
  gameState: ReturnType<typeof useGameSession>["gameState"];
  selectedPosition: CheckerPosition | null;
  validMoves: ReturnType<typeof useGameSession>["validMoves"];
  handlePieceClick: (position: CheckerPosition) => void;
  handleMoveClick: (position: CheckerPosition) => void;
  resetGame: () => void;
};

// Create the context
const GameSessionContext = createContext<GameSessionContextType | null>(null);

// Create the provider component
export function GameSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const gameSession = useGameSession();

  return (
    <GameSessionContext.Provider value={gameSession}>
      {children}
    </GameSessionContext.Provider>
  );
}

// Create a custom hook to use the game session
export function useGameSessionContext() {
  const context = useContext(GameSessionContext);
  if (!context) {
    throw new Error("useGameSession must be used within a GameSessionProvider");
  }
  return context;
}

