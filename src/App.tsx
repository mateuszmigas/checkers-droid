import { Canvas } from "@react-three/fiber";
import { GameScene } from "./game-objects/gameScene";
import { useState } from "react";
import { Button } from "./components/ui/button";

export const App = () => {
  const [isOrthographic, setIsOrthographic] = useState(false);

  return (
    <div className="size-full relative">
      <Canvas className="size-full bg-gray-900">
        <GameScene isOrthographic={isOrthographic} />
      </Canvas>
      <Button
        className="absolute top-4 right-4"
        onClick={() => setIsOrthographic(!isOrthographic)}
      >
        {isOrthographic ? "Perspective View" : "Top View"}
      </Button>
    </div>
  );
};

