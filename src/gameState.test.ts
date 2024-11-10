import { describe, expect, test } from "vitest";
import {
  CheckerPiece,
  createInitialGameState,
  GameState,
  getPlayerValidMoves,
  PlayerType,
  updateGameState,
} from "./gameState";

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

const createEmptyGameState = (
  currentPlayer: PlayerType = "PLAYER_ONE"
): GameState => {
  const gameState = createInitialGameState();
  gameState.grid.forEach((row) => row.fill(null));
  gameState.gameStatus = currentPlayer;
  return gameState;
};

describe("board setup", () => {
  test("board is 8x8 with correct dark square positioning", () => {
    const gameState = createInitialGameState();

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
  test("players can only move one piece per turn", () => {
    const gameState = createInitialGameState();
    const result = updateGameState(gameState, {
      type: "MOVE_PIECE",
      from: { row: 2, col: 1 },
      to: { row: 3, col: 2 },
    });

    expect(result.state.gameStatus).toBe("PLAYER_TWO");
    expect(result.events).toContainEqual({
      type: "TURN_CHANGED",
      player: "PLAYER_TWO",
    });

    const invalidMove = updateGameState(result.state, {
      type: "MOVE_PIECE",
      from: { row: 2, col: 3 },
      to: { row: 3, col: 4 },
    });

    expect(invalidMove.events).toContainEqual({ type: "INVALID_MOVE" });
    expect(invalidMove.state.gameStatus).toBe("PLAYER_TWO");
  });

  test("player one (darker pieces) moves first", () => {
    const gameState = createInitialGameState();

    const invalidMove = updateGameState(gameState, {
      type: "MOVE_PIECE",
      from: { row: 5, col: 0 },
      to: { row: 4, col: 1 },
    });

    expect(invalidMove.events).toContainEqual({ type: "INVALID_MOVE" });
    expect(gameState.gameStatus).toBe("PLAYER_ONE");

    const validMove = updateGameState(gameState, {
      type: "MOVE_PIECE",
      from: { row: 2, col: 1 },
      to: { row: 3, col: 2 },
    });

    expect(validMove.events).not.toContainEqual({ type: "INVALID_MOVE" });
    expect(validMove.state.gameStatus).toBe("PLAYER_TWO");
  });
});

describe("movement rules for men", () => {
  test("men can move diagonally forward to adjacent unoccupied squares", () => {
    const gameState = createInitialGameState();
    const playerOnePiece = gameState.grid[2][1];

    // PLAYER_ONE moving forward-right
    const moveRight = updateGameState(gameState, {
      type: "MOVE_PIECE",
      from: { row: 2, col: 1 },
      to: { row: 3, col: 2 },
    });
    expect(moveRight.state.grid[3][2]).toEqual(playerOnePiece);
    expect(moveRight.state.grid[2][1]).toBeNull();
    expect(moveRight.events).toContainEqual({
      type: "PIECE_MOVED",
      from: { row: 2, col: 1 },
      to: { row: 3, col: 2 },
    });

    const playerTwoPiece = moveRight.state.grid[5][2];
    // PLAYER_TWO moving forward-left
    const moveLeft = updateGameState(moveRight.state, {
      type: "MOVE_PIECE",
      from: { row: 5, col: 2 },
      to: { row: 4, col: 1 },
    });
    expect(moveLeft.state.grid[4][1]).toEqual(playerTwoPiece);
    expect(moveLeft.state.grid[5][2]).toBeNull();
    expect(moveLeft.events).toContainEqual({
      type: "PIECE_MOVED",
      from: { row: 5, col: 2 },
      to: { row: 4, col: 1 },
    });

    // Invalid move - moving two squares without capture
    const invalidMove = updateGameState(moveLeft.state, {
      type: "MOVE_PIECE",
      from: { row: 2, col: 3 },
      to: { row: 4, col: 5 },
    });
    expect(invalidMove.state.grid[2][3]).toBeTruthy();
    expect(invalidMove.state.grid[4][5]).toBeNull();
    expect(invalidMove.events).toContainEqual({ type: "INVALID_MOVE" });
  });

  test("men cannot move backward", () => {
    const gameState = createInitialGameState();
    const playerOnePiece = gameState.grid[2][1];

    // Move pieces to set up the test
    const setup = updateGameState(gameState, {
      type: "MOVE_PIECE",
      from: { row: 2, col: 1 },
      to: { row: 3, col: 2 },
    });

    const playerTwoPiece = setup.state.grid[5][0];
    // PLAYER_TWO's turn
    const setup2 = updateGameState(setup.state, {
      type: "MOVE_PIECE",
      from: { row: 5, col: 0 },
      to: { row: 4, col: 1 },
    });

    // Try to move PLAYER_ONE's piece backward
    const invalidBackwardMove = updateGameState(setup2.state, {
      type: "MOVE_PIECE",
      from: { row: 3, col: 2 },
      to: { row: 2, col: 1 },
    });
    expect(invalidBackwardMove.state.grid[3][2]).toEqual(playerOnePiece);
    expect(invalidBackwardMove.state.grid[2][1]).toBeNull();
    expect(invalidBackwardMove.events).toContainEqual({ type: "INVALID_MOVE" });

    // Try to move PLAYER_TWO's piece backward
    const nextTurn = updateGameState(setup2.state, {
      type: "MOVE_PIECE",
      from: { row: 4, col: 1 },
      to: { row: 5, col: 0 },
    });
    expect(nextTurn.state.grid[4][1]).toEqual(playerTwoPiece);
    expect(nextTurn.state.grid[5][0]).toBeNull();
    expect(nextTurn.events).toContainEqual({ type: "INVALID_MOVE" });
  });
});

describe("movement rules for kings", () => {
  test("kings can move diagonally in any direction", () => {
    const gameState = createInitialGameState();
    gameState.grid.forEach((row) => {
      row.fill(null);
    });
    const king: CheckerPiece = {
      id: "test-king",
      player: "PLAYER_ONE",
      isKing: true,
    };
    gameState.grid[3][4] = king;

    const moveForwardRight = updateGameState(gameState, {
      type: "MOVE_PIECE",
      from: { row: 3, col: 4 },
      to: { row: 4, col: 5 },
    });
    expect(moveForwardRight.state.grid[4][5]).toEqual(king);
    expect(moveForwardRight.state.grid[3][4]).toBeNull();
    expect(moveForwardRight.events).toContainEqual({
      type: "PIECE_MOVED",
      from: { row: 3, col: 4 },
      to: { row: 4, col: 5 },
    });

    const moveBackwardLeft = updateGameState(gameState, {
      type: "MOVE_PIECE",
      from: { row: 3, col: 4 },
      to: { row: 2, col: 3 },
    });
    expect(moveBackwardLeft.state.grid[2][3]).toEqual(king);
    expect(moveBackwardLeft.state.grid[3][4]).toBeNull();
    expect(moveBackwardLeft.events).toContainEqual({
      type: "PIECE_MOVED",
      from: { row: 3, col: 4 },
      to: { row: 2, col: 3 },
    });

    const moveBackwardRight = updateGameState(gameState, {
      type: "MOVE_PIECE",
      from: { row: 3, col: 4 },
      to: { row: 2, col: 5 },
    });
    expect(moveBackwardRight.state.grid[2][5]).toEqual(king);
    expect(moveBackwardRight.state.grid[3][4]).toBeNull();
    expect(moveBackwardRight.events).toContainEqual({
      type: "PIECE_MOVED",
      from: { row: 3, col: 4 },
      to: { row: 2, col: 5 },
    });

    const moveForwardLeft = updateGameState(gameState, {
      type: "MOVE_PIECE",
      from: { row: 3, col: 4 },
      to: { row: 4, col: 3 },
    });
    expect(moveForwardLeft.state.grid[4][3]).toEqual(king);
    expect(moveForwardLeft.state.grid[3][4]).toBeNull();
    expect(moveForwardLeft.events).toContainEqual({
      type: "PIECE_MOVED",
      from: { row: 3, col: 4 },
      to: { row: 4, col: 3 },
    });
  });

  test("kings can move multiple squares diagonally", () => {
    const gameState = createInitialGameState();
    gameState.grid.forEach((row) => {
      row.fill(null);
    });
    const king: CheckerPiece = {
      id: "test-king",
      player: "PLAYER_ONE",
      isKing: true,
    };
    gameState.grid[3][3] = king;

    const moveForwardRight = updateGameState(gameState, {
      type: "MOVE_PIECE",
      from: { row: 3, col: 3 },
      to: { row: 6, col: 6 },
    });
    expect(moveForwardRight.state.grid[6][6]).toEqual(king);
    expect(moveForwardRight.state.grid[3][3]).toBeNull();
    expect(moveForwardRight.events).toContainEqual({
      type: "PIECE_MOVED",
      from: { row: 3, col: 3 },
      to: { row: 6, col: 6 },
    });

    const moveBackwardLeft = updateGameState(gameState, {
      type: "MOVE_PIECE",
      from: { row: 3, col: 3 },
      to: { row: 0, col: 0 },
    });
    expect(moveBackwardLeft.state.grid[0][0]).toEqual(king);
    expect(moveBackwardLeft.state.grid[3][3]).toBeNull();
    expect(moveBackwardLeft.events).toContainEqual({
      type: "PIECE_MOVED",
      from: { row: 3, col: 3 },
      to: { row: 0, col: 0 },
    });

    const moveBackwardRight = updateGameState(gameState, {
      type: "MOVE_PIECE",
      from: { row: 3, col: 3 },
      to: { row: 0, col: 6 },
    });
    expect(moveBackwardRight.state.grid[0][6]).toEqual(king);
    expect(moveBackwardRight.state.grid[3][3]).toBeNull();
    expect(moveBackwardRight.events).toContainEqual({
      type: "PIECE_MOVED",
      from: { row: 3, col: 3 },
      to: { row: 0, col: 6 },
    });

    const moveForwardLeft = updateGameState(gameState, {
      type: "MOVE_PIECE",
      from: { row: 3, col: 3 },
      to: { row: 6, col: 0 },
    });
    expect(moveForwardLeft.state.grid[6][0]).toEqual(king);
    expect(moveForwardLeft.state.grid[3][3]).toBeNull();
    expect(moveForwardLeft.events).toContainEqual({
      type: "PIECE_MOVED",
      from: { row: 3, col: 3 },
      to: { row: 6, col: 0 },
    });
  });

  test("kings cannot move through other pieces", () => {
    const gameState = createInitialGameState();
    const king: CheckerPiece = {
      id: "test-king",
      player: "PLAYER_ONE",
      isKing: true,
    };
    gameState.grid[3][3] = king;

    gameState.grid[4][4] = {
      id: "blocking-piece",
      player: "PLAYER_ONE",
      isKing: false,
    };

    const result = updateGameState(gameState, {
      type: "MOVE_PIECE",
      from: { row: 3, col: 3 },
      to: { row: 5, col: 5 },
    });

    expect(result.state.grid[3][3]).toEqual(king);
    expect(result.state.grid[5][5]).toBeNull();
    expect(result.events).toContainEqual({ type: "INVALID_MOVE" });
  });
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
  test("men are promoted when reaching opposite end", () => {
    const gameState = createEmptyGameState();

    // Place a PLAYER_ONE piece near promotion
    const piece: CheckerPiece = {
      id: "test-piece",
      player: "PLAYER_ONE",
      isKing: false,
    };
    gameState.grid[6][1] = piece;

    // Move to last row
    const result = updateGameState(gameState, {
      type: "MOVE_PIECE",
      from: { row: 6, col: 1 },
      to: { row: 7, col: 2 },
    });

    expect(result.state.grid[7][2]?.isKing).toBe(true);
    expect(result.events).toContainEqual({
      type: "PIECE_CROWNED",
      position: { row: 7, col: 2 },
    });

    // Test PLAYER_TWO promotion
    const newGameState = createEmptyGameState("PLAYER_TWO");
    const playerTwoPiece: CheckerPiece = {
      id: "test-piece-2",
      player: "PLAYER_TWO",
      isKing: false,
    };
    newGameState.grid[1][1] = playerTwoPiece;

    const result2 = updateGameState(newGameState, {
      type: "MOVE_PIECE",
      from: { row: 1, col: 1 },
      to: { row: 0, col: 2 },
    });

    expect(result2.state.grid[0][2]?.isKing).toBe(true);
    expect(result2.events).toContainEqual({
      type: "PIECE_CROWNED",
      position: { row: 0, col: 2 },
    });
  });

  test("must complete capture sequence before promotion", () => {
    const gameState = createEmptyGameState();

    // Setup a piece that can make a capture followed by promotion
    const piece: CheckerPiece = {
      id: "test-piece",
      player: "PLAYER_ONE",
      isKing: false,
    };
    gameState.grid[5][1] = piece;

    // Place opponent piece to be captured
    gameState.grid[6][2] = {
      id: "opponent-piece",
      player: "PLAYER_TWO",
      isKing: false,
    };

    // Make the capture move that leads to promotion
    const result = updateGameState(gameState, {
      type: "MOVE_PIECE",
      from: { row: 5, col: 1 },
      to: { row: 7, col: 3 },
    });

    expect(result.state.grid[7][3]?.isKing).toBe(true);
    expect(result.state.grid[6][2]).toBeNull(); // Captured piece is removed
    expect(result.events).toContainEqual({
      type: "PIECE_CAPTURED",
      position: { row: 6, col: 2 },
      piece: expect.objectContaining({ player: "PLAYER_TWO" }),
    });
    expect(result.events).toContainEqual({
      type: "PIECE_CROWNED",
      position: { row: 7, col: 3 },
    });
  });

  test("kings are properly marked/identified", () => {
    const gameState = createEmptyGameState();

    const king: CheckerPiece = {
      id: "test-king",
      player: "PLAYER_ONE",
      isKing: true,
    };
    gameState.grid[4][4] = king;

    // Verify king's movement capabilities
    const validMoves = getPlayerValidMoves("PLAYER_ONE", gameState);
    const kingMoves = validMoves.get({ row: 4, col: 4 }) || [];

    // King should be able to move in all diagonal directions
    const expectedDirections = [
      { row: 3, col: 3 }, // backward-left
      { row: 3, col: 5 }, // backward-right
      { row: 5, col: 3 }, // forward-left
      { row: 5, col: 5 }, // forward-right
    ];

    expectedDirections.forEach((direction) => {
      expect(
        kingMoves.some(
          (move) =>
            move.targetPosition.row === direction.row &&
            move.targetPosition.col === direction.col
        )
      ).toBe(true);
    });

    // Verify king status is maintained after movement
    const result = updateGameState(gameState, {
      type: "MOVE_PIECE",
      from: { row: 4, col: 4 },
      to: { row: 5, col: 5 },
    });

    expect(result.state.grid[5][5]?.isKing).toBe(true);
  });
});

describe("winning conditions", () => {
  test("win by capturing all opponent pieces", () => {});

  test("win when opponent has no legal moves", () => {});
});

describe("draw conditions", () => {
  test("draw when neither player can force win", () => {});
});

