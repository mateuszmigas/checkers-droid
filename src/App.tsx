import { Canvas } from "@react-three/fiber";
import { GameScene } from "./components/scene/gameScene";
import { useEffect, useState } from "react";
import { GameSession } from "./game-logic/gameSession";
import { GameSessionContext } from "./hooks/useGameSessionContext";
import { SelectGameModePage } from "./components/ui/pages/selectGameModePage";
import { chromeApi } from "./chromeAI";
import { AiNotSupportedPage } from "./components/ui/pages/aiNotSupportedPage";
import { Button } from "./components/ui/button";
import { LoadingPage } from "./components/ui/pages/loadingPage";

export const App = () => {
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [page, setPage] = useState<
    "loading" | "select-game-mode" | "ai-not-supported" | "playing-game"
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
      setPage(isAvailable ? "select-game-mode" : "ai-not-supported");
    });
  }, []);

  return (
    <GameSessionContext.Provider value={gameSession}>
      <div className="size-full bg-black">
        {page === "loading" && <LoadingPage />}
        {page === "select-game-mode" && (
          <SelectGameModePage
            onSelect={(gameMode) => {
              setGameSession(new GameSession(gameMode));
              setPage("playing-game");
            }}
          />
        )}
        {page === "ai-not-supported" && (
          <AiNotSupportedPage onContinue={() => setPage("select-game-mode")} />
        )}
        {page === "playing-game" && gameSession && (
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
            <Button
              className="absolute top-4 left-4"
              onClick={() => setGameSession(null)}
            >
              Main Menu
            </Button>
          </div>
        )}
      </div>
    </GameSessionContext.Provider>
  );
};

