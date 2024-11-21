import { useEventListener } from "@/hooks/useEventListener";
import { useGameSessionContext } from "@/hooks/useGameSessionContext";
import { useRef } from "react";
import { useCanvas2dTexture } from "./hooks/useCanvas2dTexture";
import { renderBoard } from "./texture-renderers/renderBoard";
import { BasicGlowMaterial } from "./materials/glowMaterial";

const MAX_EVENTS = 8;

export const ScoreBoard = () => {
  const gameSession = useGameSessionContext();
  const eventsRef = useRef<string[]>([]);

  const { updateTexture, textureRef } = useCanvas2dTexture({
    width: 768,
    height: 768,
  });

  useEventListener(
    gameSession,
    [
      "PIECE_MOVED",
      "PIECE_CAPTURED",
      "PIECE_CROWNED",
      "TURN_CHANGED",
      "GAME_OVER",
    ],
    (event) => {
      eventsRef.current = [...eventsRef.current, event.type].slice(-MAX_EVENTS);
      updateTexture((context) => renderBoard(context, eventsRef.current));
    }
  );

  return (
    <group position={[8, 3, 0]} rotation={[0, -Math.PI / 2, 0]}>
      <mesh>
        <planeGeometry args={[9, 6]} />
        <BasicGlowMaterial
          map={textureRef.current}
          transparent={true}
          color={[1, 1, 1]}
          intensity={15}
        />
      </mesh>
    </group>
  );
};
