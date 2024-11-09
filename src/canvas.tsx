import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { CheckersBoard } from "./game-objects/checkersBoard";
import { Checker } from "./game-objects/checker";
import { MoveIndicator } from "./game-objects/moveIndicator";
import { TurnIndicator } from "./game-objects/turnIndicator";
import {
  GameState,
  createInitialGameState,
  positionToCoordinates,
  PlayerType,
  CheckerPiece,
  Position,
  getValidMoves,
  movePiece,
} from "./gameState";

export const GameCanvas = () => {
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

  return (
    <Canvas className="size-full" camera={{ position: [0, 10, -10], fov: 45 }}>
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
    </Canvas>
  );
};

