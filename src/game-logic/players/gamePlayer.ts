import { PlayerType } from "../types";
import { AiPlayer } from "./aiPlayer";
import { FakeAiPlayer } from "./fakeAiPlayer";

export type GamePlayer =
  | { type: "HUMAN" }
  | { type: "AI"; getInstance: () => AiPlayer | FakeAiPlayer };

export const createHumanPlayer = (): GamePlayer => ({
  type: "HUMAN",
});

export const createAiPlayer = (
  playerType: PlayerType,
  aiAvailable: boolean
): GamePlayer => {
  const aiPlayer = aiAvailable
    ? new AiPlayer(playerType)
    : new FakeAiPlayer(playerType);

  return { type: "AI", getInstance: () => aiPlayer };
};

