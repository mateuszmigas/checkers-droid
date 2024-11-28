import { Canvas } from "@react-three/fiber";
import { GameScene } from "./components/scene/gameScene";
import { useState } from "react";
import { GameSession } from "./game-logic/gameSession";
import { GameSessionContext } from "./components/ui/hooks/useGameSessionContext";
import { SelectGameModePage } from "./components/ui/pages/selectGameModePage";
import { Button } from "./components/ui/button";

export const App = (props: { aiAvailable: boolean }) => {
  const { aiAvailable } = props;
  const [gameSession, setGameSession] = useState<GameSession | null>(null);

  return (
    <GameSessionContext.Provider value={gameSession}>
      {gameSession ? (
        <div className="relative h-screen w-screen">
          <Canvas
            className="absolute size-full"
            camera={
              gameSession.getPlayer("PLAYER_ONE").type === "HUMAN"
                ? { position: [0, 7, -7.5] }
                : { position: [-7.5, 7, 0] }
            }
          >
            <GameScene />
          </Canvas>
          <Button
            className="absolute top-4 left-4"
            onClick={() => {
              gameSession?.stop();
              setGameSession(null);
            }}
          >
            Main Menu
          </Button>
        </div>
      ) : (
        <SelectGameModePage
          aiAvailable={aiAvailable}
          onSelect={(gameMode) =>
            setGameSession(new GameSession(gameMode, aiAvailable))
          }
        />
      )}
    </GameSessionContext.Provider>
  );
};
