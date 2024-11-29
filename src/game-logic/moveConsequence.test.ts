import { describe, it, expect } from "vitest";
import { analyzeMoveConsequences } from "./moveConsequence";
import { createInitialGameState, GameState } from "./gameState";
import { CheckerPosition } from "./types";

const movePiece = (
  gameState: GameState,
  from: CheckerPosition,
  to: CheckerPosition
) => {
  const piece = gameState.grid[from.row][from.col];
  gameState.grid[from.row][from.col] = null;
  gameState.grid[to.row][to.col] = piece;
};

const clearGrid = (gameState: GameState) => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      gameState.grid[row][col] = null;
    }
  }
};

describe("analyzeMoveConsequences", () => {
  describe("CAPTURE_RISK", () => {
    it("should identify when a move puts a piece at risk of being captured", () => {
      const gameState = createInitialGameState();
      movePiece(gameState, { row: 2, col: 1 }, { row: 3, col: 2 });
      const move = { from: { row: 3, col: 2 }, to: { row: 4, col: 3 } };
      const consequences = analyzeMoveConsequences(gameState, move);
      expect(consequences).toContain("CAPTURE_RISK");
    });

    it("should not identify capture risk when move is safe", () => {
      const gameState = createInitialGameState();
      const move = { from: { row: 2, col: 1 }, to: { row: 3, col: 2 } };
      const consequences = analyzeMoveConsequences(gameState, move);
      expect(consequences).not.toContain("CAPTURE_RISK");
    });
  });

  describe("CAPTURE_OPPORTUNITY", () => {
    it("should identify when a move creates an opportunity to capture opponent's piece", () => {
      const gameState = createInitialGameState();
      movePiece(gameState, { row: 5, col: 4 }, { row: 4, col: 3 });
      const move = { from: { row: 2, col: 3 }, to: { row: 3, col: 2 } };
      const consequences = analyzeMoveConsequences(gameState, move);
      expect(consequences).toContain("CAPTURE_OPPORTUNITY");
    });

    it("should not identify capture opportunity when none exists", () => {
      const gameState = createInitialGameState();
      const move = { from: { row: 2, col: 1 }, to: { row: 3, col: 2 } };
      const consequences = analyzeMoveConsequences(gameState, move);
      expect(consequences).not.toContain("CAPTURE_OPPORTUNITY");
    });
  });

  describe("OPPONENT_BLOCK", () => {
    it("should identify when a move blocks opponent's strategic options", () => {
      const gameState = createInitialGameState();
      movePiece(gameState, { row: 2, col: 7 }, { row: 3, col: 6 });
      movePiece(gameState, { row: 5, col: 4 }, { row: 4, col: 5 });
      movePiece(gameState, { row: 6, col: 5 }, { row: 5, col: 4 });

      const move = { from: { row: 1, col: 6 }, to: { row: 2, col: 7 } };
      const consequences = analyzeMoveConsequences(gameState, move);
      expect(consequences).toContain("OPPONENT_BLOCK");
    });

    it("should not identify opponent block for regular moves", () => {
      const gameState = createInitialGameState();
      clearGrid(gameState);
      gameState.grid[3][2] = { id: "1", player: "PLAYER_ONE", isKing: false };
      gameState.grid[5][4] = { id: "2", player: "PLAYER_TWO", isKing: false };
      const move = { from: { row: 3, col: 2 }, to: { row: 4, col: 3 } };
      const consequences = analyzeMoveConsequences(gameState, move);
      expect(consequences).not.toContain("OPPONENT_BLOCK");
    });
  });

  describe("KING_PROMOTION", () => {
    it("should identify when a move leads to king promotion", () => {
      const gameState = createInitialGameState();
      clearGrid(gameState);
      gameState.grid[6][1] = { id: "1", player: "PLAYER_ONE", isKing: false };
      gameState.grid[5][4] = { id: "2", player: "PLAYER_TWO", isKing: false };
      const move = { from: { row: 6, col: 1 }, to: { row: 7, col: 2 } };
      const consequences = analyzeMoveConsequences(gameState, move);
      expect(consequences).toContain("KING_PROMOTION");
    });

    it("should not identify king promotion for regular moves", () => {
      const gameState = createInitialGameState();
      clearGrid(gameState);
      gameState.grid[5][0] = { id: "1", player: "PLAYER_ONE", isKing: false };
      gameState.grid[5][4] = { id: "2", player: "PLAYER_TWO", isKing: false };
      const move = { from: { row: 5, col: 0 }, to: { row: 6, col: 1 } };
      const consequences = analyzeMoveConsequences(gameState, move);
      expect(consequences).not.toContain("KING_PROMOTION");
    });
  });

  describe("WINNING_MOVE", () => {
    it("should identify when a move leads to winning the game", () => {
      const gameState = createInitialGameState();
      clearGrid(gameState);
      gameState.grid[2][1] = { id: "1", player: "PLAYER_ONE", isKing: false };
      gameState.grid[3][2] = { id: "2", player: "PLAYER_TWO", isKing: false };
      const move = { from: { row: 2, col: 1 }, to: { row: 4, col: 3 } };
      const consequences = analyzeMoveConsequences(gameState, move);
      expect(consequences).toContain("WINNING_MOVE");
    });

    it("should not identify endgame strategy when game is ongoing", () => {
      const gameState = createInitialGameState();
      const move = { from: { row: 2, col: 1 }, to: { row: 3, col: 2 } };
      const consequences = analyzeMoveConsequences(gameState, move);
      expect(consequences).not.toContain("WINNING_MOVE");
    });
  });
});

