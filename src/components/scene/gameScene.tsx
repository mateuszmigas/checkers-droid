import { CheckerGrid } from "./checkerGrid";
import { Checker } from "./checker";
import { MoveIndicator } from "./moveIndicator";
import { Robot } from "./robot";
import { Room } from "./room";
import {
  CheckerPosition,
  CheckerPossibleTarget,
  CheckerValidMoveMap,
} from "@/game-logic/types";
import { useGameSessionContext } from "@/components/ui/hooks/useGameSessionContext";
import { useEventListener } from "@/components/ui/hooks/useEventListener";
import { useTriggerRender } from "@/components/ui/hooks/useTriggerRender";
import { mapPieces } from "@/utils/board";
import { memo } from "react";
import { PlayerScoreScreen } from "./playerScoreScreen";
import { constants } from "./constants";
import { useSelectableCheckerTexture } from "./hooks/useSelectableCheckerTexture";
import { useSelectedCheckerTexture } from "./hooks/useSelectedCheckerTexture";
import { OrbitControls } from "@react-three/drei/core/OrbitControls";
import { Stats } from "@react-three/drei/core/Stats";
import { isDevelopment } from "@/platform";

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

  const playerOneSelectedTexture = useSelectedCheckerTexture("PLAYER_ONE");
  const playerTwoSelectedTexture = useSelectedCheckerTexture("PLAYER_TWO");
  const playerOneSelectableTexture = useSelectableCheckerTexture("PLAYER_ONE");
  const playerTwoSelectableTexture = useSelectableCheckerTexture("PLAYER_TWO");

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
          isSelected={
            selectedPosition?.col === piece.position.col &&
            selectedPosition?.row === piece.position.row
          }
          isSelectable={
            getCheckerValidMoves(allValidMoves, piece.position).length > 0
          }
          onClick={() => gameSession.handlePieceClick(piece.position)}
          selectedTexture={
            piece.player === "PLAYER_ONE"
              ? playerOneSelectedTexture
              : playerTwoSelectedTexture
          }
          selectableTexture={
            piece.player === "PLAYER_ONE"
              ? playerOneSelectableTexture
              : playerTwoSelectableTexture
          }
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
      <PlayerScoreScreen playerType={"PLAYER_ONE"} />
      <PlayerScoreScreen playerType={"PLAYER_TWO"} />

      <OrbitControls
        target={[0, constants.tableHeight, 0]}
        enablePan={false}
        maxDistance={20}
        minDistance={5}
        maxPolarAngle={Math.PI / 2.1}
      />
      {isDevelopment && <Stats />}
    </>
  );
});
