import { GameEvent } from "@/game-logic/gameEvent";
import { CheckerMove, CheckerPosition, PlayerType } from "@/game-logic/types";
import { assertNever } from "./typeGuards";
import { GameState } from "@/game-logic/gameState";
import { MoveConsequence } from "@/game-logic/moveConsequence";

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
      if (event.winner === "DRAW") {
        return `Game Over - It's a Draw!`;
      }
      return `Game Over - ${
        isSamePlayer(event.winner) ? "You Win!" : "Opponent Wins!"
      }`;
    case "INVALID_MOVE":
      return `Invalid move attempted.`;
    default:
      return assertNever(event);
  }
};

export const translatePlayerTurn = (
  gameState: GameState,
  player: PlayerType
) => {
  if (gameState.winner) {
    if (gameState.winner === "DRAW") {
      return "Game Over\nIt's a Draw!";
    }
    return `Game Over\n${
      gameState.winner === player ? "You Win!" : "Opponent Wins!"
    }`;
  }
  return `${
    player === gameState.currentTurn ? "Your Turn" : "Opponent's\nTurn"
  }`;
};

export const translateCheckerMove = (move: CheckerMove) =>
  `(${move.from.col}, ${move.from.row}) -> (${move.to.col}, ${move.to.row})`;

export const translateMoveConsequence = (consequence: MoveConsequence) => {
  switch (consequence) {
    case "CAPTURE_RISK":
      return "Risk of capture";
    case "CAPTURE_OPPORTUNITY":
      return "Capture chance";
    case "OPPONENT_BLOCK":
      return "Blocks opponent";
    case "KING_PROMOTION":
      return "Promotes to king";
    case "WINNING_MOVE":
      return "Winning move";
    default:
      return assertNever(consequence);
  }
};

