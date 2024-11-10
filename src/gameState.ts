export type PlayerType = "PLAYER_ONE" | "PLAYER_TWO";

export interface Position {
  row: number;
  col: number;
}

export interface CheckerPiece {
  id: string;
  player: PlayerType;
  isKing: boolean;
}

// Define what can be in a grid cell
export type GridCell = CheckerPiece | null;

export interface GameState {
  grid: GridCell[][]; // 8x8 grid representing the board
  currentPlayer: PlayerType;
  selectedPosition: Position | null;
  possibleMoves: Position[];
  capturedPieces: CheckerPiece[];
  gameOver?: boolean;
  winner?: PlayerType | null;
  movesSinceLastCaptureOrPromotion: number;
  positionHistory: string[]; // Hashed board positions for repetition detection
}

export const createInitialGameState = (): GameState => {
  // Initialize empty 8x8 grid
  const grid: GridCell[][] = Array(8)
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
    currentPlayer: "PLAYER_ONE",
    selectedPosition: null,
    possibleMoves: [],
    capturedPieces: [],
    movesSinceLastCaptureOrPromotion: 0,
    positionHistory: [],
  };
};

// Helper function to get piece at position
const getPieceAtPosition = (
  gameState: GameState,
  position: Position
): CheckerPiece | null => {
  return gameState.grid[position.row][position.col];
};

// Helper function to get all pieces that can capture for the current player
export const getAllPiecesWithCaptures = (gameState: GameState): Position[] => {
  const positions: Position[] = [];
  let maxCaptures = 0;

  // First pass: find the maximum number of captures possible
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = gameState.grid[row][col];
      if (piece?.player === gameState.currentPlayer) {
        const captureMoves = getCaptureMoves({ row, col }, gameState);
        if (captureMoves.length > 0) {
          const maxCapturesForPiece = Math.max(
            ...captureMoves.map((move) =>
              countCapturesInPath({ row, col }, move, gameState)
            )
          );
          maxCaptures = Math.max(maxCaptures, maxCapturesForPiece);
        }
      }
    }
  }

  // Second pass: collect only pieces that can achieve the maximum number of captures
  if (maxCaptures > 0) {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = gameState.grid[row][col];
        if (piece?.player === gameState.currentPlayer) {
          const captureMoves = getCaptureMoves({ row, col }, gameState);
          if (captureMoves.length > 0) {
            const maxCapturesForPiece = Math.max(
              ...captureMoves.map((move) =>
                countCapturesInPath({ row, col }, move, gameState)
              )
            );
            if (maxCapturesForPiece === maxCaptures) {
              positions.push({ row, col });
            }
          }
        }
      }
    }
  }

  return positions;
};

// Helper function to get all valid moves for current player
const getAllValidMovesForPlayer = (gameState: GameState): Position[] => {
  const moves: Position[] = [];

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = gameState.grid[row][col];
      if (piece?.player === gameState.currentPlayer) {
        const pieceMoves = getValidMoves({ row, col }, gameState);
        moves.push(...pieceMoves);
      }
    }
  }

  return moves;
};

// Helper function to check if position occurs three times in history
const isThreefoldRepetition = (gameState: GameState): boolean => {
  const currentPosition =
    gameState.positionHistory[gameState.positionHistory.length - 1];
  return (
    gameState.positionHistory.filter((pos) => pos === currentPosition).length >=
    3
  );
};

// Add this helper function
const isCompletelyBlocked = (
  position: Position,
  gameState: GameState
): boolean => {
  const piece = getPieceAtPosition(gameState, position);
  if (!piece) return true;

  const regularMoves = getRegularMoves(position, gameState);
  const captureMoves = getCaptureMoves(position, gameState);

  return regularMoves.length === 0 && captureMoves.length === 0;
};

// New helper function to get all valid moves for a player
const getAllValidMovesForPosition = (
  position: Position,
  gameState: GameState
): Position[] => {
  const piece = getPieceAtPosition(gameState, position);
  if (
    !piece ||
    piece.player !== gameState.currentPlayer ||
    isCompletelyBlocked(position, gameState)
  ) {
    return [];
  }

  // Check for capture moves first
  const captureMoves = getCaptureMoves(position, gameState);
  if (captureMoves.length > 0) {
    // If there are multiple capture sequences, return the ones with maximum captures
    const maxCaptures = Math.max(
      ...captureMoves.map((move) =>
        countCapturesInPath(position, move, gameState)
      )
    );
    return captureMoves.filter(
      (move) => countCapturesInPath(position, move, gameState) === maxCaptures
    );
  }

  // If no captures available, get regular moves
  return getRegularMoves(position, gameState);
};

// Modified getValidMoves to check all pieces
export const getValidMoves = (
  position: Position,
  gameState: GameState
): Position[] => {
  // First, check if any piece has capture moves
  const piecesWithCaptures = getAllPiecesWithCaptures(gameState);

  if (piecesWithCaptures.length > 0) {
    // If the selected piece can capture, return its capture moves
    if (
      piecesWithCaptures.some(
        (pos) => pos.row === position.row && pos.col === position.col
      )
    ) {
      return getAllValidMovesForPosition(position, gameState);
    }
    // If other pieces can capture, this piece cannot move
    return [];
  }

  // If no captures are available, return regular moves for this piece
  return getAllValidMovesForPosition(position, gameState);
};

// Helper function to count captures in a move path
const countCapturesInPath = (
  from: Position,
  to: Position,
  gameState: GameState
): number => {
  let count = 0;
  const rowStep = Math.sign(to.row - from.row);
  const colStep = Math.sign(to.col - from.col);
  let row = from.row + rowStep;
  let col = from.col + colStep;

  while (row !== to.row || col !== to.col) {
    if (getPieceAtPosition(gameState, { row, col })) count++;
    row += rowStep;
    col += colStep;
  }

  return count;
};

// Get all possible capture moves
const getCaptureMoves = (
  position: Position,
  gameState: GameState
): Position[] => {
  const piece = getPieceAtPosition(gameState, position);
  if (!piece) return [];

  const moves: Position[] = [];
  const directions = piece.isKing
    ? [
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ] // King moves in all directions
    : piece.player === "PLAYER_ONE"
    ? [
        [1, 1],
        [1, -1],
      ]
    : [
        [-1, 1],
        [-1, -1],
      ]; // Regular pieces

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
      // Check for additional captures from the target position
      const additionalMoves = getCaptureMoves(target, {
        ...gameState,
        grid: simulateMove(gameState.grid, position, target, jumpOver),
      });

      if (additionalMoves.length > 0) {
        moves.push(...additionalMoves);
      } else {
        moves.push(target);
      }
    }
  }

  return moves;
};

// Simulate a move on the grid without modifying the original
const simulateMove = (
  grid: GridCell[][],
  from: Position,
  to: Position,
  captured: Position
): GridCell[][] => {
  const newGrid = grid.map((row) => [...row]);
  newGrid[to.row][to.col] = newGrid[from.row][from.col];
  newGrid[from.row][from.col] = null;
  newGrid[captured.row][captured.col] = null;
  return newGrid;
};

// Get regular (non-capture) moves
const getRegularMoves = (
  position: Position,
  gameState: GameState
): Position[] => {
  const piece = getPieceAtPosition(gameState, position);
  if (!piece) return [];

  const moves: Position[] = [];
  const directions = piece.isKing
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

  for (const [rowDir, colDir] of directions) {
    const target = {
      row: position.row + rowDir,
      col: position.col + colDir,
    };

    if (
      isValidPosition(target) &&
      !getPieceAtPosition(gameState, target) &&
      (target.row + target.col) % 2 !== 0
    ) {
      // Only allow moves to dark squares
      moves.push(target);
    }
  }

  return moves;
};

// Helper function to check if a piece can jump over another piece to a target position
const canJumpOver = (
  from: Position,
  jumpOver: Position,
  target: Position,
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

export const updateGameState = (
  state: GameState,
  action: GameAction
): GameStateUpdate => {
  switch (action.type) {
    case "SELECT_PIECE": {
      const piece = getPieceAtPosition(state, action.position);
      if (!piece || piece.player !== state.currentPlayer) {
        return { state, events: [] };
      }

      const validMoves = getValidMoves(action.position, state);
      return {
        state: {
          ...state,
          selectedPosition: action.position,
          possibleMoves: validMoves,
        },
        events: [],
      };
    }

    case "DESELECT_PIECE": {
      return {
        state: {
          ...state,
          selectedPosition: null,
          possibleMoves: [],
        },
        events: [],
      };
    }

    case "MOVE_PIECE": {
      const events: GameEvent[] = [];
      const piece = getPieceAtPosition(state, action.from);

      if (!piece) return { state, events: [{ type: "INVALID_MOVE" }] };

      const newGrid = state.grid.map((row) => [...row]);
      const capturedPieces = [...state.capturedPieces];

      // Handle multiple captures by checking each step in the path
      const rowDiff = action.to.row - action.from.row;
      const colDiff = action.to.col - action.from.col;
      const steps = Math.abs(rowDiff);
      const rowStep = Math.sign(rowDiff);
      const colStep = Math.sign(colDiff);

      // For each step in the path, check if we're jumping over a piece
      for (let i = 1; i < steps; i++) {
        const jumpedRow = action.from.row + i * rowStep;
        const jumpedCol = action.from.col + i * colStep;
        const jumpedPiece = getPieceAtPosition(state, {
          row: jumpedRow,
          col: jumpedCol,
        });

        if (jumpedPiece && jumpedPiece.player !== piece.player) {
          capturedPieces.push(jumpedPiece);
          newGrid[jumpedRow][jumpedCol] = null;
          events.push({
            type: "PIECE_CAPTURED",
            position: { row: jumpedRow, col: jumpedCol },
            piece: jumpedPiece,
          });
        }
      }

      // Check if piece becomes king
      const becomesKing =
        !piece.isKing &&
        ((piece.player === "PLAYER_ONE" && action.to.row === 7) ||
          (piece.player === "PLAYER_TWO" && action.to.row === 0));

      // Move the piece
      newGrid[action.to.row][action.to.col] = {
        ...piece,
        isKing: piece.isKing || becomesKing,
      };
      newGrid[action.from.row][action.from.col] = null;

      events.push({
        type: "PIECE_MOVED",
        from: action.from,
        to: action.to,
      });

      if (becomesKing) {
        events.push({
          type: "PIECE_CROWNED",
          position: action.to,
        });
      }

      const nextPlayer =
        state.currentPlayer === "PLAYER_ONE" ? "PLAYER_TWO" : "PLAYER_ONE";
      events.push({
        type: "TURN_CHANGED",
        player: nextPlayer,
      });

      // Check if all opponent pieces are captured
      const opponentPlayer =
        piece.player === "PLAYER_ONE" ? "PLAYER_TWO" : "PLAYER_ONE";
      const opponentHasPieces = newGrid.some((row) =>
        row.some((cell) => cell?.player === opponentPlayer)
      );

      if (!opponentHasPieces) {
        events.push({
          type: "GAME_OVER",
          winner: piece.player,
        });
      }

      return {
        state: {
          ...state,
          grid: newGrid,
          capturedPieces,
          currentPlayer: nextPlayer,
          selectedPosition: null,
          possibleMoves: [],
          gameOver: !opponentHasPieces,
          winner: !opponentHasPieces ? piece.player : undefined,
        },
        events,
      };
    }

    case "CHECK_GAME_STATE": {
      const events: GameEvent[] = [];

      // Check for threefold repetition
      if (isThreefoldRepetition(state)) {
        events.push({ type: "GAME_OVER", result: "DRAW" });
        return {
          state: { ...state, gameOver: true },
          events,
        };
      }

      // Check for 40-move rule
      if (state.movesSinceLastCaptureOrPromotion >= 80) {
        events.push({ type: "GAME_OVER", result: "DRAW" });
        return {
          state: { ...state, gameOver: true },
          events,
        };
      }

      // Check if current player has any valid moves
      const hasValidMoves = getAllValidMovesForPlayer(state).length > 0;
      if (!hasValidMoves) {
        // Check if it's a win or draw
        const otherPlayer =
          state.currentPlayer === "PLAYER_ONE" ? "PLAYER_TWO" : "PLAYER_ONE";
        const otherPlayerHasPieces = state.grid.some((row) =>
          row.some((cell) => cell?.player === otherPlayer)
        );

        if (otherPlayerHasPieces) {
          events.push({
            type: "GAME_OVER",
            winner: otherPlayer,
          });
        } else {
          events.push({ type: "GAME_OVER", result: "DRAW" });
        }

        return {
          state: {
            ...state,
            gameOver: true,
            winner: otherPlayerHasPieces ? otherPlayer : null,
          },
          events,
        };
      }

      return { state, events };
    }

    default:
      return { state, events: [] };
  }
};

const isValidPosition = (position: Position): boolean => {
  return (
    position.row >= 0 &&
    position.row < 8 &&
    position.col >= 0 &&
    position.col < 8
  );
};

// Add these new types at the top of the file
export type GameAction =
  | { type: "SELECT_PIECE"; position: Position }
  | { type: "MOVE_PIECE"; from: Position; to: Position }
  | { type: "DESELECT_PIECE" }
  | { type: "CHECK_GAME_STATE" };

export type GameEvent =
  | { type: "PIECE_MOVED"; from: Position; to: Position }
  | { type: "PIECE_CAPTURED"; position: Position; piece: CheckerPiece }
  | { type: "PIECE_CROWNED"; position: Position }
  | { type: "TURN_CHANGED"; player: PlayerType }
  | { type: "INVALID_MOVE" }
  | { type: "GAME_OVER"; winner: PlayerType }
  | { type: "GAME_OVER"; result: "DRAW" };

export interface GameStateUpdate {
  state: GameState;
  events: GameEvent[];
}

