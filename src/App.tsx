import { Canvas } from "@react-three/fiber";
import { GameScene } from "./components/scene/gameScene";
import { useState } from "react";
import { ACESFilmicToneMapping, SRGBColorSpace } from "three";
import { GameSession } from "./game-logic/gameSession";
import { GameSessionContext } from "./hooks/useGameSessionContext";
import { SelectGameMode } from "./components/selectGameMode";

export const App = () => {
  const [gameSession, setGameSession] = useState<GameSession | null>(null);

  // //temp
  // useEffect(() => {
  //   const gs = new GameSession("AI_VS_AI");
  //   setGameSession(gs);

  //   gs.on("GAME_OVER", () => {
  //     gs.restart();
  //   });
  // }, []);

  // useEventListener(gameSession, ["GAME_OVER"], () => {
  //   console.log("GAME OVER");
  // });

  return (
    <GameSessionContext.Provider value={gameSession}>
      <div className="h-screen w-screen">
        <div className="relative size-full bg-background dark">
          {gameSession ? (
            <div className="absolute size-full z-10">
              <Canvas
                camera={
                  gameSession.getPlayer("PLAYER_ONE").type === "HUMAN"
                    ? { position: [0, 6, -7] }
                    : { position: [-7, 6, 0] }
                }
                gl={{
                  toneMapping: ACESFilmicToneMapping,
                  outputColorSpace: SRGBColorSpace,
                }}
              >
                <GameScene />
              </Canvas>
            </div>
          ) : (
            <div className="absolute inset-0 z-20 flex items-center justify-center">
              <SelectGameMode
                onSelect={(gameMode) =>
                  setGameSession(new GameSession(gameMode))
                }
              />
            </div>
          )}
        </div>
      </div>
    </GameSessionContext.Provider>
  );
};

