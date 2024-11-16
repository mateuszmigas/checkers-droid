import { AIPlayer } from "./aiPlayer";

export type GamePlayer =
  | { type: "HUMAN" }
  | { type: "AI"; getInstance: () => AIPlayer };

export const createHumanPlayer = (): GamePlayer => ({
  type: "HUMAN",
});

export const createAIPlayer = (): GamePlayer => {
  const aiPlayer = new AIPlayer();
  return { type: "AI", getInstance: () => aiPlayer };
};

