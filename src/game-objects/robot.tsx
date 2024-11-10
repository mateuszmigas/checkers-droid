import { useRef } from "react";
import { Group } from "three";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { RobotFace } from "./robotFace";

type Expression = "happy" | "sad" | "focused";

export const Robot = (props: { expression?: Expression }) => {
  const { expression = "happy" } = props;
  const robotRef = useRef<Group>(null);

  const baseY = useRef(2);
  const floatOffset = useRef(0);

  useFrame((state) => {
    if (!robotRef.current) {
      return;
    }
    floatOffset.current = Math.sin(state.clock.elapsedTime) * 0.5;
    robotRef.current.position.y = baseY.current + floatOffset.current;
  });

  return (
    <group ref={robotRef} position={[0, baseY.current, 0]} scale={2}>
      <RoundedBox args={[1, 0.9, 0.75]} radius={0.2} smoothness={5}>
        <meshStandardMaterial color="#ffffff" roughness={0.1} />
      </RoundedBox>
      <RobotFace expression={expression} />
    </group>
  );
};
