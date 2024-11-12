import { useEffect, useState } from "react";
import { useThree } from "@react-three/fiber";
import { CheckersBoard } from "./checkersBoard";
import { Checker } from "./checker";
import { MoveIndicator } from "./moveIndicator";
import { TurnIndicator } from "./turnIndicator";
import {
  GameState,
  createInitialGameState,
  CheckerPiece,
  CheckerPosition,
  updateGameState,
  getPlayerValidMoves,
  CheckerValidMoveMap,
} from "../gameState";
import { PerspectiveCamera, Vector3 } from "three";
import { Robot } from "./robot";
import { BakeShadows, OrbitControls, Environment } from "@react-three/drei";
import {
  Selection,
  Select,
  EffectComposer,
  Outline,
} from "@react-three/postprocessing";
import { SciFiRoom } from "./SciFiRoom";
import { Canvas } from "@react-three/fiber";
import { Bloom, ToneMapping } from "@react-three/postprocessing";
import { ACESFilmicToneMapping, SRGBColorSpace } from "three";

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
  const [gameState, setGameState] = useState<GameState>(
    createInitialGameState()
  );

  const [selectedPosition, setSelectedPosition] =
    useState<CheckerPosition | null>(null);

  const [validMoves, setValidMoves] = useState<CheckerValidMoveMap | null>(
    null
  );

  const handlePieceClick = (position: CheckerPosition) => {
    const piece = gameState.grid[position.row][position.col];

    if (!piece) return;

    if (piece.player === gameState.gameStatus) {
      if (
        selectedPosition?.row === position.row &&
        selectedPosition?.col === position.col
      ) {
        setSelectedPosition(null);
        // setPossibleMoves([]);
      } else {
        // const moves = validMoves.get(position) || [];
        setSelectedPosition(position);
        // setPossibleMoves(moves);
      }
    }
  };

  const handleMoveClick = (targetPosition: CheckerPosition) => {
    if (selectedPosition) {
      const previousPlayer = gameState.gameStatus;
      const { state, events } = updateGameState(gameState, {
        type: "MOVE_PIECE",
        from: selectedPosition,
        to: targetPosition,
      });

      setGameState(state);

      if (state.gameStatus !== previousPlayer) {
        setSelectedPosition(null);
        // setPossibleMoves([]);
      } else {
        setSelectedPosition(targetPosition);
        // const newValidMoves = validMoves.get(targetPosition) || [];
        // setPossibleMoves(newValidMoves);
      }

      console.log(events);

      events.forEach((event) => {
        switch (event.type) {
          case "PIECE_CAPTURED":
            // Handle capture animation or notification
            break;
          case "PIECE_CROWNED":
            // Handle crowning animation or notification
            break;
          case "TURN_CHANGED":
            // Handle turn change notification
            break;
        }
      });
    }
  };

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

  useEffect(() => {
    if (gameState.gameStatus !== "GAME_OVER") {
      const validMoves = getPlayerValidMoves(gameState.gameStatus, gameState);
      setValidMoves(validMoves);
    } else {
      setValidMoves(null);
    }
  }, [gameState]);

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

