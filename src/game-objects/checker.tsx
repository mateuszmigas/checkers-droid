import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CheckerPiece } from "@/gameState";
import * as THREE from "three";

interface CheckerProps {
  position: [number, number, number];
  isSelected: boolean;
  mustCapture: boolean;
  onClick?: () => void;
  piece: CheckerPiece;
}

export const Checker = (props: CheckerProps) => {
  const { position, isSelected, mustCapture, piece, onClick } = props;
  const groupRef = useRef<THREE.Group>(null);
  const { player, isKing } = piece;

  const color = player === "PLAYER_ONE" ? "#ff2020" : "#f0f0f0";
  const materialProps = { color, roughness: 0.1 };

  useFrame((state) => {
    if (groupRef.current) {
      if (isSelected) {
        groupRef.current.position.y =
          position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      } else if (mustCapture) {
        groupRef.current.scale.setScalar(
          1 + Math.sin(state.clock.elapsedTime * 4) * 0.1
        );
      } else {
        groupRef.current.position.y = position[1];
        groupRef.current.scale.setScalar(1);
      }
    }
  });

  return (
    <group
      position={position}
      ref={groupRef}
      onClick={onClick}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "default")}
    >
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.4, 0.4, 0.15, 32]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.075, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.1, 32]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>
      {isKing && (
        <mesh castShadow receiveShadow position={[0, 0.2, 0]}>
          <sphereGeometry args={[0.15, 32, 32]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
      )}
    </group>
  );
};
