import { Canvas } from "@react-three/fiber";
import { GameCanvas } from "./canvas";
import { useState } from "react";

export const App = () => {
  const [isOrthographic, setIsOrthographic] = useState(false);

  return (
    <div className="size-full relative">
      <button
        className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg z-10"
        onClick={() => setIsOrthographic(!isOrthographic)}
      >
        {isOrthographic ? "Perspective View" : "Top View"}
      </button>
      <Canvas className="size-full bg-gray-900">
        <GameCanvas isOrthographic={isOrthographic} />
      </Canvas>
    </div>
  );
};

