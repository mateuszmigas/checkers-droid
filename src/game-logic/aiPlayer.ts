import { GameEvent } from "./gameEvent";
import { GameState } from "./gameState";

export class AIPlayer {
  public static checkCapability() {
    return true;
  }

  initialize() {}

  async makeMove(_gameState: GameState) {
    //get all valid moves
    return { row: 0, col: 0 };
  }

  reactToEvent(_event: GameEvent): Promise<string> {
    return Promise.resolve("Oh no!");
  }

  async reset() {}
}

