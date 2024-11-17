import { useEffect } from "react";
import { NearestFilter } from "three";
import { useCanvas2dTexture } from "./hooks/useCanvas2dTexture";
import { renderCheckerGrid } from "./texture-renderers/renderCheckerGrid";
import { constants } from "./constants";

export const CheckerGrid = () => {
  const { context, textureRef } = useCanvas2dTexture(
    { width: constants.checkerGridSize, height: constants.checkerGridSize },
    { minFilter: NearestFilter, magFilter: NearestFilter }
  );

  useEffect(() => {
    renderCheckerGrid(context);
    textureRef.current.needsUpdate = true;
  }, [context, textureRef]);

  return (
    <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry
        args={[constants.checkerGridSize, constants.checkerGridSize]}
      />
      <meshStandardMaterial map={textureRef.current} />
    </mesh>
  );
};
