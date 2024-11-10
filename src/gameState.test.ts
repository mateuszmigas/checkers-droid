import { GameState } from "./gameState";

// Add this helper function at the top of the file, after imports
export const printBoard = (gameState: GameState): void => {
  console.log("\n   0 1 2 3 4 5 6 7"); // Column numbers
  console.log("  -----------------");

  for (let row = 0; row < 8; row++) {
    let rowStr = `${row} |`; // Row numbers
    for (let col = 0; col < 8; col++) {
      const piece = gameState.grid[row][col];
      let symbol = " ";

      if (piece) {
        if (piece.player === "PLAYER_ONE") {
          symbol = piece.isKing ? "⛃" : "○";
        } else {
          symbol = piece.isKing ? "⛂" : "●";
        }
      } else {
        // Show dark/light squares
        symbol = (row + col) % 2 !== 0 ? "·" : " ";
      }
      rowStr += symbol + " ";
    }
    console.log(rowStr + "|");
  }
  console.log("  -----------------");
};
