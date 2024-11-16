import { CheckersBoard } from "./checkersBoard";
import { Checker } from "./checker";
import { MoveIndicator } from "./moveIndicator";
import { TurnIndicator } from "./turnIndicator";
import { Robot } from "./robot";
import { OrbitControls, Stars } from "@react-three/drei";
import { Selection, Select } from "@react-three/postprocessing";
import { SciFiRoom } from "./SciFiRoom";
import { CheckerPiece, CheckerPosition } from "@/game-logic/types";
import { useGameSessionContext } from "../hooks/useGameSessionContext";
import { useEventListener } from "@/hooks/useEventListener";
import { useTriggerRender } from "@/hooks/useTriggerRender";

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
  expression: "happy" | "sad" | "focused";
}

export const GameScene = ({ expression }: GameSceneProps) => {
  const gameSession = useGameSessionContext();
  const { gameState, selectedPosition, validMoves } = gameSession.getState();
  const triggerRender = useTriggerRender();

  useEventListener(gameSession, ["stateChanged"], triggerRender);

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

  console.log("render scene");

  return (
    <>
      {/* <EffectComposer>
        <Bloom mipmapBlur intensity={0.5} luminanceThreshold={1} />
        <ToneMapping />
      </EffectComposer> */}

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
              onClick={() => {
                console.log("clicked piece", piece);
                gameSession.handlePieceClick(piece.position);
              }}
            />
          </Select>
        ))}
      </Selection>
      {possibleMoves.map((move, index) => (
        <MoveIndicator
          key={`move-${index}`}
          position={positionToCoordinates(move.targetPosition)}
          onClick={() => gameSession.handleMoveClick(move.targetPosition)}
          isCapture={move.isCapture}
        />
      ))}
      <Robot
        expression={expression}
        speechText="Hello, I'm a friendly robot! and this is some long text"
      />
      <OrbitControls
        target={[0, 1.42, 0]}
        maxDistance={20}
        minDistance={5}
        maxPolarAngle={Math.PI / 2.1}
      />
      <Stars />
      {/* <Stats /> */}
    </>
  );
};

