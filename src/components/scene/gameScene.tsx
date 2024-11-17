import { CheckersBoard } from "./checkersBoard";
import { Checker } from "./checker";
import { MoveIndicator } from "./moveIndicator";
import { TurnIndicator } from "./turnIndicator";
import { Robot } from "./robot";
import { OrbitControls, Stars, Stats } from "@react-three/drei";
import { Room } from "./room";
import {
  CheckerPosition,
  CheckerValidMove,
  CheckerValidMoveMap,
} from "@/game-logic/types";
import { useGameSessionContext } from "../../hooks/useGameSessionContext";
import { useEventListener } from "@/hooks/useEventListener";
import { useTriggerRender } from "@/hooks/useTriggerRender";
import { ScoreBoard } from "./scoreBoard";
import { mapPieces } from "@/utils/board";

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
): CheckerValidMove[] => (position ? allValidMoves?.get(position) || [] : []);

export const GameScene = () => {
  const gameSession = useGameSessionContext();
  const { gameState, selectedPosition: selectedCheckerPosition } =
    gameSession.getState();
  const allValidMoves = gameSession.getHumanValidMoves();

  const triggerRender = useTriggerRender();
  useEventListener(gameSession, ["stateChanged"], triggerRender);

  return (
    <>
      {/* <EffectComposer>
        <Bloom mipmapBlur intensity={0.5} luminanceThreshold={1} />
        <ToneMapping />
      </EffectComposer> */}

      <Room />
      <ScoreBoard />
      <CheckersBoard />

      {/* Turn Indicator */}
      {gameState.gameStatus !== "GAME_OVER" && (
        <TurnIndicator player={gameState.gameStatus} />
      )}

      {/* Checkers */}
      {mapPieces(gameState.grid).map((piece) => (
        <Checker
          key={piece.id}
          position={piece.position}
          piece={piece}
          mustCapture={getCheckerMustCapture(allValidMoves, piece.position)}
          onClick={() => gameSession.handlePieceClick(piece.position)}
        />
      ))}

      {/* Valid Moves */}
      {getCheckerValidMoves(allValidMoves, selectedCheckerPosition).map(
        (move, index) => (
          <MoveIndicator
            key={`move-${index}`}
            position={move.targetPosition}
            onClick={() => gameSession.handleMoveClick(move.targetPosition)}
            isCapture={move.isCapture}
          />
        )
      )}

      {/* First AI Robot */}
      {gameSession.getPlayer("PLAYER_ONE").type === "AI" && (
        <Robot player={"PLAYER_ONE"} />
      )}

      {/* Second AI Robot */}
      {gameSession.getPlayer("PLAYER_TWO").type === "AI" && (
        <Robot player={"PLAYER_TWO"} />
      )}

      <OrbitControls
        target={[0, 1.42, 0]}
        maxDistance={20}
        minDistance={5}
        maxPolarAngle={Math.PI / 2.1}
      />
      <Stars />
      <Stats />
    </>
  );
};
