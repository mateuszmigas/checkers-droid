import { CheckerPosition } from "@/game-logic/types";

/*
#E4EFF0
#78CCE2
#4F7988
#005066
#002439
*/
export const constants = {
  screenColor: "#0DE8E9",
  playerOneColor: "#0DE8E9", //"#78CCE2",
  playerTwoColor: "#f0f0f0",
  checkerGridBlackColor: "#000000",
  checkerGridWhiteColor: "#ffffff",
  checkerIndicatorColor: "#18548B",
  tableHeight: 3,
  checkerGridSize: 8,
  roomHeight: 20,
  roomWidth: 40,
  tableSize: 12,
  tableShadowSize: 256,
  wallColor: "#4F7988",
  tableColor: "#ffffff",
  floorColor: "#005066",
  ceilingColor: "#f0f0f0",
};

export const mapCheckerPosition = (
  position: CheckerPosition
): [number, number, number] => {
  const size = 1;
  const x = position.col * size - 3.5 * size;
  const y = constants.tableHeight + 0.1;
  const z = position.row * size - 3.5 * size;
  return [x, y, z];
};
