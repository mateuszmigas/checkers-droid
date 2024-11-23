import { PlayerType } from "@/game-logic/types";
import { useCanvas2dTexture } from "./hooks/useCanvas2dTexture";
import { renderScoreScreen } from "./texture-renderers/renderScoreScreen";
import { useEffect, useRef } from "react";
import { useGameSessionContext } from "@/hooks/useGameSessionContext";
import { useEventListener } from "@/hooks/useEventListener";

const MAX_EVENTS = 8;
const RATIO = 4;

export const PlayerScoreBoard = (props: { playerType: PlayerType }) => {
  const gameSession = useGameSessionContext();
  const eventsRef = useRef<string[]>([]);
  const { playerType } = props;

  const { updateTexture, textureRef } = useCanvas2dTexture({
    width: RATIO * 256,
    height: 256,
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
      updateTexture((context) =>
        renderScoreScreen(context, [...eventsRef.current])
      );
    }
  );

  useEffect(() => {
    updateTexture((context) =>
      renderScoreScreen(context, [...eventsRef.current])
    );
  }, []);

  return (
    <mesh
      position={[0, 3.05, playerType === "PLAYER_ONE" ? 5 : -5]}
      rotation={[-Math.PI / 2, 0, playerType === "PLAYER_ONE" ? 0 : Math.PI]}
    >
      <planeGeometry args={[RATIO * 1, 1]} />
      <meshStandardMaterial transparent={true} map={textureRef.current} />
    </mesh>
  );
};
