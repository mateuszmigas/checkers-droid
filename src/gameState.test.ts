import { describe, expect, test } from "vitest";
import { createInitialGameState, GameState } from "./gameState";

// Add this helper function at the top of the file, after imports
export const printBoard = (gameState: GameState): void => {
  console.log("\n   0 1 2 3 4 5 6 7"); // Column numbers
  console.log("  -----------------");

  for (let row = 0; row < 8; row++) {
    let rowStr = `${row} |`; // Row numbers
    for (let col = 0; col < 8; col++) {
      const piece = gameState.grid[row][col];
      let symbol = " ";

      if (piece) {
        if (piece.player === "PLAYER_ONE") {
          symbol = piece.isKing ? "⛃" : "○";
        } else {
          symbol = piece.isKing ? "⛂" : "●";
        }
      } else {
        // Show dark/light squares
        symbol = (row + col) % 2 !== 0 ? "·" : " ";
      }
      rowStr += symbol + " ";
    }
    console.log(rowStr + "|");
  }
  console.log("  -----------------");
};

const forEachCell = (callback: (row: number, col: number) => void) => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      callback(row, col);
    }
  }
};

const isDarkSquare = (row: number, col: number) => (row + col) % 2 !== 0;

describe("board setup", () => {
  test("board is 8x8 with correct dark square positioning", () => {
    const gameState = createInitialGameState();

    // Check board dimensions
    expect(gameState.grid.length).toBe(8);
    gameState.grid.forEach((row) => {
      expect(row.length).toBe(8);
    });

    forEachCell((row, col) => {
      if (!isDarkSquare(row, col)) {
        expect(gameState.grid[row][col]).toBeNull();
      }
    });
  });

  test("each player starts with 12 pieces in correct positions", () => {
    const gameState = createInitialGameState();
    let playerOnePieces = 0;
    let playerTwoPieces = 0;

    forEachCell((row, col) => {
      const piece = gameState.grid[row][col];

      if (piece) {
        expect(piece).toHaveProperty("id");
        expect(piece).toHaveProperty("player");
        expect(piece).toHaveProperty("isKing");
        expect(piece.isKing).toBe(false);

        if (piece.player === "PLAYER_ONE") {
          playerOnePieces++;
          expect(row).toBeLessThan(3);
        } else if (piece.player === "PLAYER_TWO") {
          playerTwoPieces++;
          expect(row).toBeGreaterThan(4);
        }

        expect(isDarkSquare(row, col)).toBe(true);
      }
    });

    expect(playerOnePieces).toBe(12);
    expect(playerTwoPieces).toBe(12);
  });
});

describe("turn order", () => {
  test("players can only move one piece per turn", () => {});

  test("player one (darker pieces) moves first", () => {});
});

describe("movement rules for men", () => {
  test("men can move diagonally forward to adjacent unoccupied squares", () => {});

  test("men cannot move backward", () => {});
});

describe("movement rules for kings", () => {
  test("kings can move diagonally in any direction", () => {});
});

describe("capturing rules", () => {
  test("capturing is mandatory when available", () => {});

  test("captures are made by jumping over opponent pieces", () => {});

  describe("men capturing rules", () => {
    test("men can only capture forward", () => {});
  });

  describe("kings capturing rules", () => {
    test("kings can capture in any direction and change direction", () => {});

    test("multiple captures are mandatory and continue from landing square", () => {});
  });

  test("captured pieces are immediately removed", () => {});

  test("player can choose between multiple capture sequences", () => {});

  describe("direction restrictions", () => {
    test("men cannot change direction during captures", () => {});

    test("kings can change direction during captures", () => {});
  });
});

describe("promotion to king", () => {
  test("men are promoted when reaching opposite end", () => {});

  test("must complete capture sequence before promotion", () => {});

  test("kings are properly marked/identified", () => {});
});

describe("winning conditions", () => {
  test("win by capturing all opponent pieces", () => {});

  test("win when opponent has no legal moves", () => {});
});

describe("draw conditions", () => {
  test("draw when neither player can force win", () => {});
});
