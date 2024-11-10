import { useRef } from "react";
import { Mesh } from "three";
import { useFrame } from "@react-three/fiber";

interface CheckerProps {
  position: [number, number, number];
  color: string;
  isSelected?: boolean;
  mustCapture?: boolean;
  onClick?: () => void;
}

export const Checker = ({
  position,
  color,
  isSelected,
  mustCapture,
  onClick,
}: CheckerProps) => {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      if (isSelected) {
        meshRef.current.position.y =
          position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      } else if (mustCapture) {
        // Add a pulsing effect for pieces that must capture
        meshRef.current.scale.setScalar(
          1 + Math.sin(state.clock.elapsedTime * 4) * 0.1
        );
      } else {
        meshRef.current.position.y = position[1];
        meshRef.current.scale.setScalar(1);
      }
    }
  });

  return (
    <mesh
      position={position}
      ref={meshRef}
      onClick={onClick}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "default")}
    >
      <cylinderGeometry args={[0.4, 0.4, 0.2, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={mustCapture ? "#ff0000" : "#000000"}
        emissiveIntensity={mustCapture ? 0.5 : 0}
      />
    </mesh>
  );
};

