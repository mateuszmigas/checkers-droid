import { PlayerType } from "../types";
import { AIPlayer } from "./aiPlayer";

export type GamePlayer =
  | { type: "HUMAN" }
  | { type: "AI"; getInstance: () => AIPlayer };

export const createHumanPlayer = (): GamePlayer => ({
  type: "HUMAN",
});

export const createAIPlayer = (playerType: PlayerType): GamePlayer => {
  const aiPlayer = new AIPlayer(playerType);
  return { type: "AI", getInstance: () => aiPlayer };
};
