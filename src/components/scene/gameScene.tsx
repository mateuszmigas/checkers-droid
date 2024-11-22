import { CheckerGrid } from "./checkerGrid";
import { Checker } from "./checker";
import { MoveIndicator } from "./moveIndicator";
import { Robot } from "./robot";
import { OrbitControls, Stats } from "@react-three/drei";
import { Room } from "./room";
import {
  CheckerPosition,
  CheckerPossibleTarget,
  CheckerValidMoveMap,
} from "@/game-logic/types";
import { useGameSessionContext } from "../../hooks/useGameSessionContext";
import { useEventListener } from "@/hooks/useEventListener";
import { useTriggerRender } from "@/hooks/useTriggerRender";
import { mapPieces } from "@/utils/board";
import { memo } from "react";
import { PlayerScoreBoard } from "./playerScoreBoard";
import { constants } from "./constants";

const getCheckerMustCapture = (
  allValidMoves: CheckerValidMoveMap | null,
  position: CheckerPosition | null
): boolean =>
  position
    ? (allValidMoves?.get(position) ?? []).some((move) => move.isCapture)
    : false;

const getCheckerValidMoves = (
  allValidMoves: CheckerValidMoveMap | null,
  position: CheckerPosition | null
): CheckerPossibleTarget[] =>
  position ? allValidMoves?.get(position) || [] : [];

export const GameScene = memo(() => {
  const gameSession = useGameSessionContext();
  const { gameState, selectedPosition } = gameSession.getState();
  const allValidMoves = gameSession.getHumanValidMoves();

  const triggerRender = useTriggerRender();
  useEventListener(gameSession, ["stateChanged"], triggerRender);

  return (
    <>
      <Room />
      <CheckerGrid />

      {/* Checkers */}
      {mapPieces(gameState.grid).map((piece) => (
        <Checker
          key={piece.id}
          position={piece.position}
          player={piece.player}
          isKing={piece.isKing}
          mustCapture={getCheckerMustCapture(allValidMoves, piece.position)}
          onClick={() => gameSession.handlePieceClick(piece.position)}
        />
      ))}

      {/* Valid Moves */}
      {getCheckerValidMoves(allValidMoves, selectedPosition).map(
        (move, index) => (
          <MoveIndicator
            key={`move-${index}`}
            position={move.targetPosition}
            onClick={() => gameSession.handleMoveClick(move.targetPosition)}
          />
        )
      )}

      {/* AI Robots */}
      {gameSession.getPlayer("PLAYER_ONE").type === "AI" && (
        <Robot playerType={"PLAYER_ONE"} />
      )}
      {gameSession.getPlayer("PLAYER_TWO").type === "AI" && (
        <Robot playerType={"PLAYER_TWO"} />
      )}

      {/* Score Boards */}
      <PlayerScoreBoard playerType={"PLAYER_ONE"} />
      <PlayerScoreBoard playerType={"PLAYER_TWO"} />

      <OrbitControls
        target={[0, constants.tableHeight, 0]}
        enablePan={false}
        maxDistance={20}
        minDistance={5}
        maxPolarAngle={Math.PI / 2.1}
      />
      <Stats />
    </>
  );
});

