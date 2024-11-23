import { createContext, useContext } from "react";
import { GameSession } from "@/game-logic/gameSession";

export const GameSessionContext = createContext<GameSession | null>(null);

export const useGameSessionContext = () => {
  const context = useContext(GameSessionContext);
  if (!context) {
    throw new Error("useGameSession must be used within a GameSessionProvider");
  }
  return context;
};

