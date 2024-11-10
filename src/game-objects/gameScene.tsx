import { useEffect, useState } from "react";
import { useThree } from "@react-three/fiber";
import { CheckersBoard } from "./checkersBoard";
import { Checker } from "./checker";
import { MoveIndicator } from "./moveIndicator";
import { TurnIndicator } from "./turnIndicator";
import {
  GameState,
  createInitialGameState,
  PlayerType,
  CheckerPiece,
  Position,
  updateGameState,
} from "../gameState";
import { PerspectiveCamera, Vector3 } from "three";
import { RobotHead } from "./robotHead";

// Helper function to convert logical position to 3D coordinates
const positionToCoordinates = (
  position: Position
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

  const getPlayerColor = (player: PlayerType): string => {
    return player === "PLAYER_ONE" ? "#cc0000" : "#00cc00";
  };

  const handlePieceClick = (position: Position) => {
    const piece = gameState.grid[position.row][position.col];

    if (!piece) return;

    if (piece.player === gameState.currentPlayer) {
      if (
        gameState.selectedPosition?.row === position.row &&
        gameState.selectedPosition?.col === position.col
      ) {
        const { state, events } = updateGameState(gameState, {
          type: "DESELECT_PIECE",
        });
        setGameState(state);
        console.log(events);
      } else {
        const { state, events } = updateGameState(gameState, {
          type: "SELECT_PIECE",
          position,
        });
        setGameState(state);
        console.log(events);
      }
    }
  };

  const handleMoveClick = (targetPosition: Position) => {
    if (gameState.selectedPosition) {
      const { state, events } = updateGameState(gameState, {
        type: "MOVE_PIECE",
        from: gameState.selectedPosition,
        to: targetPosition,
      });

      setGameState(state);
      console.log(events);

      // Here you can handle the events to show notifications or animations
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

  // Convert grid to pieces array for rendering
  const pieces: (CheckerPiece & { position: Position })[] = [];
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

  return (
    <>
      <ambientLight intensity={Math.PI / 2} />
      <spotLight
        position={[10, 10, 10]}
        angle={0.15}
        penumbra={1}
        decay={0}
        intensity={Math.PI}
      />
      <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
      <CheckersBoard />
      <TurnIndicator player={gameState.currentPlayer} />
      {pieces.map((piece) => (
        <Checker
          key={piece.id}
          position={positionToCoordinates(piece.position)}
          color={getPlayerColor(piece.player)}
          isSelected={
            piece.position.row === gameState.selectedPosition?.row &&
            piece.position.col === gameState.selectedPosition?.col
          }
          onClick={() => handlePieceClick(piece.position)}
        />
      ))}
      {gameState.possibleMoves.map((move, index) => (
        <MoveIndicator
          key={`move-${index}`}
          position={positionToCoordinates(move)}
          onClick={() => handleMoveClick(move)}
        />
      ))}
      <RobotHead expression={expression} />
    </>
  );
};
