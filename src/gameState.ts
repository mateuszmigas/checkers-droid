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
  };
};

// Helper function to get piece at position
const getPieceAtPosition = (
  gameState: GameState,
  position: Position
): CheckerPiece | null => {
  return gameState.grid[position.row][position.col];
};

export const getValidMoves = (
  position: Position,
  gameState: GameState
): Position[] => {
  const piece = getPieceAtPosition(gameState, position);
  if (!piece) return [];

  const moves: Position[] = [];
  const direction = piece.player === "PLAYER_ONE" ? 1 : -1;

  // Check for jump moves first
  const jumpMoves = getJumpMoves(position, gameState);
  if (jumpMoves.length > 0) {
    return jumpMoves;
  }

  // Regular moves
  const leftMove = {
    row: position.row + direction,
    col: position.col - 1,
  };
  const rightMove = {
    row: position.row + direction,
    col: position.col + 1,
  };

  if (isValidPosition(leftMove) && !getPieceAtPosition(gameState, leftMove)) {
    moves.push(leftMove);
  }
  if (isValidPosition(rightMove) && !getPieceAtPosition(gameState, rightMove)) {
    moves.push(rightMove);
  }

  return moves;
};

const getJumpMoves = (position: Position, gameState: GameState): Position[] => {
  const piece = getPieceAtPosition(gameState, position);
  if (!piece) return [];

  const jumpMoves: Position[] = [];
  const direction = piece.player === "PLAYER_ONE" ? 1 : -1;

  // Check left and right jumps
  const jumps = [
    {
      over: { row: position.row + direction, col: position.col - 1 },
      target: { row: position.row + direction * 2, col: position.col - 2 },
    },
    {
      over: { row: position.row + direction, col: position.col + 1 },
      target: { row: position.row + direction * 2, col: position.col + 2 },
    },
  ];

  for (const jump of jumps) {
    if (canJumpOver(position, jump.over, jump.target, gameState)) {
      jumpMoves.push(jump.target);
    }
  }

  return jumpMoves;
};

const canJumpOver = (
  from: Position,
  jumpOver: Position,
  target: Position,
  gameState: GameState
): boolean => {
  if (!isValidPosition(target)) return false;

  const jumpingPiece = getPieceAtPosition(gameState, from);
  const jumpedPiece = getPieceAtPosition(gameState, jumpOver);
  const targetPiece = getPieceAtPosition(gameState, target);

  return (
    jumpingPiece !== null &&
    jumpedPiece !== null &&
    targetPiece === null &&
    jumpedPiece.player !== jumpingPiece.player
  );
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

      // Check if this is a jump move
      const rowDiff = Math.abs(action.to.row - action.from.row);
      if (rowDiff === 2) {
        const jumpedRow = (action.from.row + action.to.row) / 2;
        const jumpedCol = (action.from.col + action.to.col) / 2;
        const jumpedPiece = getPieceAtPosition(state, {
          row: jumpedRow,
          col: jumpedCol,
        });

        if (jumpedPiece) {
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

      return {
        state: {
          ...state,
          grid: newGrid,
          capturedPieces,
          currentPlayer: nextPlayer,
          selectedPosition: null,
          possibleMoves: [],
        },
        events,
      };
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
  | { type: "DESELECT_PIECE" };

export type GameEvent =
  | { type: "PIECE_MOVED"; from: Position; to: Position }
  | { type: "PIECE_CAPTURED"; position: Position; piece: CheckerPiece }
  | { type: "PIECE_CROWNED"; position: Position }
  | { type: "TURN_CHANGED"; player: PlayerType }
  | { type: "INVALID_MOVE" };

export interface GameStateUpdate {
  state: GameState;
  events: GameEvent[];
}
