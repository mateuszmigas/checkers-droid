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
  gameStatus: PlayerType | "GAME_OVER";
  movesSinceLastCaptureOrPromotion: number;
  positionHistory: string[]; // Hashed board positions for repetition detection
}

export const createInitialGameState = (): GameState => {
  return {
    grid: [
      [
        null,
        {
          id: "p1-0-1",
          player: "PLAYER_ONE",
          isKing: false,
        },
        null,
        {
          id: "p1-0-3",
          player: "PLAYER_ONE",
          isKing: false,
        },
        null,
        {
          id: "p1-0-5",
          player: "PLAYER_ONE",
          isKing: false,
        },
        null,
        {
          id: "p1-0-7",
          player: "PLAYER_ONE",
          isKing: false,
        },
      ],
      [
        {
          id: "p1-1-0",
          player: "PLAYER_ONE",
          isKing: false,
        },
        null,
        {
          id: "p1-1-2",
          player: "PLAYER_ONE",
          isKing: false,
        },
        null,
        {
          id: "p1-1-4",
          player: "PLAYER_ONE",
          isKing: false,
        },
        null,
        {
          id: "p1-1-6",
          player: "PLAYER_ONE",
          isKing: false,
        },
        null,
      ],
      [
        null,
        null,
        null,
        null,
        null,
        {
          id: "p1-2-5",
          player: "PLAYER_ONE",
          isKing: false,
        },
        null,
        {
          id: "p1-2-7",
          player: "PLAYER_ONE",
          isKing: false,
        },
      ],
      [
        null,
        null,
        {
          id: "p1-2-1",
          player: "PLAYER_ONE",
          isKing: false,
        },
        null,
        {
          id: "p1-2-3",
          player: "PLAYER_ONE",
          isKing: false,
        },
        null,
        null,
        null,
      ],
      [
        null,
        {
          id: "p2-5-2",
          player: "PLAYER_TWO",
          isKing: false,
        },
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      [
        {
          id: "p2-5-0",
          player: "PLAYER_TWO",
          isKing: false,
        },
        null,
        null,
        null,
        {
          id: "p2-5-4",
          player: "PLAYER_TWO",
          isKing: false,
        },
        null,
        {
          id: "p2-5-6",
          player: "PLAYER_TWO",
          isKing: false,
        },
        null,
      ],
      [
        null,
        {
          id: "p2-6-1",
          player: "PLAYER_TWO",
          isKing: false,
        },
        null,
        {
          id: "p2-6-3",
          player: "PLAYER_TWO",
          isKing: false,
        },
        null,
        {
          id: "p2-6-5",
          player: "PLAYER_TWO",
          isKing: false,
        },
        null,
        {
          id: "p2-6-7",
          player: "PLAYER_TWO",
          isKing: false,
        },
      ],
      [
        {
          id: "p2-7-0",
          player: "PLAYER_TWO",
          isKing: false,
        },
        null,
        {
          id: "p2-7-2",
          player: "PLAYER_TWO",
          isKing: false,
        },
        null,
        {
          id: "p2-7-4",
          player: "PLAYER_TWO",
          isKing: false,
        },
        null,
        {
          id: "p2-7-6",
          player: "PLAYER_TWO",
          isKing: false,
        },
        null,
      ],
    ],
    gameStatus: "PLAYER_TWO",
    movesSinceLastCaptureOrPromotion: 3,
    positionHistory: [
      '[[null,{"id":"p1-0-1","player":"PLAYER_ONE","isKing":false},null,{"id":"p1-0-3","player":"PLAYER_ONE","isKing":false},null,{"id":"p1-0-5","player":"PLAYER_ONE","isKing":false},null,{"id":"p1-0-7","player":"PLAYER_ONE","isKing":false}],[{"id":"p1-1-0","player":"PLAYER_ONE","isKing":false},null,{"id":"p1-1-2","player":"PLAYER_ONE","isKing":false},null,{"id":"p1-1-4","player":"PLAYER_ONE","isKing":false},null,{"id":"p1-1-6","player":"PLAYER_ONE","isKing":false},null],[null,null,null,{"id":"p1-2-3","player":"PLAYER_ONE","isKing":false},null,{"id":"p1-2-5","player":"PLAYER_ONE","isKing":false},null,{"id":"p1-2-7","player":"PLAYER_ONE","isKing":false}],[null,null,{"id":"p1-2-1","player":"PLAYER_ONE","isKing":false},null,null,null,null,null],[null,null,null,null,null,null,null,null],[{"id":"p2-5-0","player":"PLAYER_TWO","isKing":false},null,{"id":"p2-5-2","player":"PLAYER_TWO","isKing":false},null,{"id":"p2-5-4","player":"PLAYER_TWO","isKing":false},null,{"id":"p2-5-6","player":"PLAYER_TWO","isKing":false},null],[null,{"id":"p2-6-1","player":"PLAYER_TWO","isKing":false},null,{"id":"p2-6-3","player":"PLAYER_TWO","isKing":false},null,{"id":"p2-6-5","player":"PLAYER_TWO","isKing":false},null,{"id":"p2-6-7","player":"PLAYER_TWO","isKing":false}],[{"id":"p2-7-0","player":"PLAYER_TWO","isKing":false},null,{"id":"p2-7-2","player":"PLAYER_TWO","isKing":false},null,{"id":"p2-7-4","player":"PLAYER_TWO","isKing":false},null,{"id":"p2-7-6","player":"PLAYER_TWO","isKing":false},null]]',
      '[[null,{"id":"p1-0-1","player":"PLAYER_ONE","isKing":false},null,{"id":"p1-0-3","player":"PLAYER_ONE","isKing":false},null,{"id":"p1-0-5","player":"PLAYER_ONE","isKing":false},null,{"id":"p1-0-7","player":"PLAYER_ONE","isKing":false}],[{"id":"p1-1-0","player":"PLAYER_ONE","isKing":false},null,{"id":"p1-1-2","player":"PLAYER_ONE","isKing":false},null,{"id":"p1-1-4","player":"PLAYER_ONE","isKing":false},null,{"id":"p1-1-6","player":"PLAYER_ONE","isKing":false},null],[null,null,null,{"id":"p1-2-3","player":"PLAYER_ONE","isKing":false},null,{"id":"p1-2-5","player":"PLAYER_ONE","isKing":false},null,{"id":"p1-2-7","player":"PLAYER_ONE","isKing":false}],[null,null,{"id":"p1-2-1","player":"PLAYER_ONE","isKing":false},null,null,null,null,null],[null,{"id":"p2-5-2","player":"PLAYER_TWO","isKing":false},null,null,null,null,null,null],[{"id":"p2-5-0","player":"PLAYER_TWO","isKing":false},null,null,null,{"id":"p2-5-4","player":"PLAYER_TWO","isKing":false},null,{"id":"p2-5-6","player":"PLAYER_TWO","isKing":false},null],[null,{"id":"p2-6-1","player":"PLAYER_TWO","isKing":false},null,{"id":"p2-6-3","player":"PLAYER_TWO","isKing":false},null,{"id":"p2-6-5","player":"PLAYER_TWO","isKing":false},null,{"id":"p2-6-7","player":"PLAYER_TWO","isKing":false}],[{"id":"p2-7-0","player":"PLAYER_TWO","isKing":false},null,{"id":"p2-7-2","player":"PLAYER_TWO","isKing":false},null,{"id":"p2-7-4","player":"PLAYER_TWO","isKing":false},null,{"id":"p2-7-6","player":"PLAYER_TWO","isKing":false},null]]',
      '[[null,{"id":"p1-0-1","player":"PLAYER_ONE","isKing":false},null,{"id":"p1-0-3","player":"PLAYER_ONE","isKing":false},null,{"id":"p1-0-5","player":"PLAYER_ONE","isKing":false},null,{"id":"p1-0-7","player":"PLAYER_ONE","isKing":false}],[{"id":"p1-1-0","player":"PLAYER_ONE","isKing":false},null,{"id":"p1-1-2","player":"PLAYER_ONE","isKing":false},null,{"id":"p1-1-4","player":"PLAYER_ONE","isKing":false},null,{"id":"p1-1-6","player":"PLAYER_ONE","isKing":false},null],[null,null,null,null,null,{"id":"p1-2-5","player":"PLAYER_ONE","isKing":false},null,{"id":"p1-2-7","player":"PLAYER_ONE","isKing":false}],[null,null,{"id":"p1-2-1","player":"PLAYER_ONE","isKing":false},null,{"id":"p1-2-3","player":"PLAYER_ONE","isKing":false},null,null,null],[null,{"id":"p2-5-2","player":"PLAYER_TWO","isKing":false},null,null,null,null,null,null],[{"id":"p2-5-0","player":"PLAYER_TWO","isKing":false},null,null,null,{"id":"p2-5-4","player":"PLAYER_TWO","isKing":false},null,{"id":"p2-5-6","player":"PLAYER_TWO","isKing":false},null],[null,{"id":"p2-6-1","player":"PLAYER_TWO","isKing":false},null,{"id":"p2-6-3","player":"PLAYER_TWO","isKing":false},null,{"id":"p2-6-5","player":"PLAYER_TWO","isKing":false},null,{"id":"p2-6-7","player":"PLAYER_TWO","isKing":false}],[{"id":"p2-7-0","player":"PLAYER_TWO","isKing":false},null,{"id":"p2-7-2","player":"PLAYER_TWO","isKing":false},null,{"id":"p2-7-4","player":"PLAYER_TWO","isKing":false},null,{"id":"p2-7-6","player":"PLAYER_TWO","isKing":false},null]]',
    ],
  } as any;
};
export const createInitialGameState2 = (): GameState => {
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
    gameStatus: "PLAYER_ONE",
    movesSinceLastCaptureOrPromotion: 0,
    positionHistory: [],
  };
};

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
      if (piece?.player === gameState.gameStatus) {
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
        if (piece?.player === gameState.gameStatus) {
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

// Helper function to check if position occurs three times in history
const isThreefoldRepetition = (gameState: GameState): boolean => {
  const currentPosition =
    gameState.positionHistory[gameState.positionHistory.length - 1];
  return (
    gameState.positionHistory.filter((pos) => pos === currentPosition).length >=
    3
  );
};

// Update the ValidMovesMap type to use Position as key
export type ValidMovesMap = PositionMap<ValidMove[]>;

// Custom Map class that uses position equality for keys
export class PositionMap<T> {
  private map: Map<string, T> = new Map();

  private positionToKey(position: Position): string {
    return `${position.row}-${position.col}`;
  }

  set(key: Position, value: T) {
    this.map.set(this.positionToKey(key), value);
  }

  get(key: Position) {
    return this.map.get(this.positionToKey(key));
  }

  has(key: Position): boolean {
    return this.map.has(this.positionToKey(key));
  }

  size() {
    return this.map.size;
  }
}

// Modify getValidMoves to use PositionMap
export const getValidMoves = (
  player: PlayerType,
  gameState: GameState
): ValidMovesMap => {
  const movesMap = new PositionMap<ValidMove[]>();

  // First check for pieces that can capture
  let hasCaptures = false;
  const piecesWithCaptures = new PositionMap<ValidMove[]>();

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
            captureMoves.map((pos) => ({ position: pos, isCapture: true }))
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
            regularMoves.map((pos) => ({ position: pos, isCapture: false }))
          );
        }
      }
    }
  }

  return movesMap;
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
  gameState: GameState,
  previousDirection?: { rowDir: number; colDir: number }
): Position[] => {
  const piece = getPieceAtPosition(gameState, position);
  if (!piece) return [];

  const moves: Position[] = [];
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
  if (state.gameStatus === "GAME_OVER") {
    return { state, events: [{ type: "INVALID_MOVE" }] };
  }

  switch (action.type) {
    case "MOVE_PIECE": {
      if (!isValidPosition(action.from) || !isValidPosition(action.to)) {
        return { state, events: [{ type: "INVALID_MOVE" }] };
      }

      const piece = getPieceAtPosition(state, action.from);
      if (!piece || piece.player !== state.gameStatus) {
        return { state, events: [{ type: "INVALID_MOVE" }] };
      }

      // Get valid moves for the selected piece
      const validMovesMap = getValidMoves(state.gameStatus, state);
      const validMovesForPiece = validMovesMap.get(action.from) || [];

      // Check if the target position is in the valid moves
      if (
        !validMovesForPiece.some(
          (move) =>
            move.position.row === action.to.row &&
            move.position.col === action.to.col
        )
      ) {
        return { state, events: [{ type: "INVALID_MOVE" }] };
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
        newGrid[action.to.row][action.to.col] = {
          ...newGrid[action.to.row][action.to.col]!,
          isKing: true,
        };
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
          return {
            state: {
              ...state,
              grid: newGrid,
              movesSinceLastCaptureOrPromotion: 0, // Reset counter since we had a capture
              positionHistory: [
                ...state.positionHistory,
                JSON.stringify(newGrid),
              ],
            },
            events,
          };
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
            movesSinceLastCaptureOrPromotion:
              state.movesSinceLastCaptureOrPromotion + 1,
            positionHistory: [
              ...state.positionHistory,
              JSON.stringify(newGrid),
            ],
          },
          events: [...events, { type: "GAME_OVER", winner: piece.player }],
        };
      }

      return {
        state: {
          ...state,
          grid: newGrid,
          gameStatus: nextPlayer,
          movesSinceLastCaptureOrPromotion:
            state.movesSinceLastCaptureOrPromotion + 1,
          positionHistory: [...state.positionHistory, JSON.stringify(newGrid)],
        },
        events,
      };
    }

    case "CHECK_GAME_STATE": {
      const events: GameEvent[] = [];

      // Check for game ending conditions
      if (!hasValidMovesLeft(state.gameStatus, state)) {
        const otherPlayer =
          state.gameStatus === "PLAYER_ONE" ? "PLAYER_TWO" : "PLAYER_ONE";

        if (!hasValidMovesLeft(otherPlayer, state)) {
          return {
            state: { ...state, gameStatus: "GAME_OVER" },
            events: [{ type: "GAME_OVER", result: "DRAW" }],
          };
        } else {
          return {
            state: { ...state, gameStatus: "GAME_OVER" },
            events: [{ type: "GAME_OVER", winner: otherPlayer }],
          };
        }
      }

      // Check for threefold repetition
      if (isThreefoldRepetition(state)) {
        return {
          state: { ...state, gameStatus: "GAME_OVER" },
          events: [{ type: "GAME_OVER", result: "DRAW" }],
        };
      }

      // Check for 40-move rule
      if (state.movesSinceLastCaptureOrPromotion >= 80) {
        return {
          state: { ...state, gameStatus: "GAME_OVER" },
          events: [{ type: "GAME_OVER", result: "DRAW" }],
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
  | { type: "MOVE_PIECE"; from: Position; to: Position }
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

// Add this helper function
const hasValidMovesLeft = (
  player: PlayerType,
  gameState: GameState
): boolean => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = gameState.grid[row][col];
      if (piece?.player === player) {
        const moves = getValidMoves(player, gameState);
        if (moves.size() > 0) return true;
      }
    }
  }
  return false;
};

// Add this near the top with the other type definitions
export interface ValidMove {
  position: Position;
  isCapture: boolean;
}
