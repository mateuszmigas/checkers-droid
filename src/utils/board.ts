import { CheckerPiece, CheckerPosition } from "@/game-logic/types";

export const forEachCell = (callback: (row: number, col: number) => void) => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      callback(row, col);
    }
  }
};

export const mapPieces = (grid: (CheckerPiece | null)[][]) => {
  const result: (CheckerPiece & { position: CheckerPosition })[] = [];
  forEachCell((row, col) => {
    const piece = grid[row][col];
    if (piece) {
      result.push({ ...piece, position: { row, col } });
    }
  });
  return result;
};

export const isDarkSquare = (row: number, col: number) => (row + col) % 2 !== 0;

