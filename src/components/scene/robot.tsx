import { useRef } from "react";
import { Group } from "three";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { RobotFace } from "./robotFace";
import { PlayerType } from "@/game-logic/types";

type RobotProps = { player: PlayerType };

export const Robot = (props: RobotProps) => {
  const { player } = props;
  const robotRef = useRef<Group>(null);
  const headRef = useRef<Group>(null);

  // const gameSession = useGameSessionContext();

  // useEventListener(gameSession)

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
      ref={robotRef}
      position={[0, 2, player === "PLAYER_ONE" ? -5 : 5]}
      rotation={[0, player === "PLAYER_ONE" ? 0 : Math.PI, 0]}
      scale={2}
    >
      {/* Speech Bubble */}

      {/* Head */}
      <group ref={headRef}>
        <RoundedBox args={[1, 0.9, 0.75]} radius={0.2} smoothness={5}>
          <meshStandardMaterial color={color} roughness={0.1} />
        </RoundedBox>
        <RobotFace expression={"focused"} speechText={"hehe"} />
      </group>

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
