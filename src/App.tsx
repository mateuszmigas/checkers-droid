import { Canvas } from "@react-three/fiber";
import { GameScene } from "./game-objects/gameScene";
import { useState } from "react";
import { ACESFilmicToneMapping, SRGBColorSpace } from "three";
import { WrongBrowserAlert } from "./components/wrongBrowserAlert";

type Expression = "happy" | "sad" | "focused";

export const App = () => {
  const [expression, setExpression] = useState<Expression>("happy");

  return (
    <div className="relative size-full bg-background dark">
      <div className="absolute size-full z-10">
        <Canvas
          shadows
          gl={{
            toneMapping: ACESFilmicToneMapping,
            outputColorSpace: SRGBColorSpace,
          }}
        >
          <GameScene expression={expression} />
        </Canvas>
      </div>
      <div className="absolute inset-0 z-20 flex items-center justify-center">
        <WrongBrowserAlert />
      </div>
      <div className="absolute z-20">
        <button onClick={() => setExpression("happy")}>Happy</button>
        <button onClick={() => setExpression("sad")}>Sad</button>
        <button onClick={() => setExpression("focused")}>Focused</button>
      </div>
    </div>
  );
};

