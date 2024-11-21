import { forEachCell, isDarkSquare } from "@/utils/board";
import { constants } from "../constants";

export const renderCheckerGrid = (
  context: CanvasRenderingContext2D,
  cellSize: number,
  debug: boolean
) => {
  forEachCell((row, col) => {
    context.fillStyle = isDarkSquare(row, col)
      ? constants.checkerGridBlackColor
      : constants.checkerGridWhiteColor;
    context.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);

    context.lineWidth = 2;
    context.strokeStyle = constants.checkerGridBlackColor;
    context.strokeRect(col * cellSize, row * cellSize, cellSize, cellSize);

    if (debug) {
      context.fillStyle = "white";
      context.font = "20px Arial";
      context.fillText(`(${row},${col})`, col * cellSize, row * cellSize + 20);
    }
  });
};
