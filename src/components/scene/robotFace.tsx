import { useEffect } from "react";
import { Box } from "@react-three/drei";
import { renderRobotFace } from "./texture-renderers/renderRobotFace";
import { FaceExpression } from "./texture-renderers/renderRobotFace";
import { BasicGlowMaterial } from "./materials/glowMaterial";
import { useCanvas2dTexture } from "./hooks/useCanvas2dTexture";

const textureSize = 512;

export const RobotFace = (props: {
  speechText?: string;
  expression?: FaceExpression;
}) => {
  const { expression = "happy" } = props;

  const { context, textureRef } = useCanvas2dTexture({
    width: textureSize,
    height: textureSize,
  });

  useEffect(() => {
    renderRobotFace(context, expression);
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

