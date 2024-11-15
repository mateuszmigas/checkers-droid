import { useEffect, useMemo, useRef } from "react";
import { CanvasTexture } from "three";
import { Box, Html } from "@react-three/drei";
import { drawFace } from "./faceExpression";
import { FaceExpression } from "./faceExpression";
import { BasicGlowMaterial } from "./materials/glowMaterial";

const textureSize = 512;

export const RobotFace = (props: {
  speechText?: string;
  expression?: FaceExpression;
}) => {
  const { expression = "happy", speechText } = props;

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
      {speechText && (
        <Html position={[0, 0.1, 0]} center>
          <div className="left-[250px] relative px-4 py-2 bg-white rounded-lg text-xs shadow-lg w-[300px] text-center">
            <div className="text-gray-800 break-words select-none">
              {speechText + speechText}
            </div>
            {/* Triangle pointer now points from the left side */}
            <div
              className="absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0 h-0 
                          border-t-[8px] border-t-transparent 
                          border-r-[8px] border-r-white 
                          border-b-[8px] border-b-transparent"
            ></div>
          </div>
        </Html>
      )}
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
