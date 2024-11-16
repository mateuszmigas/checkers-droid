import { Canvas } from "@react-three/fiber";
import { GameScene } from "./game-objects/gameScene";
import { useState } from "react";
import { ACESFilmicToneMapping, SRGBColorSpace } from "three";
import { GameSession } from "./game-logic/gameSession";
import { GameSessionContext } from "./game-logic/gameSessionContext";

type Expression = "happy" | "sad" | "focused";

export const App = () => {
  const [expression, setExpression] = useState<Expression>("happy");
  const [gameSession] = useState(() => new GameSession());

  return (
    <GameSessionContext.Provider value={gameSession}>
      <div className="h-screen w-screen">
        <div className="relative size-full bg-background dark">
          <div className="absolute size-full z-10">
            <Canvas
              camera={{ position: [0, 6, 7] }}
              shadows
              gl={{
                toneMapping: ACESFilmicToneMapping,
                outputColorSpace: SRGBColorSpace,
              }}
            >
              <GameScene expression={expression} />
            </Canvas>
          </div>
          {/* <div className="absolute inset-0 z-20 flex items-center justify-center">
            <WrongBrowserAlert />
          </div> */}
          <div className="absolute z-20">
            <button onClick={() => setExpression("happy")}>Happy</button>
            <button onClick={() => setExpression("sad")}>Sad</button>
            <button onClick={() => setExpression("focused")}>Focused</button>
            <div className="left-8 relative px-4 py-2 bg-white rounded-lg text-xs shadow-lg w-[300px] text-center">
              <div className="text-gray-800 break-words select-none">
                Hello, I'm a friendly robot! and this is some long text
              </div>
              {/* Triangle pointer now points from the left side */}
              <div
                className="absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0 h-0 
                          border-t-[8px] border-t-transparent 
                          border-r-[8px] border-r-white 
                          border-b-[8px] border-b-transparent"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </GameSessionContext.Provider>
  );
};
