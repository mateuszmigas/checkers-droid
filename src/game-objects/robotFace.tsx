import { useEffect, useMemo, useRef } from "react";
import { CanvasTexture } from "three";
import { Box } from "@react-three/drei";
import { drawFace } from "./faceExpression";
import { FaceExpression } from "./faceExpression";
import { BasicGlowMaterial } from "./materials/glowMaterial";

const textureSize = 512;

export const RobotFace = (props: { expression?: FaceExpression }) => {
  const { expression = "happy" } = props;

  const context = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = textureSize;
    canvas.height = textureSize;
    return canvas.getContext("2d")!;
  }, []);

  const textureRef = useRef<CanvasTexture>(new CanvasTexture(context.canvas));

  useEffect(() => {
    drawFace(context, expression);
    textureRef.current.needsUpdate = true;
  }, [context, expression]);

  return (
    <Box args={[0.65, 0.5, 0.25]} position={[0, 0, 0.3]}>
      <BasicGlowMaterial
        attach="material-4"
        map={textureRef.current}
        transparent={true}
        color={[1, 1, 1]}
        intensity={15}
      />
    </Box>
  );
};
