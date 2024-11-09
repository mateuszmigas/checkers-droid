export type PlayerType = "PLAYER_ONE" | "PLAYER_TWO";

export interface Position {
  row: number;
  col: number;
}

export interface CheckerPiece {
  id: string;
  position: Position;
  player: PlayerType;
  isKing: boolean;
}

export interface GameState {
  pieces: CheckerPiece[];
  currentPlayer: PlayerType;
  selectedPiece: CheckerPiece | null;
  possibleMoves: Position[];
  capturedPieces: CheckerPiece[];
}

export const createInitialGameState = (): GameState => {
  const pieces: CheckerPiece[] = [];

  // Place Player One's checkers
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 !== 0) {
        pieces.push({
          id: `p1-${row}-${col}`,
          position: { row, col },
          player: "PLAYER_ONE",
          isKing: false,
        });
      }
    }
  }

  // Place Player Two's checkers
  for (let row = 5; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 !== 0) {
        pieces.push({
          id: `p2-${row}-${col}`,
          position: { row, col },
          player: "PLAYER_TWO",
          isKing: false,
        });
      }
    }
  }

  return {
    pieces,
    currentPlayer: "PLAYER_ONE",
    selectedPiece: null,
    possibleMoves: [],
    capturedPieces: [],
  };
};

// Helper function to convert logical position to 3D coordinates
export const positionToCoordinates = (
  position: Position
): [number, number, number] => {
  const size = 1;
  const x = position.col * size - 3.5 * size;
  const y = 0.125; // Height of checker above board
  const z = position.row * size - 3.5 * size;
  return [x, y, z];
};

// Helper function to convert 3D coordinates to logical position
export const coordinatesToPosition = (
  coords: [number, number, number]
): Position => {
  const size = 1;
  const col = Math.round((coords[0] + 3.5 * size) / size);
  const row = Math.round((coords[2] + 3.5 * size) / size);
  return { row, col };
};

export const getValidMoves = (
  piece: CheckerPiece,
  gameState: GameState
): Position[] => {
  const moves: Position[] = [];
  const direction = piece.player === "PLAYER_ONE" ? 1 : -1;

  // Regular moves
  const leftMove = {
    row: piece.position.row + direction,
    col: piece.position.col - 1,
  };
  const rightMove = {
    row: piece.position.row + direction,
    col: piece.position.col + 1,
  };

  // Check if moves are within board bounds and target square is empty
  if (isValidPosition(leftMove) && !getPieceAtPosition(gameState, leftMove)) {
    moves.push(leftMove);
  }
  if (isValidPosition(rightMove) && !getPieceAtPosition(gameState, rightMove)) {
    moves.push(rightMove);
  }

  // TODO: Add jump moves and king moves later

  return moves;
};

export const movePiece = (
  gameState: GameState,
  piece: CheckerPiece,
  targetPosition: Position
): GameState => {
  const newPieces = gameState.pieces.map((p) =>
    p.id === piece.id ? { ...p, position: targetPosition } : p
  );

  return {
    ...gameState,
    pieces: newPieces,
    currentPlayer:
      gameState.currentPlayer === "PLAYER_ONE" ? "PLAYER_TWO" : "PLAYER_ONE",
    selectedPiece: null,
    possibleMoves: [],
  };
};

const isValidPosition = (position: Position): boolean => {
  return (
    position.row >= 0 &&
    position.row < 8 &&
    position.col >= 0 &&
    position.col < 8
  );
};

const getPieceAtPosition = (
  gameState: GameState,
  position: Position
): CheckerPiece | undefined => {
  return gameState.pieces.find(
    (p) => p.position.row === position.row && p.position.col === position.col
  );
};

