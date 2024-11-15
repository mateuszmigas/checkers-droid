import { useEffect, useState } from "react";
import { useThree } from "@react-three/fiber";
import { CheckersBoard } from "./checkersBoard";
import { Checker } from "./checker";
import { MoveIndicator } from "./moveIndicator";
import { TurnIndicator } from "./turnIndicator";
import {
  GameState,
  createInitialGameState,
  updateGameState,
  getPlayerValidMoves,
} from "../game-logic/gameState";
import { PerspectiveCamera, Vector3 } from "three";
import { Robot } from "./robot";
import { OrbitControls } from "@react-three/drei";
import { Selection, Select, EffectComposer } from "@react-three/postprocessing";
import { SciFiRoom } from "./SciFiRoom";
import { Bloom, ToneMapping } from "@react-three/postprocessing";
import {
  CheckerPiece,
  CheckerPosition,
  CheckerValidMoveMap,
} from "@/game-logic/types";
import { useGameSession } from "../game-logic/gameSession";

// Helper function to convert logical position to 3D coordinates
const positionToCoordinates = (
  position: CheckerPosition
): [number, number, number] => {
  const size = 1;
  const x = position.col * size - 3.5 * size;
  const y = 0.125; // Height of checker above board
  const z = position.row * size - 3.5 * size;
  return [x, y, z];
};

interface GameSceneProps {
  isOrthographic?: boolean;
  expression: "happy" | "sad" | "focused";
}

export const GameScene = ({ isOrthographic, expression }: GameSceneProps) => {
  const {
    gameState,
    selectedPosition,
    validMoves,
    handlePieceClick,
    handleMoveClick,
  } = useGameSession();

  const { camera } = useThree();

  useEffect(() => {
    if (isOrthographic) {
      camera.position.set(0, 20, 0);
      camera.lookAt(new Vector3(0, 0, 0));
      camera.zoom = 2;
      camera.updateProjectionMatrix();
    } else {
      camera.position.set(0, 10, 10);
      camera.lookAt(new Vector3(0, 0, 0));
      camera.zoom = 1;
      if ("fov" in camera) {
        (camera as PerspectiveCamera).fov = 45;
        camera.updateProjectionMatrix();
      }
    }
  }, [isOrthographic, camera]);

  // Convert grid to pieces array for rendering
  const pieces: (CheckerPiece & { position: CheckerPosition })[] = [];
  gameState.grid.forEach((row, rowIndex) => {
    row.forEach((piece, colIndex) => {
      if (piece) {
        pieces.push({
          ...piece,
          position: { row: rowIndex, col: colIndex },
        });
      }
    });
  });

  const mustCapture = (position: CheckerPosition): boolean =>
    (validMoves?.get(position) ?? []).some((move) => move.isCapture);

  const possibleMoves = selectedPosition
    ? validMoves?.get(selectedPosition) || []
    : [];

  return (
    <>
      <EffectComposer>
        <Bloom mipmapBlur intensity={0.5} luminanceThreshold={1} />
        <ToneMapping />
      </EffectComposer>

      <SciFiRoom />
      <CheckersBoard />
      {gameState.gameStatus !== "GAME_OVER" && (
        <TurnIndicator player={gameState.gameStatus} />
      )}
      <Selection>
        {pieces.map((piece) => (
          <Select
            key={piece.id}
            enabled={
              piece.position.row === selectedPosition?.row &&
              piece.position.col === selectedPosition?.col
            }
          >
            <Checker
              position={positionToCoordinates(piece.position)}
              piece={piece}
              mustCapture={mustCapture(piece.position)}
              onClick={() => handlePieceClick(piece.position)}
            />
          </Select>
        ))}
      </Selection>
      {possibleMoves.map((move, index) => (
        <MoveIndicator
          key={`move-${index}`}
          position={positionToCoordinates(move.targetPosition)}
          onClick={() => handleMoveClick(move.targetPosition)}
          isCapture={move.isCapture}
        />
      ))}

      <Robot expression={expression} />
      <OrbitControls
        target={[0, 1.42, 0]}
        maxDistance={20}
        minDistance={5}
        maxPolarAngle={Math.PI / 2.1}
      />
    </>
  );
};

