import { describe, expect, test } from "vitest";
import {
  createInitialGameState,
  GameState,
  getPlayerValidMoves,
  updateGameState,
} from "./gameState";
import { PlayerType, CheckerPiece } from "./types";

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
  test("capturing is mandatory when available", () => {
    const gameState = createEmptyGameState();

    // Setup a scenario where a capture is available
    const playerOnePiece: CheckerPiece = {
      id: "p1",
      player: "PLAYER_ONE",
      isKing: false,
    };
    const playerTwoPiece: CheckerPiece = {
      id: "p2",
      player: "PLAYER_TWO",
      isKing: false,
    };

    gameState.grid[3][3] = playerOnePiece;
    gameState.grid[4][4] = playerTwoPiece;

    // Try to make a regular move when capture is available
    const invalidMove = updateGameState(gameState, {
      type: "MOVE_PIECE",
      from: { row: 3, col: 3 },
      to: { row: 4, col: 2 },
    });

    expect(invalidMove.events).toContainEqual({ type: "INVALID_MOVE" });
    expect(invalidMove.state.grid[4][4]).toEqual(playerTwoPiece); // Piece should not be captured

    // Make the capture move
    const validMove = updateGameState(gameState, {
      type: "MOVE_PIECE",
      from: { row: 3, col: 3 },
      to: { row: 5, col: 5 },
    });

    expect(validMove.events).toContainEqual({
      type: "PIECE_CAPTURED",
      position: { row: 4, col: 4 },
      piece: playerTwoPiece,
    });
    expect(validMove.state.grid[4][4]).toBeNull(); // Captured piece should be removed
    expect(validMove.state.grid[5][5]).toEqual(playerOnePiece);
  });

  test("captures are made by jumping over opponent pieces", () => {
    const gameState = createEmptyGameState();

    // Setup pieces for capture
    const playerOnePiece: CheckerPiece = {
      id: "p1",
      player: "PLAYER_ONE",
      isKing: false,
    };
    const playerTwoPiece: CheckerPiece = {
      id: "p2",
      player: "PLAYER_TWO",
      isKing: false,
    };

    gameState.grid[2][2] = playerOnePiece;
    gameState.grid[3][3] = playerTwoPiece;

    // Make the capture move
    const result = updateGameState(gameState, {
      type: "MOVE_PIECE",
      from: { row: 2, col: 2 },
      to: { row: 4, col: 4 },
    });

    // Verify the capture
    expect(result.state.grid[2][2]).toBeNull(); // Original position empty
    expect(result.state.grid[3][3]).toBeNull(); // Captured piece removed
    expect(result.state.grid[4][4]).toEqual(playerOnePiece); // Piece moved to new position
    expect(result.events).toContainEqual({
      type: "PIECE_CAPTURED",
      position: { row: 3, col: 3 },
      piece: playerTwoPiece,
    });
  });

  describe("men capturing rules", () => {
    test("men can only capture forward", () => {
      const gameState = createEmptyGameState();

      // Setup pieces
      const playerOnePiece: CheckerPiece = {
        id: "p1",
        player: "PLAYER_ONE",
        isKing: false,
      };
      const playerTwoPieces: CheckerPiece[] = [
        {
          id: "p2-1",
          player: "PLAYER_TWO",
          isKing: false,
        },
        {
          id: "p2-2",
          player: "PLAYER_TWO",
          isKing: false,
        },
      ];

      // Place pieces so there's both a forward and backward capture opportunity
      gameState.grid[4][4] = playerOnePiece;
      gameState.grid[5][5] = playerTwoPieces[0]; // Forward capture opportunity
      gameState.grid[3][5] = playerTwoPieces[1]; // Backward capture opportunity

      // Try backward capture (should be invalid)
      const invalidMove = updateGameState(gameState, {
        type: "MOVE_PIECE",
        from: { row: 4, col: 4 },
        to: { row: 2, col: 6 },
      });

      expect(invalidMove.events).toContainEqual({ type: "INVALID_MOVE" });
      expect(invalidMove.state.grid[3][5]).toEqual(playerTwoPieces[1]); // Piece should remain

      // Try forward capture (should be valid)
      const validMove = updateGameState(gameState, {
        type: "MOVE_PIECE",
        from: { row: 4, col: 4 },
        to: { row: 6, col: 6 },
      });

      expect(validMove.events).toContainEqual({
        type: "PIECE_CAPTURED",
        position: { row: 5, col: 5 },
        piece: playerTwoPieces[0],
      });
      expect(validMove.state.grid[5][5]).toBeNull(); // Captured piece should be removed
      expect(validMove.state.grid[6][6]).toEqual(playerOnePiece);
    });
  });

  describe("kings capturing rules", () => {
    test("kings can capture in any direction and change direction", () => {
      const gameState = createEmptyGameState();

      // Setup king and opponent pieces
      const king: CheckerPiece = {
        id: "king",
        player: "PLAYER_ONE",
        isKing: true,
      };
      const opponentPieces: CheckerPiece[] = [
        {
          id: "p2-1",
          player: "PLAYER_TWO",
          isKing: false,
        },
        {
          id: "p2-2",
          player: "PLAYER_TWO",
          isKing: false,
        },
      ];

      gameState.grid[4][4] = king;
      gameState.grid[3][3] = opponentPieces[0]; // Backward capture
      gameState.grid[5][3] = opponentPieces[1]; // Forward capture

      // Test backward capture
      const backwardCapture = updateGameState(gameState, {
        type: "MOVE_PIECE",
        from: { row: 4, col: 4 },
        to: { row: 2, col: 2 },
      });

      // Verify grid state after backward capture
      expect(backwardCapture.state.grid[4][4]).toBeNull(); // Original position empty
      expect(backwardCapture.state.grid[3][3]).toBeNull(); // Captured piece removed
      expect(backwardCapture.state.grid[2][2]).toEqual(king); // King in new position
      expect(backwardCapture.events).toContainEqual({
        type: "PIECE_CAPTURED",
        position: { row: 3, col: 3 },
        piece: opponentPieces[0],
      });

      // Reset game state for forward capture test
      const newGameState = createEmptyGameState();
      newGameState.grid[4][4] = king;
      newGameState.grid[5][3] = opponentPieces[1];

      // Test forward capture
      const forwardCapture = updateGameState(newGameState, {
        type: "MOVE_PIECE",
        from: { row: 4, col: 4 },
        to: { row: 6, col: 2 },
      });

      // Verify grid state after forward capture
      expect(forwardCapture.state.grid[4][4]).toBeNull(); // Original position empty
      expect(forwardCapture.state.grid[5][3]).toBeNull(); // Captured piece removed
      expect(forwardCapture.state.grid[6][2]).toEqual(king); // King in new position
      expect(forwardCapture.events).toContainEqual({
        type: "PIECE_CAPTURED",
        position: { row: 5, col: 3 },
        piece: opponentPieces[1],
      });
    });

    test("multiple captures are mandatory and continue from landing square", () => {
      const gameState = createEmptyGameState();

      // Setup king and opponent pieces for multiple captures
      const king: CheckerPiece = {
        id: "king",
        player: "PLAYER_ONE",
        isKing: true,
      };
      const opponentPieces: CheckerPiece[] = [
        {
          id: "p2-1",
          player: "PLAYER_TWO",
          isKing: false,
        },
        {
          id: "p2-2",
          player: "PLAYER_TWO",
          isKing: false,
        },
        {
          // Extra piece so game is not over after captures
          id: "p2-3",
          player: "PLAYER_TWO",
          isKing: false,
        },
      ];

      gameState.grid[2][2] = king;
      gameState.grid[3][3] = opponentPieces[0];
      gameState.grid[5][5] = opponentPieces[1];
      gameState.grid[2][1] = opponentPieces[2];

      // First capture
      const firstCapture = updateGameState(gameState, {
        type: "MOVE_PIECE",
        from: { row: 2, col: 2 },
        to: { row: 4, col: 4 },
      });

      // Verify grid state after first capture
      expect(firstCapture.state.grid[2][2]).toBeNull(); // Original position empty
      expect(firstCapture.state.grid[3][3]).toBeNull(); // First captured piece removed
      expect(firstCapture.state.grid[4][4]).toEqual(king); // King in intermediate position
      expect(firstCapture.events).toContainEqual({
        type: "PIECE_CAPTURED",
        position: { row: 3, col: 3 },
        piece: opponentPieces[0],
      });

      expect(firstCapture.state.gameStatus).toBe("PLAYER_ONE"); // Turn shouldn't change yet

      // Second capture
      const secondCapture = updateGameState(firstCapture.state, {
        type: "MOVE_PIECE",
        from: { row: 4, col: 4 },
        to: { row: 6, col: 6 },
      });

      // Verify grid state after second capture
      expect(secondCapture.state.grid[4][4]).toBeNull(); // Intermediate position empty
      expect(secondCapture.state.grid[5][5]).toBeNull(); // Second captured piece removed
      expect(secondCapture.state.grid[6][6]).toEqual(king); // King in final position
      expect(secondCapture.events).toContainEqual({
        type: "PIECE_CAPTURED",
        position: { row: 5, col: 5 },
        piece: opponentPieces[1],
      });
      expect(secondCapture.state.gameStatus).toBe("PLAYER_TWO"); // Turn should change after all captures
    });
  });

  test("captured pieces are immediately removed", () => {
    const gameState = createEmptyGameState();

    // Setup pieces
    const playerOnePiece: CheckerPiece = {
      id: "p1",
      player: "PLAYER_ONE",
      isKing: false,
    };
    const playerTwoPiece: CheckerPiece = {
      id: "p2",
      player: "PLAYER_TWO",
      isKing: false,
    };

    gameState.grid[2][2] = playerOnePiece;
    gameState.grid[3][3] = playerTwoPiece;

    // Make capture move
    const result = updateGameState(gameState, {
      type: "MOVE_PIECE",
      from: { row: 2, col: 2 },
      to: { row: 4, col: 4 },
    });

    // Verify piece is immediately removed
    expect(result.state.grid[3][3]).toBeNull();
    expect(
      result.events.findIndex((e) => e.type === "PIECE_CAPTURED")
    ).toBeLessThan(result.events.findIndex((e) => e.type === "PIECE_MOVED"));
  });

  test("player can choose between multiple capture sequences", () => {
    const gameState = createEmptyGameState();

    // Setup pieces for multiple capture opportunities
    const playerOnePiece: CheckerPiece = {
      id: "p1",
      player: "PLAYER_ONE",
      isKing: true, // Make it a king to have more capture options
    };
    const playerTwoPieces: CheckerPiece[] = [
      { id: "p2-1", player: "PLAYER_TWO", isKing: false },
      { id: "p2-2", player: "PLAYER_TWO", isKing: false },
    ];

    gameState.grid[3][3] = playerOnePiece;
    gameState.grid[4][4] = playerTwoPieces[0];
    gameState.grid[4][2] = playerTwoPieces[1];

    // Try first capture sequence
    const firstSequence = updateGameState(gameState, {
      type: "MOVE_PIECE",
      from: { row: 3, col: 3 },
      to: { row: 5, col: 5 },
    });

    expect(firstSequence.events).toContainEqual({
      type: "PIECE_CAPTURED",
      position: { row: 4, col: 4 },
      piece: playerTwoPieces[0],
    });

    // Reset and try second capture sequence
    const newGameState = { ...gameState };
    const secondSequence = updateGameState(newGameState, {
      type: "MOVE_PIECE",
      from: { row: 3, col: 3 },
      to: { row: 5, col: 1 },
    });

    expect(secondSequence.events).toContainEqual({
      type: "PIECE_CAPTURED",
      position: { row: 4, col: 2 },
      piece: playerTwoPieces[1],
    });
  });

  describe("direction restrictions", () => {
    test("men cannot change direction during captures", () => {
      const gameState = createEmptyGameState();

      // Setup pieces for a potential direction change capture
      const playerOnePiece: CheckerPiece = {
        id: "p1",
        player: "PLAYER_ONE",
        isKing: false,
      };
      const playerTwoPieces: CheckerPiece[] = [
        { id: "p2-1", player: "PLAYER_TWO", isKing: false },
        { id: "p2-2", player: "PLAYER_TWO", isKing: false },
      ];

      gameState.grid[2][2] = playerOnePiece;
      gameState.grid[3][3] = playerTwoPieces[0];
      gameState.grid[4][2] = playerTwoPieces[1];

      // Make first capture
      const firstCapture = updateGameState(gameState, {
        type: "MOVE_PIECE",
        from: { row: 2, col: 2 },
        to: { row: 4, col: 4 },
      });

      // Try to change direction (should be invalid)
      const invalidMove = updateGameState(firstCapture.state, {
        type: "MOVE_PIECE",
        from: { row: 4, col: 4 },
        to: { row: 3, col: 1 },
      });

      expect(invalidMove.events).toContainEqual({ type: "INVALID_MOVE" });
    });

    test("kings can change direction during captures", () => {
      const gameState = createEmptyGameState();

      // Setup king and opponent pieces
      const king: CheckerPiece = {
        id: "king",
        player: "PLAYER_ONE",
        isKing: true,
      };
      const playerTwoPieces: CheckerPiece[] = [
        { id: "p2-1", player: "PLAYER_TWO", isKing: false },
        { id: "p2-2", player: "PLAYER_TWO", isKing: false },
        {
          // Extra piece so game is not over after captures
          id: "p2-3",
          player: "PLAYER_TWO",
          isKing: false,
        },
      ];

      gameState.grid[2][2] = king;
      gameState.grid[3][3] = playerTwoPieces[0];
      gameState.grid[5][3] = playerTwoPieces[1];
      gameState.grid[7][7] = playerTwoPieces[2];

      // Make first capture
      const firstCapture = updateGameState(gameState, {
        type: "MOVE_PIECE",
        from: { row: 2, col: 2 },
        to: { row: 4, col: 4 },
      });

      // Verify first capture
      expect(firstCapture.state.grid[2][2]).toBeNull(); // Original position empty
      expect(firstCapture.state.grid[3][3]).toBeNull(); // First captured piece removed
      expect(firstCapture.state.grid[4][4]).toEqual(king); // King in intermediate position
      expect(firstCapture.events).toContainEqual({
        type: "PIECE_CAPTURED",
        position: { row: 3, col: 3 },
        piece: playerTwoPieces[0],
      });
      expect(firstCapture.state.gameStatus).toBe("PLAYER_ONE"); // Turn shouldn't change yet

      // Change direction for second capture
      const secondCapture = updateGameState(firstCapture.state, {
        type: "MOVE_PIECE",
        from: { row: 4, col: 4 },
        to: { row: 6, col: 2 },
      });

      // Verify second capture
      expect(secondCapture.state.grid[4][4]).toBeNull(); // Intermediate position empty
      expect(secondCapture.state.grid[5][3]).toBeNull(); // Second captured piece removed
      expect(secondCapture.state.grid[6][2]).toEqual(king); // King in final position
      expect(secondCapture.events).toContainEqual({
        type: "PIECE_CAPTURED",
        position: { row: 5, col: 3 },
        piece: playerTwoPieces[1],
      });
      expect(secondCapture.state.gameStatus).toBe("PLAYER_TWO"); // Turn should change after all captures
    });
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
  test("win by capturing all opponent pieces", () => {
    const gameState = createEmptyGameState();

    // Setup a simple scenario where PLAYER_ONE can capture the last PLAYER_TWO piece
    const playerOnePiece: CheckerPiece = {
      id: "p1",
      player: "PLAYER_ONE",
      isKing: false,
    };
    const playerTwoPiece: CheckerPiece = {
      id: "p2",
      player: "PLAYER_TWO",
      isKing: false,
    };

    gameState.grid[4][3] = playerOnePiece;
    gameState.grid[5][4] = playerTwoPiece; // Last remaining PLAYER_TWO piece

    const result = updateGameState(gameState, {
      type: "MOVE_PIECE",
      from: { row: 4, col: 3 },
      to: { row: 6, col: 5 },
    });

    expect(result.state.gameStatus).toBe("GAME_OVER");
    expect(result.events).toContainEqual({
      type: "GAME_OVER",
      winner: "PLAYER_ONE",
    });
    expect(result.state.grid[5][4]).toBeNull(); // Captured piece should be removed
  });

  test("win when opponent has no legal moves", () => {
    const gameState = createEmptyGameState();

    // Setup a scenario where PLAYER_TWO is blocked and has no legal moves
    const playerOnePieces: CheckerPiece[] = Array(3)
      .fill(null)
      .map((_, i) => ({
        id: `p1-${i}`,
        player: "PLAYER_ONE",
        isKing: false,
      }));

    const playerTwoPiece: CheckerPiece = {
      id: "p2",
      player: "PLAYER_TWO",
      isKing: false,
    };

    // Place PLAYER_TWO piece in a corner
    gameState.grid[0][0] = playerTwoPiece;

    // Block all possible moves
    gameState.grid[1][1] = playerOnePieces[0];
    gameState.gameStatus = "PLAYER_TWO"; // Set it to PLAYER_TWO's turn

    // Attempt to move - should result in game over since no moves are possible
    const result = updateGameState(gameState, {
      type: "MOVE_PIECE",
      from: { row: 0, col: 0 },
      to: { row: 2, col: 2 }, // Invalid move
    });

    expect(result.events).toContainEqual({ type: "INVALID_MOVE" });
    expect(result.events).toContainEqual({
      type: "GAME_OVER",
      winner: "PLAYER_ONE",
    });
    expect(result.state.gameStatus).toBe("GAME_OVER");
    expect(getPlayerValidMoves("PLAYER_TWO", gameState).size()).toBe(0);
  });
});

describe("draw conditions", () => {
  test("draw when neither player can force win", () => {
    const gameState = createEmptyGameState();

    // Setup a position where both players have only one king
    // and neither can force a win
    const playerOneKing: CheckerPiece = {
      id: "p1-king",
      player: "PLAYER_ONE",
      isKing: true,
    };

    const playerTwoKing: CheckerPiece = {
      id: "p2-king",
      player: "PLAYER_TWO",
      isKing: true,
    };

    gameState.grid[0][0] = playerOneKing;
    gameState.grid[7][7] = playerTwoKing;

    // Verify both players have valid moves but neither can capture
    const playerOneMoves = getPlayerValidMoves("PLAYER_ONE", gameState);
    const playerTwoMoves = getPlayerValidMoves("PLAYER_TWO", gameState);

    expect(playerOneMoves.size()).toBeGreaterThan(0);
    expect(playerTwoMoves.size()).toBeGreaterThan(0);

    // Verify no capture moves are available
    const hasCaptures = [...playerOneMoves.values(), ...playerTwoMoves.values()]
      .flat()
      .some((move) => move.isCapture);

    expect(hasCaptures).toBe(false);
  });
});

