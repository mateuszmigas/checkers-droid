import { GameEvent } from "@/game-logic/gameEvent";
import { CheckerPosition, PlayerType } from "@/game-logic/types";
import { assertNever } from "./typeGuards";

export const translateEvent = (event: GameEvent, player: PlayerType) => {
  const isSamePlayer = (eventPlayer: PlayerType) => player === eventPlayer;
  const formatPosition = (pos: CheckerPosition) => `(${pos.col}, ${pos.row})`;

  switch (event.type) {
    case "PIECE_MOVED":
      return `${
        isSamePlayer(event.player) ? "You" : "Opponent"
      } Moved a Piece from ${formatPosition(event.from)} to ${formatPosition(
        event.to
      )}`;
    case "PIECE_CAPTURED":
      return `${
        isSamePlayer(event.player) ? "You" : "Opponent"
      } Captured a Piece at ${formatPosition(event.position)}`;
    case "PIECE_CROWNED":
      return `${
        isSamePlayer(event.player) ? "You" : "Opponent"
      } Crowned a Piece at ${formatPosition(event.position)}`;
    case "TURN_CHANGED":
      return `${isSamePlayer(event.player) ? "Your" : "Opponent's"} Turn`;
    case "GAME_OVER":
      if ("winner" in event) {
        return `Game Over - ${
          isSamePlayer(event.winner) ? "You Win!" : "Opponent Wins!"
        }`;
      }
      return `Game Over - It's a Draw!`;
    case "INVALID_MOVE":
      return `Invalid move attempted.`;
    default:
      return assertNever(event);
  }
};

