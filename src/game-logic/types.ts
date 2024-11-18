import { CustomMap } from "@/utils/customMap";

export type PlayerType = "PLAYER_ONE" | "PLAYER_TWO";

export type CheckerPosition = {
  row: number;
  col: number;
};

export type CheckerPiece = {
  id: string;
  player: PlayerType;
  isKing: boolean;
};

export type CheckerValidMove = {
  targetPosition: CheckerPosition;
  isCapture: boolean;
};

export type CheckerValidMoveMap = CustomMap<
  CheckerPosition,
  CheckerValidMove[]
>;

export type AIPlayerEmotion = "happy" | "sad" | "focused";

