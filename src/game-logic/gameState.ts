import { CustomMap } from "../utils/customMap";
import { GameEvent } from "./gameEvent";
import {
  CheckerPosition,
  CheckerPiece,
  PlayerType,
  CheckerValidMove,
  CheckerValidMoveMap,
} from "./types";

export type GameAction = {
  type: "MOVE_PIECE";
  from: CheckerPosition;
  to: CheckerPosition;
};

type GameStateUpdate = {
  state: GameState;
  events: GameEvent[];
};

type CheckerGridCell = CheckerPiece | null;

export type GameState = {
  grid: CheckerGridCell[][]; // 8x8 grid representing the board
  gameStatus: PlayerType | "GAME_OVER";
};

export const createInitialGameState = (): GameState => {
  // Initialize empty 8x8 grid
  const grid: CheckerGridCell[][] = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  // Place Player One's checkers
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 !== 0) {
        grid[row][col] = {
          id: `p1-${row}-${col}`,
          player: "PLAYER_ONE",
          isKing: false,
        };
      }
    }
  }

  // Place Player Two's checkers
  for (let row = 5; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 !== 0) {
        grid[row][col] = {
          id: `p2-${row}-${col}`,
          player: "PLAYER_TWO",
          isKing: false,
        };
      }
    }
  }

  return {
    grid,
    gameStatus: "PLAYER_ONE",
  };
};

const createPositionMap = () =>
  new CustomMap<CheckerPosition, CheckerValidMove[]>(
    (position) => `${position.row}-${position.col}`
  );

const getPieceAtPosition = (
  gameState: GameState,
  position: CheckerPosition
): CheckerPiece | null => gameState.grid[position.row][position.col] ?? null;

export const getPlayerCaptures = (
  player: PlayerType,
  gameState: GameState
): CheckerValidMove[] =>
  Array.from(getPlayerValidMoves(player, gameState).values())
    .flatMap((moves) => moves)
    .filter((move) => move.isCapture);

export const getPlayerValidMoves = (
  player: PlayerType,
  gameState: GameState
): CheckerValidMoveMap => {
  const movesMap = createPositionMap();

  // First check for pieces that can capture
  let hasCaptures = false;
  const piecesWithCaptures = createPositionMap();

  // First pass: find all capture moves
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = gameState.grid[row][col];
      if (piece?.player === player) {
        const position = { row, col };
        const captureMoves = getCaptureMoves(position, gameState);
        if (captureMoves.length > 0) {
          hasCaptures = true;
          piecesWithCaptures.set(
            position,
            captureMoves.map((pos) => ({
              targetPosition: pos,
              isCapture: true,
            }))
          );
        }
      }
    }
  }

  // If there are captures available, only they are valid
  if (hasCaptures) {
    return piecesWithCaptures;
  }

  // If no captures available, check all pieces for regular moves
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = gameState.grid[row][col];
      if (piece?.player === player) {
        const position = { row, col };
        const regularMoves = getRegularMoves(position, gameState);
        if (regularMoves.length > 0) {
          movesMap.set(
            position,
            regularMoves.map((pos) => ({
              targetPosition: pos,
              isCapture: false,
            }))
          );
        }
      }
    }
  }

  return movesMap;
};

const getCaptureMoves = (
  position: CheckerPosition,
  gameState: GameState,
  previousDirection?: { rowDir: number; colDir: number }
): CheckerPosition[] => {
  const piece = getPieceAtPosition(gameState, position);
  if (!piece) return [];

  const moves: CheckerPosition[] = [];
  let directions = piece.isKing
    ? [
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ]
    : piece.player === "PLAYER_ONE"
    ? [
        [1, 1],
        [1, -1],
      ]
    : [
        [-1, 1],
        [-1, -1],
      ];

  // For regular pieces during multiple captures, maintain direction
  if (!piece.isKing && previousDirection) {
    directions = directions.filter(
      ([rowDir]) => Math.sign(rowDir) === Math.sign(previousDirection.rowDir)
    );
  }

  for (const [rowDir, colDir] of directions) {
    const jumpOver = {
      row: position.row + rowDir,
      col: position.col + colDir,
    };
    const target = {
      row: position.row + rowDir * 2,
      col: position.col + colDir * 2,
    };

    if (canJumpOver(position, jumpOver, target, gameState)) {
      // For kings, ensure there are no other pieces beyond the jumped piece
      if (piece.isKing) {
        let nextRow = target.row + rowDir;
        let nextCol = target.col + colDir;
        while (isValidPosition({ row: nextRow, col: nextCol })) {
          if (getPieceAtPosition(gameState, { row: nextRow, col: nextCol })) {
            break;
          }
          nextRow += rowDir;
          nextCol += colDir;
        }
      }
      moves.push(target);
    }
  }

  return moves;
};

const getRegularMoves = (
  position: CheckerPosition,
  gameState: GameState
): CheckerPosition[] => {
  const piece = getPieceAtPosition(gameState, position);
  if (!piece) return [];

  const moves: CheckerPosition[] = [];
  const directions = piece.isKing
    ? [
        [1, 1], // forward-right
        [1, -1], // forward-left
        [-1, 1], // backward-right
        [-1, -1], // backward-left
      ]
    : piece.player === "PLAYER_ONE"
    ? [
        [1, 1], // forward-right
        [1, -1], // forward-left
      ]
    : [
        [-1, 1], // forward-right (for PLAYER_TWO)
        [-1, -1], // forward-left (for PLAYER_TWO)
      ];

  for (const [rowDir, colDir] of directions) {
    if (piece.isKing) {
      let distance = 1;
      while (true) {
        const target = {
          row: position.row + rowDir * distance,
          col: position.col + colDir * distance,
        };

        if (!isValidPosition(target)) break;
        if (getPieceAtPosition(gameState, target)) break;

        moves.push(target);
        distance++;
      }
    } else {
      const target = {
        row: position.row + rowDir,
        col: position.col + colDir,
      };

      if (isValidPosition(target) && !getPieceAtPosition(gameState, target)) {
        moves.push(target);
      }
    }
  }

  return moves;
};

const canJumpOver = (
  from: CheckerPosition,
  jumpOver: CheckerPosition,
  target: CheckerPosition,
  gameState: GameState
): boolean => {
  // Check if target position is within bounds
  if (!isValidPosition(target)) return false;

  // Check if target position is empty
  if (getPieceAtPosition(gameState, target)) return false;

  const piece = getPieceAtPosition(gameState, from)!;
  const jumpedPiece = getPieceAtPosition(gameState, jumpOver);

  // Must have a piece to jump over and it must be an opponent's piece
  if (!jumpedPiece || jumpedPiece.player === piece?.player) return false;

  // For non-king pieces, verify they are moving in the correct direction
  if (!piece?.isKing) {
    const forwardDirection = piece.player === "PLAYER_ONE" ? 1 : -1;
    if (Math.sign(target.row - from.row) !== forwardDirection) return false;
  }

  return true;
};

const isValidPosition = (position: CheckerPosition): boolean =>
  position.row >= 0 &&
  position.row < 8 &&
  position.col >= 0 &&
  position.col < 8;

export const updateGameState = (
  state: GameState,
  action: GameAction
): GameStateUpdate => {
  if (state.gameStatus === "GAME_OVER") {
    return { state, events: [{ type: "INVALID_MOVE" }] };
  }

  switch (action.type) {
    case "MOVE_PIECE": {
      if (!isValidPosition(action.from) || !isValidPosition(action.to)) {
        return checkForNoMoves(state);
      }

      const piece = getPieceAtPosition(state, action.from);
      if (!piece || piece.player !== state.gameStatus) {
        return checkForNoMoves(state);
      }

      // Get valid moves for the selected piece
      const validMovesMap = getPlayerValidMoves(state.gameStatus, state);
      const validMovesForPiece = validMovesMap.get(action.from) || [];

      // Check if the target position is in the valid moves
      if (
        !validMovesForPiece.some(
          (move) =>
            move.targetPosition.row === action.to.row &&
            move.targetPosition.col === action.to.col
        )
      ) {
        return checkForNoMoves(state);
      }

      const events: GameEvent[] = [];
      const newGrid = state.grid.map((row) => [...row]);

      // Handle the capture sequence
      const rowDiff = action.to.row - action.from.row;
      const colDiff = action.to.col - action.from.col;
      const steps = Math.abs(rowDiff);
      const rowStep = Math.sign(rowDiff);
      const colStep = Math.sign(colDiff);

      // Capture pieces along the path
      for (let i = 1; i < steps; i++) {
        const jumpedRow = action.from.row + i * rowStep;
        const jumpedCol = action.from.col + i * colStep;
        const jumpedPiece = getPieceAtPosition(state, {
          row: jumpedRow,
          col: jumpedCol,
        });

        if (jumpedPiece && jumpedPiece.player !== piece.player) {
          newGrid[jumpedRow][jumpedCol] = null;
          events.push({
            type: "PIECE_CAPTURED",
            position: { row: jumpedRow, col: jumpedCol },
            piece: jumpedPiece,
          });
        }
      }

      // Move the piece
      newGrid[action.to.row][action.to.col] = piece;
      newGrid[action.from.row][action.from.col] = null;

      // Check if piece becomes king
      const becomesKing =
        !piece.isKing &&
        ((piece.player === "PLAYER_ONE" && action.to.row === 7) ||
          (piece.player === "PLAYER_TWO" && action.to.row === 0));

      if (becomesKing) {
        newGrid[action.to.row][action.to.col]!.isKing = true;
        events.push({
          type: "PIECE_CROWNED",
          position: action.to,
        });
      }

      events.push({
        type: "PIECE_MOVED",
        from: action.from,
        to: action.to,
      });

      // Check if this move was a capture move
      const wasCapture = events.some(
        (event) => event.type === "PIECE_CAPTURED"
      );

      // Only check for additional captures if this move was a capture
      if (wasCapture) {
        const additionalCaptures = getCaptureMoves(action.to, {
          ...state,
          grid: newGrid,
        });

        // Only continue the turn if there are additional captures available
        if (additionalCaptures.length > 0) {
          return { state: { ...state, grid: newGrid }, events };
        }
      }

      // If it wasn't a capture move, or there are no additional captures, change turns
      const nextPlayer =
        state.gameStatus === "PLAYER_ONE" ? "PLAYER_TWO" : "PLAYER_ONE";
      events.push({
        type: "TURN_CHANGED",
        player: nextPlayer,
      });

      // Check win condition
      const opponentPlayer =
        piece.player === "PLAYER_ONE" ? "PLAYER_TWO" : "PLAYER_ONE";
      const opponentHasPieces = newGrid.some((row) =>
        row.some((cell) => cell?.player === opponentPlayer)
      );

      if (!opponentHasPieces) {
        return {
          state: {
            ...state,
            grid: newGrid,
            gameStatus: "GAME_OVER",
          },
          events: [...events, { type: "GAME_OVER", winner: piece.player }],
        };
      }

      // Check if opponent has any valid moves
      const opponentMoves = getPlayerValidMoves(nextPlayer, {
        ...state,
        grid: newGrid,
        gameStatus: nextPlayer,
      });

      // If opponent has no valid moves, current player wins
      if (opponentMoves.size() === 0) {
        return {
          state: {
            ...state,
            grid: newGrid,
            gameStatus: "GAME_OVER",
          },
          events: [...events, { type: "GAME_OVER", winner: piece.player }],
        };
      }

      // Check for draw condition (both players only have kings and no captures possible)
      const allPieces = newGrid
        .flat()
        .filter((cell): cell is CheckerPiece => cell !== null);
      const onlyKings = allPieces.every((piece) => piece.isKing);
      const playerOneCaptures = getPlayerCaptures("PLAYER_ONE", {
        ...state,
        grid: newGrid,
        gameStatus: "PLAYER_ONE",
      });
      const playerTwoCaptures = getPlayerCaptures("PLAYER_TWO", {
        ...state,
        grid: newGrid,
        gameStatus: "PLAYER_TWO",
      });
      const noCapturePossible =
        playerOneCaptures.length === 0 && playerTwoCaptures.length === 0;

      if (onlyKings && noCapturePossible && allPieces.length <= 3) {
        return {
          state: {
            ...state,
            grid: newGrid,
            gameStatus: "GAME_OVER",
          },
          events: [...events, { type: "GAME_OVER", result: "DRAW" }],
        };
      }

      return {
        state: {
          ...state,
          grid: newGrid,
          gameStatus: nextPlayer,
        },
        events,
      };
    }
    default:
      return { state, events: [] };
  }
};

const checkForNoMoves = (state: GameState): GameStateUpdate => {
  const currentPlayer = state.gameStatus as PlayerType;
  const validMoves = getPlayerValidMoves(currentPlayer, state);

  if (validMoves.size() === 0) {
    const winner = currentPlayer === "PLAYER_ONE" ? "PLAYER_TWO" : "PLAYER_ONE";
    return {
      state: { ...state, gameStatus: "GAME_OVER" },
      events: [{ type: "INVALID_MOVE" }, { type: "GAME_OVER", winner }],
    };
  }

  return { state, events: [{ type: "INVALID_MOVE" }] };
};

