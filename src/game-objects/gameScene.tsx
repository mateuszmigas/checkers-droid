import { useEffect, useState } from "react";
import { useThree } from "@react-three/fiber";
import { CheckersBoard } from "./checkersBoard";
import { Checker } from "./checker";
import { MoveIndicator } from "./moveIndicator";
import { TurnIndicator } from "./turnIndicator";
import {
  GameState,
  createInitialGameState,
  positionToCoordinates,
  PlayerType,
  CheckerPiece,
  Position,
  getValidMoves,
  movePiece,
} from "../gameState";
import { PerspectiveCamera, Vector3 } from "three";
import { RobotHead } from "./robotHead";

export const GameScene = (props: { isOrthographic?: boolean }) => {
  const [gameState, setGameState] = useState<GameState>(
    createInitialGameState()
  );

  const getPlayerColor = (player: PlayerType): string => {
    return player === "PLAYER_ONE" ? "#cc0000" : "#00cc00";
  };

  const handlePieceClick = (piece: CheckerPiece) => {
    if (piece.player === gameState.currentPlayer) {
      const validMoves = getValidMoves(piece, gameState);
      setGameState((prev) => ({
        ...prev,
        selectedPiece: prev.selectedPiece?.id === piece.id ? null : piece,
        possibleMoves: prev.selectedPiece?.id === piece.id ? [] : validMoves,
      }));
    }
  };

  const handleMoveClick = (targetPosition: Position) => {
    if (gameState.selectedPiece) {
      const newGameState = movePiece(
        gameState,
        gameState.selectedPiece,
        targetPosition
      );
      setGameState(newGameState);
    }
  };

  const { camera } = useThree();

  useEffect(() => {
    if (props.isOrthographic) {
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
  }, [props.isOrthographic, camera]);

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
      {gameState.pieces.map((piece) => (
        <Checker
          key={piece.id}
          position={positionToCoordinates(piece.position)}
          color={getPlayerColor(piece.player)}
          isSelected={piece.id === gameState.selectedPiece?.id}
          onClick={() => handlePieceClick(piece)}
        />
      ))}
      {gameState.possibleMoves.map((move, index) => (
        <MoveIndicator
          key={`move-${index}`}
          position={positionToCoordinates(move)}
          onClick={() => handleMoveClick(move)}
        />
      ))}
      <RobotHead />
    </>
  );
};

