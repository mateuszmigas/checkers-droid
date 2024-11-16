import { useEventListener } from "@/hooks/useEventListener";
import { useGameSessionContext } from "@/hooks/useGameSessionContext";
import { useRef } from "react";
import { useCanvas2dTexture } from "./hooks/useCanvas2dTexture";
import { renderBoard } from "./texture-renderers/renderBoard";

const MAX_EVENTS = 8;

export const ScoreBoard = () => {
  const gameSession = useGameSessionContext();
  const eventsRef = useRef<string[]>([]);

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
      if (context) {
        renderBoard({ context, events: [...eventsRef.current] });
        textureRef.current.needsUpdate = true;
      }
    }
  );

  const { context, textureRef } = useCanvas2dTexture({
    width: 512,
    height: 512,
  });

  return (
    <group position={[6, 3, 0]} rotation={[0, -Math.PI / 2, 0]}>
      <mesh>
        <planeGeometry args={[3, 2]} />
        <meshBasicMaterial map={textureRef.current} transparent={true} />
      </mesh>
    </group>
  );
};

