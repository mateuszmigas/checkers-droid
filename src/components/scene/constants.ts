import { CheckerPosition } from "@/game-logic/types";

export const constants = {
  textureSize: 512,
  playerOneColor: "#78CCE2",
  playerTwoColor: "#f0f0f0",
  checkerGridBlackColor: "#000000",
  checkerGridWhiteColor: "#ffffff",
  checkerGridSize: 8,
};

export const mapCheckerPosition = (
  position: CheckerPosition
): [number, number, number] => {
  const size = 1;
  const x = position.col * size - 3.5 * size;
  const y = 0.125; // Height of checker above board
  const z = position.row * size - 3.5 * size;
  return [x, y, z];
};
