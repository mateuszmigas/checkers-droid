import { Canvas } from "@react-three/fiber";
import { GameScene } from "./game-objects/gameScene";
import { useState } from "react";
import { ACESFilmicToneMapping, SRGBColorSpace } from "three";

type Expression = "happy" | "sad" | "focused";

export const App = () => {
  const [isOrthographic, setIsOrthographic] = useState(false);
  const [expression, setExpression] = useState<Expression>("happy");

  return (
    <div className="relative size-full bg-gray-900">
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <button
          onClick={() => setExpression("happy")}
          className={`px-4 py-2 rounded-md font-semibold transition-colors
            ${
              expression === "happy"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
        >
          Happy
        </button>
        <button
          onClick={() => setExpression("sad")}
          className={`px-4 py-2 rounded-md font-semibold transition-colors
            ${
              expression === "sad"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
        >
          Sad
        </button>
        <button
          onClick={() => setExpression("focused")}
          className={`px-4 py-2 rounded-md font-semibold transition-colors
            ${
              expression === "focused"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
        >
          Focused
        </button>
      </div>

      {/* Camera Toggle */}
      <button
        className="absolute top-4 left-4 px-4 py-2 rounded-md font-semibold
          bg-secondary text-secondary-foreground hover:bg-secondary/80 
          transition-colors z-10"
        onClick={() => setIsOrthographic(!isOrthographic)}
      >
        {isOrthographic ? "Perspective" : "Orthographic"} View
      </button>

      <Canvas
        shadows
        gl={{
          toneMapping: ACESFilmicToneMapping,
          outputColorSpace: SRGBColorSpace,
        }}
      >
        <GameScene isOrthographic={isOrthographic} expression={expression} />
      </Canvas>
    </div>
  );
};

