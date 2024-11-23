import { forEachCell, isDarkSquare } from "@/utils/board";
import { constants } from "../constants";

export const renderCheckerGrid = (
  context: OffscreenCanvasRenderingContext2D
) => {
  forEachCell((row, col) => {
    context.fillStyle = isDarkSquare(row, col)
      ? constants.checkerGridBlackColor
      : constants.checkerGridWhiteColor;
    context.fillRect(col, row, 1, 1);
  });
};
