import { PlayerType } from "@/game-logic/types";
import { useCanvas2dTexture } from "./hooks/useCanvas2dTexture";
import { renderScoreScreen } from "./texture-renderers/renderScoreScreen";
import { useCallback, useEffect, useRef } from "react";
import { useGameSessionContext } from "@/components/ui/hooks/useGameSessionContext";
import { useEventListener } from "@/components/ui/hooks/useEventListener";
import { translateEvent, translatePlayerTurn } from "@/utils/translator";
import { GameEvent } from "@/game-logic/gameEvent";
import { calculateScoredPieces } from "@/game-logic/gameState";

const MAX_EVENTS = 8;
const RATIO = 4;

export const PlayerScoreScreen = (props: { playerType: PlayerType }) => {
  const gameSession = useGameSessionContext();
  const eventsRef = useRef<string[]>([]);
  const { playerType } = props;

  const { updateTexture, textureRef } = useCanvas2dTexture({
    width: RATIO * 256,
    height: 256,
  });

  const renderScreen = useCallback(() => {
    const state = gameSession.getState().gameState;
    updateTexture((context) =>
      renderScoreScreen(
        context,
        calculateScoredPieces(state, playerType),
        translatePlayerTurn(state, playerType),
        [...eventsRef.current]
      )
    );
  }, [gameSession, playerType, updateTexture]);

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
      eventsRef.current = [
        ...eventsRef.current,
        translateEvent(event as GameEvent, playerType),
      ].slice(-MAX_EVENTS);
      renderScreen();
    }
  );

  useEffect(() => {
    renderScreen();
  }, [gameSession, playerType, renderScreen]);

  return (
    <mesh
      position={[0, 3.05, playerType === "PLAYER_ONE" ? -5 : 5]}
      rotation={[-Math.PI / 2, 0, playerType === "PLAYER_ONE" ? Math.PI : 0]}
    >
      <planeGeometry args={[RATIO * 1, 1]} />
      <meshStandardMaterial transparent={true} map={textureRef.current} />
    </mesh>
  );
};
