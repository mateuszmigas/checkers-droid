import { Canvas } from "@react-three/fiber";
import { GameCanvas } from "./canvas";
import { useState } from "react";

export const App = () => {
  const [isOrthographic, setIsOrthographic] = useState(true);

  return (
    <div className="size-full relative">
      <button
        className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg z-10"
        onClick={() => setIsOrthographic(!isOrthographic)}
      >
        {isOrthographic ? "Perspective View" : "Top View"}
      </button>
      <Canvas
        camera={
          !isOrthographic
            ? {
                fov: 45,
                position: [0, 10, 10],
                near: 0.1,
                far: 1000,
              }
            : undefined
        }
      >
        <GameCanvas isOrthographic={isOrthographic} />
      </Canvas>
    </div>
  );
};

