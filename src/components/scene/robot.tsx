import { useEffect, useMemo, useRef, useState } from "react";
import { Group } from "three";
import { useFrame } from "@react-three/fiber";
import { Box, RoundedBox, Html } from "@react-three/drei";
import { PlayerType } from "@/game-logic/types";
import { useCanvas2dTexture } from "./hooks/useCanvas2dTexture";
import { renderRobotFace } from "./texture-renderers/renderRobotFace";
import { RobotSpeechBubble } from "../robotSpeechBubble";
import { constants } from "./constants";
import { useGameSessionContext } from "@/hooks/useGameSessionContext";
import { useEventListener } from "@/hooks/useEventListener";

type RobotProps = { playerType: PlayerType };
const textureSize = 512;

export const Robot = (props: RobotProps) => {
  const { playerType } = props;
  const headRef = useRef<Group>(null);
  const robotRef = useRef<Group>(null);
  const gameSession = useGameSessionContext();
  const [message, setMessage] = useState<
    string | ReadableStream<string> | null
  >(null);
  const aiInstance = useMemo(() => {
    const player = gameSession.getPlayer(playerType);
    if (player.type !== "AI") {
      throw new Error("Player is not an AI");
    }
    return player.getInstance();
  }, [gameSession, playerType]);

  useEventListener(
    aiInstance,
    ["MESSAGE_CHANGED", "EMOTION_CHANGED"],
    (event) => {
      if (event.type === "MESSAGE_CHANGED") {
        setMessage(event.message);
      }
      if (event.type === "EMOTION_CHANGED") {
        updateFaceTexture((context) => renderRobotFace(context, event.emotion));
      }
    }
  );

  const { updateTexture: updateFaceTexture, textureRef: faceTextureRef } =
    useCanvas2dTexture({
      width: textureSize,
      height: textureSize,
    });

  useEffect(() => {
    updateFaceTexture((context) => renderRobotFace(context, "happy"));
  }, [updateFaceTexture, faceTextureRef]);

  useFrame((state) => {
    if (!headRef.current) {
      return;
    }
    headRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.2;
  });

  const color =
    playerType === "PLAYER_ONE"
      ? constants.playerOneColor
      : constants.playerTwoColor;

  return (
    <group
      ref={robotRef}
      position={[0, 0, playerType === "PLAYER_ONE" ? -7 : 7]}
      rotation={[0, playerType === "PLAYER_ONE" ? 0 : Math.PI, 0]}
      scale={1.75}
    >
      {message && (
        <Html position={[0, 3.5, 0]} center>
          <RobotSpeechBubble message={message} />
        </Html>
      )}

      {/* Head */}
      <group position={[0, 2.95, 0]} ref={headRef}>
        <RoundedBox args={[1, 0.9, 0.75]} radius={0.2} smoothness={5}>
          <meshStandardMaterial color={color} roughness={0.1} />
        </RoundedBox>
        <Box args={[0.65, 0.5, 0.25]} position={[0, 0, 0.3]}>
          <meshBasicMaterial
            attach="material-4"
            map={faceTextureRef.current}
            transparent={true}
            color={[1, 1, 1]}
          />
        </Box>
      </group>

      {/* Torso */}
      <RoundedBox
        position={[0, 1.9, 0]}
        args={[0.8, 1.2, 0.5]}
        radius={0.1}
        smoothness={4}
      >
        <meshStandardMaterial color={color} roughness={0.1} />
      </RoundedBox>

      {/* Arms   */}
      <group rotation={[-Math.PI / 4, 0, 0]} position={[0, 2, 0.3]}>
        <RoundedBox
          position={[-0.5, 0, 0]}
          args={[0.2, 0.8, 0.2]}
          radius={0.05}
          smoothness={4}
        >
          <meshStandardMaterial color={color} roughness={0.1} />
        </RoundedBox>
        <RoundedBox
          position={[0.5, 0, 0]}
          args={[0.2, 0.8, 0.2]}
          radius={0.05}
          smoothness={4}
        >
          <meshStandardMaterial color={color} roughness={0.1} />
        </RoundedBox>
      </group>

      {/* Legs */}
      <group position={[0, 0.6, 0]}>
        {/* Left Leg */}
        <RoundedBox
          position={[-0.25, 0, 0]}
          args={[0.2, 1.5, 0.2]}
          radius={0.05}
          smoothness={4}
        >
          <meshStandardMaterial color={color} roughness={0.1} />
        </RoundedBox>

        {/* Right Leg */}
        <RoundedBox
          position={[0.25, 0, 0]}
          args={[0.2, 1.5, 0.2]}
          radius={0.05}
          smoothness={4}
        >
          <meshStandardMaterial color={color} roughness={0.1} />
        </RoundedBox>
      </group>
    </group>
  );
};

