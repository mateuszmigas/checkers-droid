import { useEffect } from "react";
import { NearestFilter } from "three";
import { useCanvas2dTexture } from "./hooks/useCanvas2dTexture";
import { renderCheckerGrid } from "./texture-renderers/renderCheckerGrid";
import { constants } from "./constants";

const debug = true;
const cellSize = debug ? 100 : 1;

export const CheckerGrid = () => {
  const { updateTexture, textureRef } = useCanvas2dTexture(
    {
      width: cellSize * constants.checkerGridSize,
      height: cellSize * constants.checkerGridSize,
    },
    { minFilter: NearestFilter, magFilter: NearestFilter }
  );

  useEffect(() => {
    updateTexture((context) => renderCheckerGrid(context, cellSize, debug));
  }, [updateTexture, textureRef]);

  return (
    <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry
        args={[constants.checkerGridSize, constants.checkerGridSize]}
      />
      <meshStandardMaterial map={textureRef.current} />
    </mesh>
  );
};

