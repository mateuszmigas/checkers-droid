import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { CheckersBoard } from "./game-objects/checkersBoard";
import { Checker } from "./game-objects/checker";
import {
  GameState,
  createInitialGameState,
  positionToCoordinates,
  PlayerType,
} from "./gameState";

export const GameCanvas = () => {
  const [gameState] = useState<GameState>(createInitialGameState());

  const getPlayerColor = (player: PlayerType): string => {
    return player === "PLAYER_ONE" ? "#cc0000" : "#00cc00";
  };

  return (
    <Canvas className="size-full" camera={{ position: [0, 10, 10], fov: 45 }}>
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
      {gameState.pieces.map((piece) => (
        <Checker
          key={piece.id}
          position={positionToCoordinates(piece.position)}
          color={getPlayerColor(piece.player)}
        />
      ))}
    </Canvas>
  );
};

