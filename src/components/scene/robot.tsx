import { useEffect, useRef } from "react";
import { Group } from "three";
import { useFrame } from "@react-three/fiber";
import { Box, RoundedBox, Plane, Billboard } from "@react-three/drei";
import { PlayerType } from "@/game-logic/types";
import { useCanvas2dTexture } from "./hooks/useCanvas2dTexture";
import { renderRobotFace } from "./texture-renderers/renderRobotFace";
import { BasicGlowMaterial } from "./materials/glowMaterial";
import { renderRobotMessage } from "./texture-renderers/renderRobotMessage";

type RobotProps = { player: PlayerType };
const textureSize = 512;

export const Robot = (props: RobotProps) => {
  const { player } = props;
  const headRef = useRef<Group>(null);

  const { updateTexture: updateFaceTexture, textureRef: faceTextureRef } =
    useCanvas2dTexture({
      width: textureSize,
      height: textureSize,
    });

  const { updateTexture: updateMessageTexture, textureRef: messageTextureRef } =
    useCanvas2dTexture({
      width: textureSize,
      height: textureSize,
    });

  useEffect(() => {
    updateFaceTexture((context) => renderRobotFace(context, "happy"));
  }, [updateFaceTexture, faceTextureRef]);

  useEffect(() => {
    updateMessageTexture((context) =>
      renderRobotMessage(context, "Hello how are you tday!")
    );
  }, [updateMessageTexture, messageTextureRef]);

  useFrame((state) => {
    if (!headRef.current) {
      return;
    }
    // Rotate head left and right using sine wave
    headRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.2;
  });

  const color = player === "PLAYER_ONE" ? "#FF0000" : "#ffffff";

  return (
    <group
      position={[0, 2, player === "PLAYER_ONE" ? -5 : 5]}
      rotation={[0, player === "PLAYER_ONE" ? 0 : Math.PI, 0]}
      scale={2}
    >
      {/* Head */}
      <group ref={headRef}>
        <RoundedBox args={[1, 0.9, 0.75]} radius={0.2} smoothness={5}>
          <meshStandardMaterial color={color} roughness={0.1} />
        </RoundedBox>
        <Box args={[0.65, 0.5, 0.25]} position={[0, 0, 0.3]}>
          <BasicGlowMaterial
            attach="material-4"
            map={faceTextureRef.current}
            transparent={true}
            color={[1, 1, 1]}
            intensity={15}
          />
        </Box>
      </group>

      {/* Message - moved above head */}
      <Billboard>
        <Plane args={[1.3, 0.8]} position={[0, 1.2, 0]}>
          <BasicGlowMaterial
            attach="material"
            map={messageTextureRef.current}
            color={[1, 1, 1]}
            intensity={15}
            transparent={true}
            opacity={0.7}
            side={2}
          />
        </Plane>
      </Billboard>

      {/* Torso */}
      <RoundedBox
        position={[0, -1, 0]}
        args={[0.8, 1, 0.5]}
        radius={0.1}
        smoothness={4}
      >
        <meshStandardMaterial color={color} roughness={0.1} />
      </RoundedBox>

      {/* Left Arm */}
      <RoundedBox
        position={[-0.5, -0.8, 0]}
        args={[0.2, 0.6, 0.2]}
        radius={0.05}
        smoothness={4}
      >
        <meshStandardMaterial color={color} roughness={0.1} />
      </RoundedBox>

      {/* Right Arm */}
      <RoundedBox
        position={[0.5, -0.8, 0]}
        args={[0.2, 0.6, 0.2]}
        radius={0.05}
        smoothness={4}
      >
        <meshStandardMaterial color={color} roughness={0.1} />
      </RoundedBox>
    </group>
  );
};
