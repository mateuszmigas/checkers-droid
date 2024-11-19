import { Canvas } from "@react-three/fiber";
import { GameScene } from "./components/scene/gameScene";
import { useEffect, useState } from "react";
import { ACESFilmicToneMapping, SRGBColorSpace } from "three";
import { GameSession } from "./game-logic/gameSession";
import { GameSessionContext } from "./hooks/useGameSessionContext";
import { SelectGameMode } from "./components/selectGameMode";
import { chromeApi } from "./chromeAI";

export const App = () => {
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [loadingState, setLoadingState] = useState<
    "loading" | "ready" | "browser-not-supported"
  >("loading");

  // //temp
  useEffect(() => {
    const gs = new GameSession("HUMAN_VS_AI");
    setGameSession(gs);

    gs.on("GAME_OVER", () => {
      gs.restart();
    });
  }, []);

  useEffect(() => {
    chromeApi.isAvailable().then((isAvailable) => {
      setLoadingState(isAvailable ? "ready" : "browser-not-supported");
    });
  }, []);

  return (
    <GameSessionContext.Provider value={gameSession}>
      <div className="size-full bg-background dark">
        {loadingState !== "loading" ? (
          <div className="relative size-full">
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
                {loadingState === "ready" ? (
                  <SelectGameMode
                    onSelect={(gameMode) =>
                      setGameSession(new GameSession(gameMode))
                    }
                  />
                ) : (
                  <div className="text-white text-2xl">
                    Browser not supported
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="size-full flex items-center justify-center">
            <div className="text-white text-2xl">Loading...</div>
          </div>
        )}
      </div>
    </GameSessionContext.Provider>
  );
};

