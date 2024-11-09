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

