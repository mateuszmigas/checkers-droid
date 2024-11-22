import { Canvas } from "@react-three/fiber";
import { GameScene } from "./components/scene/gameScene";
import { useEffect, useState } from "react";
import { GameSession } from "./game-logic/gameSession";
import { GameSessionContext } from "./hooks/useGameSessionContext";
import { SelectGameModePage } from "./components/ui/selectGameMode";
import { chromeApi } from "./chromeAI";

export const App = () => {
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [loadingState, setLoadingState] = useState<
    "loading" | "ready" | "browser-not-supported"
  >("loading");

  // //temp
  // useEffect(() => {
  //   const gs = new GameSession("HUMAN_VS_AI");
  //   setGameSession(gs);

  //   gs.on("GAME_OVER", () => {
  //     gs.restart();
  //   });
  // }, []);

  useEffect(() => {
    chromeApi.isAvailable().then((isAvailable) => {
      setLoadingState(isAvailable ? "ready" : "browser-not-supported");
    });
  }, []);

  return (
    <GameSessionContext.Provider value={gameSession}>
      <div className="size-full bg-black">
        {loadingState !== "loading" ? (
          <div className="relative size-full">
            {gameSession ? (
              <div className="absolute size-full z-10">
                <Canvas
                  camera={
                    gameSession.getPlayer("PLAYER_ONE").type === "HUMAN"
                      ? { position: [0, 7, -7.5] }
                      : { position: [-7.5, 7, 0] }
                  }
                >
                  <GameScene />
                </Canvas>
              </div>
            ) : (
              <div className="absolute inset-0 z-20 flex items-center justify-center">
                {loadingState === "ready" ? (
                  <SelectGameModePage
                    onSelect={(gameMode) =>
                      setGameSession(new GameSession(gameMode))
                    }
                  />
                ) : (
                  <div className="text-white text-2xl absolute inset-0 z-20 flex items-center justify-center">
                    Looks like this browser doesn't support Chrome AI or it's
                    not enabled.
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

