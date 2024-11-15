import { useRef } from "react";
import { Group } from "three";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { RobotFace } from "./robotFace";

type Expression = "happy" | "sad" | "focused";

type RobotProps = {
  expression?: Expression;
  speechText?: string;
};

export const Robot = (props: RobotProps) => {
  const { expression = "happy", speechText } = props;
  const robotRef = useRef<Group>(null);
  const headRef = useRef<Group>(null);

  useFrame((state) => {
    if (!headRef.current) {
      return;
    }
    // Rotate head left and right using sine wave
    headRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.2;
  });

  return (
    <group ref={robotRef} position={[0, 2, -5]} scale={2}>
      {/* Speech Bubble */}

      {/* Head */}
      <group ref={headRef}>
        <RoundedBox args={[1, 0.9, 0.75]} radius={0.2} smoothness={5}>
          <meshStandardMaterial color="#ffffff" roughness={0.1} />
        </RoundedBox>
        <RobotFace expression={expression} speechText={speechText} />
      </group>

      {/* Torso */}
      <RoundedBox
        position={[0, -1, 0]}
        args={[0.8, 1, 0.5]}
        radius={0.1}
        smoothness={4}
      >
        <meshStandardMaterial color="#ffffff" roughness={0.1} />
      </RoundedBox>

      {/* Left Arm */}
      <RoundedBox
        position={[-0.5, -0.8, 0]}
        args={[0.2, 0.6, 0.2]}
        radius={0.05}
        smoothness={4}
      >
        <meshStandardMaterial color="#ffffff" roughness={0.1} />
      </RoundedBox>

      {/* Right Arm */}
      <RoundedBox
        position={[0.5, -0.8, 0]}
        args={[0.2, 0.6, 0.2]}
        radius={0.05}
        smoothness={4}
      >
        <meshStandardMaterial color="#ffffff" roughness={0.1} />
      </RoundedBox>
    </group>
  );
};
