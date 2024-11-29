import { GameState, updateGameState, getPlayerValidMoves } from "./gameState";
import { CheckerPosition, PlayerType } from "./types";

export type MoveConsequence =
  | "CAPTURE_RISK"
  | "CAPTURE_OPPORTUNITY"
  | "OPPONENT_BLOCK"
  | "KING_PROMOTION"
  | "WINNING_MOVE";

export const analyzeMoveConsequences = (
  currentState: GameState,
  move: { from: CheckerPosition; to: CheckerPosition }
): MoveConsequence[] => {
  const player = currentState.currentTurn as PlayerType;
  const opponent = player === "PLAYER_ONE" ? "PLAYER_TWO" : "PLAYER_ONE";
  const opponentMovesBefore = getPlayerValidMoves(opponent, currentState);

  const { state: newState, events } = updateGameState(currentState, {
    type: "MOVE_PIECE",
    ...move,
  });

  const opponentMovesAfter = getPlayerValidMoves(opponent, newState);
  const playerMoves = getPlayerValidMoves(player, newState);

  const consequences: MoveConsequence[] = [];

  const opponentHadCaptures = opponentMovesBefore
    .entries()
    .some(([, moves]) => moves.some((m) => m.isCapture));
  const opponentHasCaptures = opponentMovesAfter
    .entries()
    .some(([, moves]) => moves.some((m) => m.isCapture));
  if (opponentHadCaptures && !opponentHasCaptures) {
    consequences.push("OPPONENT_BLOCK");
  }

  const kingPromotion = events.some(
    (event) => event.type === "PIECE_CROWNED" && event.player === player
  );
  if (kingPromotion) {
    consequences.push("KING_PROMOTION");
  }

  const captureRisk = opponentMovesAfter
    .entries()
    .some(([, moves]) => moves.some((m) => m.isCapture));
  if (captureRisk) {
    consequences.push("CAPTURE_RISK");
  }

  const captureOpportunity = playerMoves
    .entries()
    .some(([, moves]) => moves.some((m) => m.isCapture));
  if (captureOpportunity) {
    consequences.push("CAPTURE_OPPORTUNITY");
  }

  if (newState.winner === player) {
    consequences.push("WINNING_MOVE");
  }

  return consequences;
};

