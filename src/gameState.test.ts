import { describe, expect, test } from "vitest";
import {
  createInitialGameState,
  getValidMoves,
  updateGameState,
  GameState,
  Position,
  getAllPiecesWithCaptures,
} from "./gameState";

describe("Initial Board Setup", () => {
  test("should create correct initial board layout", () => {
    const gameState = createInitialGameState();

    // Check board dimensions
    expect(gameState.grid.length).toBe(8);
    expect(gameState.grid[0].length).toBe(8);

    // Check Player One's pieces (first 3 rows)
    let playerOnePieces = 0;
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 8; col++) {
        if ((row + col) % 2 !== 0) {
          expect(gameState.grid[row][col]?.player).toBe("PLAYER_ONE");
          playerOnePieces++;
        }
      }
    }
    expect(playerOnePieces).toBe(12);

    // Check Player Two's pieces (last 3 rows)
    let playerTwoPieces = 0;
    for (let row = 5; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if ((row + col) % 2 !== 0) {
          expect(gameState.grid[row][col]?.player).toBe("PLAYER_TWO");
          playerTwoPieces++;
        }
      }
    }
    expect(playerTwoPieces).toBe(12);
  });
});

describe("Basic Movement Rules", () => {
  test("can only move diagonally forward", () => {
    const gameState = createInitialGameState();
    const position: Position = { row: 2, col: 1 };

    const validMoves = getValidMoves(position, gameState);

    // Should have two possible moves forward
    expect(validMoves).toContainEqual({ row: 3, col: 0 });
    expect(validMoves).toContainEqual({ row: 3, col: 2 });
    expect(validMoves.length).toBe(2);
  });

  test("cannot move backward", () => {
    const gameState = createInitialGameState();
    const position: Position = { row: 2, col: 1 };

    const validMoves = getValidMoves(position, gameState);

    // Should not contain any moves with row < current row for PLAYER_ONE
    expect(validMoves.every((move) => move.row > position.row)).toBe(true);
  });
});

describe("Capturing Rules", () => {
  test("capturing is mandatory when available", () => {
    const gameState: GameState = {
      ...createInitialGameState(),
      grid: Array(8)
        .fill(null)
        .map(() => Array(8).fill(null)),
    };

    // Set up a capture scenario
    gameState.grid[3][3] = { id: "p1", player: "PLAYER_ONE", isKing: false };
    gameState.grid[4][4] = { id: "p2", player: "PLAYER_TWO", isKing: false };

    const validMoves = getValidMoves({ row: 3, col: 3 }, gameState);

    // Should only return the capture move
    expect(validMoves).toEqual([{ row: 5, col: 5 }]);
    expect(validMoves.length).toBe(1);
  });

  test("captured piece should be removed from board", () => {
    const initialState: GameState = {
      ...createInitialGameState(),
      grid: Array(8)
        .fill(null)
        .map(() => Array(8).fill(null)),
    };

    // Set up a capture scenario
    initialState.grid[3][3] = { id: "p1", player: "PLAYER_ONE", isKing: false };
    initialState.grid[4][4] = { id: "p2", player: "PLAYER_TWO", isKing: false };
    initialState.currentPlayer = "PLAYER_ONE";

    const result = updateGameState(initialState, {
      type: "MOVE_PIECE",
      from: { row: 3, col: 3 },
      to: { row: 5, col: 5 },
    });

    // Check if captured piece is removed
    expect(result.state.grid[4][4]).toBeNull();
    // Check if captured piece is added to capturedPieces array
    expect(result.state.capturedPieces.length).toBe(1);
    expect(result.events).toContainEqual({
      type: "PIECE_CAPTURED",
      position: { row: 4, col: 4 },
      piece: { id: "p2", player: "PLAYER_TWO", isKing: false },
    });
  });
});

describe("King Promotion Rules", () => {
  test("piece should be promoted to king when reaching opposite end", () => {
    const initialState: GameState = {
      ...createInitialGameState(),
      grid: Array(8)
        .fill(null)
        .map(() => Array(8).fill(null)),
    };

    // Place a piece one row away from promotion
    initialState.grid[6][0] = { id: "p1", player: "PLAYER_ONE", isKing: false };
    initialState.currentPlayer = "PLAYER_ONE";

    const result = updateGameState(initialState, {
      type: "MOVE_PIECE",
      from: { row: 6, col: 0 },
      to: { row: 7, col: 1 },
    });

    // Check if piece is promoted
    expect(result.state.grid[7][1]?.isKing).toBe(true);
    expect(result.events).toContainEqual({
      type: "PIECE_CROWNED",
      position: { row: 7, col: 1 },
    });
  });
});

describe("Turn Order Rules", () => {
  test("players should alternate turns", () => {
    const initialState = createInitialGameState();
    const result = updateGameState(initialState, {
      type: "MOVE_PIECE",
      from: { row: 2, col: 1 },
      to: { row: 3, col: 2 },
    });

    expect(result.state.currentPlayer).toBe("PLAYER_TWO");
    expect(result.events).toContainEqual({
      type: "TURN_CHANGED",
      player: "PLAYER_TWO",
    });
  });

  test("player cannot move opponent's pieces", () => {
    const initialState = createInitialGameState();
    const result = updateGameState(initialState, {
      type: "SELECT_PIECE",
      position: { row: 5, col: 0 }, // PLAYER_TWO's piece
    });

    // Should not change state
    expect(result.state).toEqual(initialState);
  });
});

describe("King Movement Rules", () => {
  test("kings can move diagonally both forward and backward", () => {
    const gameState: GameState = {
      ...createInitialGameState(),
      grid: Array(8)
        .fill(null)
        .map(() => Array(8).fill(null)),
    };

    // Place a king in the middle of the board
    gameState.grid[4][4] = {
      id: "p1-king",
      player: "PLAYER_ONE",
      isKing: true,
    };
    gameState.currentPlayer = "PLAYER_ONE";

    const validMoves = getValidMoves({ row: 4, col: 4 }, gameState);

    // Should be able to move in all four diagonal directions
    expect(validMoves).toContainEqual({ row: 3, col: 3 }); // backward-left
    expect(validMoves).toContainEqual({ row: 3, col: 5 }); // backward-right
    expect(validMoves).toContainEqual({ row: 5, col: 3 }); // forward-left
    expect(validMoves).toContainEqual({ row: 5, col: 5 }); // forward-right
  });
});

describe("Multiple Capture Rules", () => {
  test("multiple captures should be mandatory", () => {
    const gameState: GameState = {
      ...createInitialGameState(),
      grid: Array(8)
        .fill(null)
        .map(() => Array(8).fill(null)),
    };

    // Set up a double capture scenario
    gameState.grid[2][2] = { id: "p1", player: "PLAYER_ONE", isKing: false };
    gameState.grid[3][3] = { id: "p2-1", player: "PLAYER_TWO", isKing: false };
    gameState.grid[5][5] = { id: "p2-2", player: "PLAYER_TWO", isKing: false };
    gameState.currentPlayer = "PLAYER_ONE";

    const validMoves = getValidMoves({ row: 2, col: 2 }, gameState);

    // Should only return the final position after both captures
    expect(validMoves).toEqual([{ row: 6, col: 6 }]);
  });

  test("captured pieces should be removed in sequence during multiple captures", () => {
    const gameState: GameState = {
      ...createInitialGameState(),
      grid: Array(8)
        .fill(null)
        .map(() => Array(8).fill(null)),
    };

    // Set up a double capture scenario
    gameState.grid[2][2] = { id: "p1", player: "PLAYER_ONE", isKing: false };
    gameState.grid[3][3] = { id: "p2-1", player: "PLAYER_TWO", isKing: false };
    gameState.grid[5][5] = { id: "p2-2", player: "PLAYER_TWO", isKing: false };
    gameState.currentPlayer = "PLAYER_ONE";

    const result = updateGameState(gameState, {
      type: "MOVE_PIECE",
      from: { row: 2, col: 2 },
      to: { row: 6, col: 6 },
    });

    // Both pieces should be captured
    expect(result.state.capturedPieces.length).toBe(2);
    expect(result.state.grid[3][3]).toBeNull();
    expect(result.state.grid[5][5]).toBeNull();
  });
});

describe("King Capture Rules", () => {
  test("kings can capture in all directions", () => {
    const gameState: GameState = {
      ...createInitialGameState(),
      grid: Array(8)
        .fill(null)
        .map(() => Array(8).fill(null)),
    };

    // Place a king with capture opportunities in all directions
    gameState.grid[4][4] = {
      id: "p1-king",
      player: "PLAYER_ONE",
      isKing: true,
    };
    gameState.grid[3][3] = { id: "p2-1", player: "PLAYER_TWO", isKing: false };
    gameState.grid[5][5] = { id: "p2-2", player: "PLAYER_TWO", isKing: false };
    gameState.currentPlayer = "PLAYER_ONE";

    const validMoves = getValidMoves({ row: 4, col: 4 }, gameState);

    // Should be able to capture in both directions
    expect(validMoves).toContainEqual({ row: 2, col: 2 }); // backward capture
    expect(validMoves).toContainEqual({ row: 6, col: 6 }); // forward capture
  });
});

describe("Win Conditions", () => {
  test("game should be won when all opponent pieces are captured", () => {
    const gameState: GameState = {
      ...createInitialGameState(),
      grid: Array(8)
        .fill(null)
        .map(() => Array(8).fill(null)),
    };

    // Set up final capture scenario
    gameState.grid[2][2] = { id: "p1", player: "PLAYER_ONE", isKing: false };
    gameState.grid[3][3] = {
      id: "p2-last",
      player: "PLAYER_TWO",
      isKing: false,
    }; // Last piece
    gameState.currentPlayer = "PLAYER_ONE";

    const result = updateGameState(gameState, {
      type: "MOVE_PIECE",
      from: { row: 2, col: 2 },
      to: { row: 4, col: 4 },
    });

    expect(result.events).toContainEqual({
      type: "GAME_OVER",
      winner: "PLAYER_ONE",
    });
  });
});

describe("Invalid Move Scenarios", () => {
  test("should not allow moves to occupied squares", () => {
    const gameState = createInitialGameState();
    const position: Position = { row: 2, col: 1 };

    // Place a piece in one of the possible move locations
    gameState.grid[3][2] = {
      id: "blocking-piece",
      player: "PLAYER_TWO",
      isKing: false,
    };

    const validMoves = getValidMoves(position, gameState);

    // Should only have one valid move remaining
    expect(validMoves).toEqual([{ row: 3, col: 0 }]);
  });

  test("should not allow moves outside the board", () => {
    const gameState = createInitialGameState();
    const position: Position = { row: 0, col: 1 };

    const validMoves = getValidMoves(position, gameState);

    // All moves should be within board boundaries
    expect(
      validMoves.every(
        (move) => move.row >= 0 && move.row < 8 && move.col >= 0 && move.col < 8
      )
    ).toBe(true);
  });
});

describe("Draw Conditions", () => {
  test("game should be draw when no player can move", () => {
    const gameState: GameState = {
      ...createInitialGameState(),
      grid: Array(8)
        .fill(null)
        .map(() => Array(8).fill(null)),
    };

    // Set up a blocked position where neither player can move
    gameState.grid[7][7] = { id: "p1", player: "PLAYER_ONE", isKing: false };
    gameState.grid[6][6] = { id: "p2", player: "PLAYER_TWO", isKing: false };
    gameState.currentPlayer = "PLAYER_ONE";

    // Check if any valid moves exist for current player
    const noValidMoves = gameState.grid.every((row, rowIndex) =>
      row.every((cell, colIndex) =>
        cell?.player === gameState.currentPlayer
          ? getValidMoves({ row: rowIndex, col: colIndex }, gameState)
              .length === 0
          : true
      )
    );

    expect(noValidMoves).toBe(true);

    const result = updateGameState(gameState, {
      type: "CHECK_GAME_STATE",
    });

    expect(result.events).toContainEqual({
      type: "GAME_OVER",
      result: "DRAW",
    });
  });
});

describe("Multiple Capture Path Choices", () => {
  test("should allow choice between equal length capture paths", () => {
    const gameState: GameState = {
      ...createInitialGameState(),
      grid: Array(8)
        .fill(null)
        .map(() => Array(8).fill(null)),
    };

    // Set up two possible capture paths
    gameState.grid[3][3] = { id: "p1", player: "PLAYER_ONE", isKing: false };
    gameState.grid[4][4] = { id: "p2-1", player: "PLAYER_TWO", isKing: false };
    gameState.grid[4][2] = { id: "p2-2", player: "PLAYER_TWO", isKing: false };
    gameState.currentPlayer = "PLAYER_ONE";

    const validMoves = getValidMoves({ row: 3, col: 3 }, gameState);

    // Should allow both capture paths
    expect(validMoves).toContainEqual({ row: 5, col: 5 }); // right path
    expect(validMoves).toContainEqual({ row: 5, col: 1 }); // left path
    expect(validMoves.length).toBe(2);
  });
});

describe("King Promotion During Captures", () => {
  test("piece should complete all captures before being crowned", () => {
    const gameState: GameState = {
      ...createInitialGameState(),
      grid: Array(8)
        .fill(null)
        .map(() => Array(8).fill(null)),
    };

    // Set up scenario where piece reaches king row during multiple capture
    gameState.grid[5][5] = { id: "p1", player: "PLAYER_ONE", isKing: false };
    gameState.grid[6][6] = { id: "p2-1", player: "PLAYER_TWO", isKing: false };
    gameState.grid[4][6] = { id: "p2-2", player: "PLAYER_TWO", isKing: false };
    gameState.currentPlayer = "PLAYER_ONE";

    const result = updateGameState(gameState, {
      type: "MOVE_PIECE",
      from: { row: 5, col: 5 },
      to: { row: 7, col: 7 }, // First capture, reaches king row
    });

    // Should still be able to capture the second piece
    expect(result.state.grid[4][6]).toBeNull(); // Second piece should be captured
    expect(result.events).toContainEqual({
      type: "PIECE_CROWNED",
      position: { row: 7, col: 7 },
    });
  });
});

describe("Blocked Piece Scenarios", () => {
  test("should not allow moves when piece is completely blocked", () => {
    const gameState: GameState = {
      ...createInitialGameState(),
      grid: Array(8)
        .fill(null)
        .map(() => Array(8).fill(null)),
    };

    // Set up blocked piece scenario
    gameState.grid[4][4] = { id: "p1", player: "PLAYER_ONE", isKing: false };
    gameState.grid[5][3] = { id: "p2-1", player: "PLAYER_TWO", isKing: false };
    gameState.grid[5][5] = { id: "p2-2", player: "PLAYER_TWO", isKing: false };
    gameState.currentPlayer = "PLAYER_ONE";

    const validMoves = getValidMoves({ row: 4, col: 4 }, gameState);

    expect(validMoves.length).toBe(0);
  });

  test("king should not jump over multiple pieces", () => {
    const gameState: GameState = {
      ...createInitialGameState(),
      grid: Array(8)
        .fill(null)
        .map(() => Array(8).fill(null)),
    };

    // Set up scenario with multiple pieces in a line
    gameState.grid[4][4] = {
      id: "p1-king",
      player: "PLAYER_ONE",
      isKing: true,
    };
    gameState.grid[5][5] = { id: "p2-1", player: "PLAYER_TWO", isKing: false };
    gameState.grid[6][6] = { id: "p2-2", player: "PLAYER_TWO", isKing: false };
    gameState.currentPlayer = "PLAYER_ONE";

    const validMoves = getValidMoves({ row: 4, col: 4 }, gameState);

    // Should only be able to capture the first piece
    expect(validMoves).toContainEqual({ row: 6, col: 6 });
    expect(validMoves).not.toContainEqual({ row: 7, col: 7 });
  });
});

describe("Edge Cases", () => {
  test("should handle invalid move attempts gracefully", () => {
    const gameState = createInitialGameState();

    const result = updateGameState(gameState, {
      type: "MOVE_PIECE",
      from: { row: -1, col: -1 }, // Invalid position
      to: { row: 0, col: 0 },
    });

    expect(result.events).toContainEqual({ type: "INVALID_MOVE" });
    expect(result.state).toEqual(gameState); // State should not change
  });

  test("should not allow moves after game is over", () => {
    const gameState: GameState = {
      ...createInitialGameState(),
      gameOver: true,
      winner: "PLAYER_ONE",
    };

    const result = updateGameState(gameState, {
      type: "MOVE_PIECE",
      from: { row: 2, col: 2 },
      to: { row: 3, col: 3 },
    });

    expect(result.state).toEqual(gameState); // State should not change
    expect(result.events).toContainEqual({ type: "INVALID_MOVE" });
  });
});

describe("Advanced Capture Scenarios", () => {
  test("king should be able to change direction during multiple captures", () => {
    const gameState: GameState = {
      ...createInitialGameState(),
      grid: Array(8)
        .fill(null)
        .map(() => Array(8).fill(null)),
    };

    // Set up zig-zag capture scenario for king
    gameState.grid[3][3] = {
      id: "p1-king",
      player: "PLAYER_ONE",
      isKing: true,
    };
    gameState.grid[4][4] = { id: "p2-1", player: "PLAYER_TWO", isKing: false };
    gameState.grid[4][2] = { id: "p2-2", player: "PLAYER_TWO", isKing: false };
    gameState.currentPlayer = "PLAYER_ONE";

    const validMoves = getValidMoves({ row: 3, col: 3 }, gameState);

    // Should be able to capture both pieces in different directions
    expect(validMoves).toContainEqual({ row: 5, col: 1 }); // Forward then backward
  });

  test("regular piece cannot change direction during multiple captures", () => {
    const gameState: GameState = {
      ...createInitialGameState(),
      grid: Array(8)
        .fill(null)
        .map(() => Array(8).fill(null)),
    };

    // Set up similar scenario for regular piece
    gameState.grid[3][3] = { id: "p1", player: "PLAYER_ONE", isKing: false };
    gameState.grid[4][4] = { id: "p2-1", player: "PLAYER_TWO", isKing: false };
    gameState.grid[4][2] = { id: "p2-2", player: "PLAYER_TWO", isKing: false };
    gameState.currentPlayer = "PLAYER_ONE";

    const validMoves = getValidMoves({ row: 3, col: 3 }, gameState);

    // Should not be able to capture both pieces since it requires changing direction
    expect(validMoves).not.toContainEqual({ row: 5, col: 1 });
  });
});

describe("Game End Scenarios", () => {
  test("game should end when a player has no valid moves left", () => {
    const gameState: GameState = {
      ...createInitialGameState(),
      grid: Array(8)
        .fill(null)
        .map(() => Array(8).fill(null)),
    };

    // Set up scenario where PLAYER_TWO has pieces but can't move them
    gameState.grid[7][7] = { id: "p2-1", player: "PLAYER_TWO", isKing: false };
    gameState.grid[6][6] = { id: "p1-1", player: "PLAYER_ONE", isKing: false };
    gameState.grid[6][8] = { id: "p1-2", player: "PLAYER_ONE", isKing: false };
    gameState.currentPlayer = "PLAYER_TWO";

    const result = updateGameState(gameState, { type: "CHECK_GAME_STATE" });

    expect(result.events).toContainEqual({
      type: "GAME_OVER",
      result: "WIN",
      winner: "PLAYER_ONE",
    });
  });

  test("should detect stalemate condition", () => {
    const gameState: GameState = {
      ...createInitialGameState(),
      grid: Array(8)
        .fill(null)
        .map(() => Array(8).fill(null)),
    };

    // Set up scenario where neither player can move
    gameState.grid[0][0] = { id: "p1", player: "PLAYER_ONE", isKing: false };
    gameState.grid[7][7] = { id: "p2", player: "PLAYER_TWO", isKing: false };
    // Block both pieces
    gameState.grid[1][1] = {
      id: "block1",
      player: "PLAYER_TWO",
      isKing: false,
    };
    gameState.grid[6][6] = {
      id: "block2",
      player: "PLAYER_ONE",
      isKing: false,
    };

    const result = updateGameState(gameState, { type: "CHECK_GAME_STATE" });

    expect(result.events).toContainEqual({
      type: "GAME_OVER",
      result: "DRAW",
    });
  });
});

describe("Move Validation", () => {
  test("should only allow moves to dark squares", () => {
    const gameState = createInitialGameState();
    const position: Position = { row: 2, col: 1 };

    const validMoves = getValidMoves(position, gameState);

    // All valid moves should be on dark squares ((row + col) % 2 !== 0)
    expect(validMoves.every((move) => (move.row + move.col) % 2 !== 0)).toBe(
      true
    );
  });

  test("should require capturing maximum possible pieces", () => {
    const gameState: GameState = {
      ...createInitialGameState(),
      grid: Array(8)
        .fill(null)
        .map(() => Array(8).fill(null)),
    };

    // Set up scenario with two possible capture paths of different lengths
    gameState.grid[2][2] = { id: "p1", player: "PLAYER_ONE", isKing: true };
    // Path 1: single capture
    gameState.grid[3][3] = { id: "p2-1", player: "PLAYER_TWO", isKing: false };
    // Path 2: double capture
    gameState.grid[3][1] = { id: "p2-2", player: "PLAYER_TWO", isKing: false };
    gameState.grid[5][3] = { id: "p2-3", player: "PLAYER_TWO", isKing: false };

    const validMoves = getValidMoves({ row: 2, col: 2 }, gameState);

    // Should only allow the path with maximum captures
    expect(validMoves).toContainEqual({ row: 6, col: 4 }); // Double capture path
    expect(validMoves).not.toContainEqual({ row: 4, col: 4 }); // Single capture path
    expect(validMoves.length).toBe(1);
  });
});

describe("Draw Rules", () => {
  test("game should end in draw after 40 moves without captures or promotions", () => {
    const gameState: GameState = {
      ...createInitialGameState(),
      movesSinceLastCaptureOrPromotion: 80, // 40 moves by each player
    };

    const result = updateGameState(gameState, { type: "CHECK_GAME_STATE" });

    expect(result.events).toContainEqual({
      type: "GAME_OVER",
      result: "DRAW",
    });
  });
});

describe("Repetition Rules", () => {
  test("game should end in draw after same position occurs three times", () => {
    const gameState: GameState = {
      ...createInitialGameState(),
      positionHistory: [
        "position-hash-1",
        "position-hash-2",
        "position-hash-1",
        "position-hash-2",
        "position-hash-1", // Third occurrence
      ],
    };

    const result = updateGameState(gameState, { type: "CHECK_GAME_STATE" });

    expect(result.events).toContainEqual({
      type: "GAME_OVER",
      result: "DRAW",
    });
  });
});

describe("Forced Capture Rules", () => {
  test("should identify all pieces that can capture when multiple exist", () => {
    const gameState: GameState = {
      ...createInitialGameState(),
      grid: Array(8)
        .fill(null)
        .map(() => Array(8).fill(null)),
    };

    // Set up multiple pieces that can capture
    gameState.grid[2][2] = { id: "p1-1", player: "PLAYER_ONE", isKing: false };
    gameState.grid[3][3] = { id: "p2-1", player: "PLAYER_TWO", isKing: false };
    gameState.grid[6][2] = { id: "p1-2", player: "PLAYER_ONE", isKing: false };
    gameState.grid[5][3] = { id: "p2-2", player: "PLAYER_TWO", isKing: false };
    gameState.currentPlayer = "PLAYER_ONE";

    // Both PLAYER_ONE pieces should be identified as having captures
    const piecesWithCaptures = getAllPiecesWithCaptures(gameState);
    expect(piecesWithCaptures).toContainEqual({ row: 2, col: 2 });
    expect(piecesWithCaptures).toContainEqual({ row: 6, col: 2 });
  });
});

describe("King Capture Sequences", () => {
  test("king should be able to capture in multiple directions in single turn", () => {
    const gameState: GameState = {
      ...createInitialGameState(),
      grid: Array(8)
        .fill(null)
        .map(() => Array(8).fill(null)),
    };

    // Set up zig-zag capture scenario
    gameState.grid[4][4] = {
      id: "p1-king",
      player: "PLAYER_ONE",
      isKing: true,
    };
    gameState.grid[5][5] = { id: "p2-1", player: "PLAYER_TWO", isKing: false };
    gameState.grid[3][5] = { id: "p2-2", player: "PLAYER_TWO", isKing: false };
    gameState.currentPlayer = "PLAYER_ONE";

    const validMoves = getValidMoves({ row: 4, col: 4 }, gameState);

    // Should be able to capture both pieces in a zig-zag pattern
    expect(validMoves).toContainEqual({ row: 2, col: 6 });
  });
});

