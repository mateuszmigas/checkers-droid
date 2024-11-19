import { CheckerPosition, CheckerPiece, PlayerType } from "./types";

export type GameEvent =
  | {
      type: "PIECE_MOVED";
      from: CheckerPosition;
      to: CheckerPosition;
      player: PlayerType;
    }
  | {
      type: "PIECE_CAPTURED";
      position: CheckerPosition;
      piece: CheckerPiece;
      player: PlayerType;
    }
  | { type: "PIECE_CROWNED"; position: CheckerPosition; player: PlayerType }
  | { type: "TURN_CHANGED"; player: PlayerType }
  | { type: "INVALID_MOVE" }
  | { type: "GAME_OVER"; winner: PlayerType }
  | { type: "GAME_OVER"; result: "DRAW" };

