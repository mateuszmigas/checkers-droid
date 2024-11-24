import { CustomMap } from "../utils/customMap";
import { GameEvent } from "./gameEvent";
import {
  CheckerPosition,
  CheckerPiece,
  PlayerType,
  CheckerPossibleTarget,
  CheckerValidMoveMap,
  CheckerMove,
} from "./types";

const TOTAL_PIECES_COUNT = 12;

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
  currentTurn: PlayerType;
  winner?: PlayerType | "DRAW";
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
    currentTurn: "PLAYER_ONE",
  };
};

const createValidMovesMap = () =>
  new CustomMap<CheckerPosition, CheckerPossibleTarget[]>(
    (position) => `${position.row}-${position.col}`
  );

const getPieceAtPosition = (
  gameState: GameState,
  position: CheckerPosition
): CheckerPiece | null => gameState.grid[position.row][position.col] ?? null;

const getAvailableCaptureMoves = (
  player: PlayerType,
  gameState: GameState
): CheckerPossibleTarget[] =>
  Array.from(getPlayerValidMoves(player, gameState).values())
    .flatMap((moves) => moves)
    .filter((move) => move.isCapture);

export const getPlayerValidMoves = (
  player: PlayerType,
  gameState: GameState
): CheckerValidMoveMap => {
  if (gameState.winner) return createValidMovesMap();

  const playerPieces = getRemainingPieces(gameState.grid).filter(
    (piece) => piece.player === player
  );

  // First check for pieces that can capture
  const captureMovesMap = createValidMovesMap();
  for (const piece of playerPieces) {
    const captureMoves = getValidCaptureMoves(piece.position, gameState);
    if (captureMoves.length > 0) {
      captureMovesMap.set(
        piece.position,
        captureMoves.map((pos) => ({
          targetPosition: pos,
          isCapture: true,
        }))
      );
    }
  }
  if (captureMovesMap.size() > 0) {
    return captureMovesMap;
  }

  // If no captures available, check all pieces for regular moves
  const regularMovesMap = createValidMovesMap();
  for (const piece of playerPieces) {
    const position = piece.position;
    const regularMoves = getValidRegularMoves(position, gameState);
    if (regularMoves.length > 0) {
      regularMovesMap.set(
        position,
        regularMoves.map((pos) => ({
          targetPosition: pos,
          isCapture: false,
        }))
      );
    }
  }
  return regularMovesMap;
};

const getValidCaptureMoves = (
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

    if (isValidCaptureJump(position, jumpOver, target, gameState)) {
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

const getValidRegularMoves = (
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

const isValidCaptureJump = (
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

const calculateGameEvents = (
  oldState: GameState,
  newState: GameState,
  moveAction: GameAction
): GameEvent[] => {
  const events: GameEvent[] = [];
  const { from, to } = moveAction;

  // Check for captured pieces
  oldState.grid.forEach((row, rowIndex) => {
    row.forEach((piece, colIndex) => {
      if (piece && !newState.grid[rowIndex][colIndex]) {
        // This piece was removed, must have been captured
        events.push({
          type: "PIECE_CAPTURED",
          position: { row: rowIndex, col: colIndex },
          player: oldState.currentTurn,
        });
      }
    });
  });

  // Check for piece movement
  const movedPiece = newState.grid[to.row][to.col];
  if (movedPiece) {
    events.push({
      type: "PIECE_MOVED",
      from,
      to,
      player: oldState.currentTurn,
    });
  }

  // Check for crowned pieces
  const oldPiece = oldState.grid[from.row][from.col];
  if (oldPiece && movedPiece?.isKing && !oldPiece.isKing) {
    events.push({
      type: "PIECE_CROWNED",
      position: to,
      player: oldState.currentTurn,
    });
  }

  // Check for turn change
  if (newState.currentTurn !== oldState.currentTurn) {
    events.push({
      type: "TURN_CHANGED",
      player: newState.currentTurn,
    });
  }

  // Check for game over
  if (newState.winner) {
    events.push({
      type: "GAME_OVER",
      winner: newState.winner,
    });
  }

  return events;
};

const moveAndPromotePieceIfEligible = (
  grid: CheckerGridCell[][],
  move: CheckerMove,
  piece: CheckerPiece
): CheckerGridCell[][] => {
  const newGrid = grid.map((row) => [...row]);

  newGrid[move.to.row][move.to.col] = {
    ...piece,
    isKing:
      piece.isKing ||
      (piece.player === "PLAYER_ONE" && move.to.row === 7) ||
      (piece.player === "PLAYER_TWO" && move.to.row === 0),
  };
  newGrid[move.from.row][move.from.col] = null;

  return newGrid;
};

const getCapturedPieces = (
  grid: CheckerGridCell[][],
  move: CheckerMove,
  piece: CheckerPiece
): CheckerPosition[] => {
  const direction = {
    rowDir: Math.sign(move.to.row - move.from.row),
    colDir: Math.sign(move.to.col - move.from.col),
  };

  const capturedPieces: CheckerPosition[] = [];

  let currentRow = move.from.row + direction.rowDir;
  let currentCol = move.from.col + direction.colDir;

  // Check each position along the move path
  while (currentRow !== move.to.row && currentCol !== move.to.col) {
    const pieceAtPosition = grid[currentRow][currentCol];

    if (pieceAtPosition && pieceAtPosition.player !== piece.player) {
      capturedPieces.push({ row: currentRow, col: currentCol });
    }

    currentRow += direction.rowDir;
    currentCol += direction.colDir;
  }

  return capturedPieces;
};

const validatePieceMove = (state: GameState, move: CheckerMove) => {
  if (!isValidPosition(move.from) || !isValidPosition(move.to)) {
    return false;
  }

  const piece = getPieceAtPosition(state, move.from);
  if (!piece || piece.player !== state.currentTurn) {
    return false;
  }

  // Get valid moves for the selected piece
  const validMovesMap = getPlayerValidMoves(state.currentTurn, state);
  const validMovesForPiece = validMovesMap.get(move.from) || [];

  // Check if the target position is in the valid moves
  if (
    !validMovesForPiece.some(
      (validMove) =>
        validMove.targetPosition.row === move.to.row &&
        validMove.targetPosition.col === move.to.col
    )
  ) {
    return false;
  }

  return true;
};

const getOpponentPlayer = (player: PlayerType): PlayerType =>
  player === "PLAYER_ONE" ? "PLAYER_TWO" : "PLAYER_ONE";

const checkIfPlayerWins = (
  grid: CheckerGridCell[][],
  currentPlayer: PlayerType
) => {
  const opponentPlayer = getOpponentPlayer(currentPlayer);

  // Check if opponent has any pieces left
  const opponentHasPiecesLeft = getRemainingPieces(grid).some(
    (piece) => piece.player === opponentPlayer
  );

  if (!opponentHasPiecesLeft) {
    return true;
  }

  // Check if opponent has valid moves
  const opponentMoves = getPlayerValidMoves(opponentPlayer, {
    grid,
    currentTurn: opponentPlayer,
  });

  if (opponentMoves.size() === 0) {
    return true;
  }

  return false;
};

const getRemainingPieces = (grid: CheckerGridCell[][]) => {
  const remainingPieces: (CheckerPiece & { position: CheckerPosition })[] = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = grid[row][col];
      if (piece) {
        remainingPieces.push({ ...piece, position: { row, col } });
      }
    }
  }
  return remainingPieces;
};

const checkForDrawCondition = (
  grid: CheckerGridCell[][],
  currentPlayer: PlayerType
): boolean => {
  const allPieces = getRemainingPieces(grid);
  const opponentPlayer = getOpponentPlayer(currentPlayer);
  const onlyKings = allPieces.every((piece) => piece.isKing);
  const noCapturePossible =
    getAvailableCaptureMoves(currentPlayer, {
      grid,
      currentTurn: currentPlayer,
    }).length === 0 &&
    getAvailableCaptureMoves(opponentPlayer, {
      grid,
      currentTurn: opponentPlayer,
    }).length === 0;

  return onlyKings && noCapturePossible && allPieces.length <= 3;
};

const performGameStateUpdate = (
  state: GameState,
  action: GameAction
): GameState | "INVALID_MOVE" => {
  switch (action.type) {
    case "MOVE_PIECE": {
      if (state.winner) {
        return "INVALID_MOVE";
      }

      const move = { from: action.from, to: action.to };

      if (!validatePieceMove(state, move)) {
        return "INVALID_MOVE";
      }

      let newGrid = state.grid.map((row) => [...row]);

      const piece = getPieceAtPosition(state, move.from)!;
      const capturedPieces = getCapturedPieces(newGrid, move, piece);
      capturedPieces.forEach((position) => {
        newGrid[position.row][position.col] = null;
      });

      newGrid = moveAndPromotePieceIfEligible(newGrid, move, piece);

      // if there is additional capture, continue the turn
      if (capturedPieces.length > 0) {
        const additionalCaptures = getValidCaptureMoves(move.to, {
          ...state,
          grid: newGrid,
        });

        if (additionalCaptures.length > 0) {
          return {
            ...state,
            grid: newGrid,
          };
        }
      }

      if (checkIfPlayerWins(newGrid, state.currentTurn)) {
        return {
          ...state,
          grid: newGrid,
          winner: state.currentTurn,
        };
      }

      if (checkForDrawCondition(newGrid, state.currentTurn)) {
        return {
          ...state,
          grid: newGrid,
          winner: "DRAW",
        };
      }

      // Switch turn to opponent
      return {
        ...state,
        grid: newGrid,
        currentTurn: getOpponentPlayer(state.currentTurn),
      };
    }
    default:
      return state;
  }
};

export const updateGameState = (
  state: GameState,
  action: GameAction
): GameStateUpdate => {
  const newState = performGameStateUpdate(state, action);

  if (newState === "INVALID_MOVE") {
    const currentPlayer = state.currentTurn;
    const validMoves = getPlayerValidMoves(currentPlayer, state);

    if (validMoves.size() === 0) {
      const winner =
        currentPlayer === "PLAYER_ONE" ? "PLAYER_TWO" : "PLAYER_ONE";
      return {
        state: { ...state, winner },
        events: [{ type: "INVALID_MOVE" }, { type: "GAME_OVER", winner }],
      };
    }

    return { state, events: [{ type: "INVALID_MOVE" }] };
  }

  const events = calculateGameEvents(state, newState, action);
  return { state: newState, events };
};

export const calculateScoredPieces = (state: GameState, player: PlayerType) =>
  TOTAL_PIECES_COUNT -
  state.grid
    .flat()
    .filter(
      (cell): cell is CheckerPiece => cell !== null && cell.player !== player
    ).length;

