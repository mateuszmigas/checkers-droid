import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CheckerPosition, PlayerType } from "@/game-logic/types";
import * as THREE from "three";
import { useSpring, animated } from "@react-spring/three";
import { constants, mapCheckerPosition } from "./constants";

export const Checker = (props: {
  position: CheckerPosition;
  player: PlayerType;
  isKing: boolean;
  mustCapture: boolean;
  onClick?: () => void;
}) => {
  const { mustCapture, player, isKing, onClick } = props;
  const position = mapCheckerPosition(props.position);
  const groupRef = useRef<THREE.Group>(null);

  const color =
    player === "PLAYER_ONE"
      ? constants.playerOneColor
      : constants.playerTwoColor;

  const materialProps = { color, roughness: 0.1 };

  const { x, z } = useSpring({
    x: position[0],
    z: position[2],
  });

  useFrame((state) => {
    if (groupRef.current && mustCapture) {
      groupRef.current.scale.setScalar(
        1 + Math.sin(state.clock.elapsedTime * 4) * 0.1
      );
    } else if (groupRef.current) {
      groupRef.current.scale.setScalar(1);
    }
  });

  return (
    <animated.group
      position-x={x}
      position-y={position[1]}
      position-z={z}
      ref={groupRef}
      onPointerDown={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "default")}
    >
      <mesh>
        <cylinderGeometry args={[0.4, 0.4, 0.15, 32]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>
      <mesh position={[0, 0.075, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.1, 32]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>
      {isKing && (
        <mesh position={[0, 0.2, 0]}>
          <sphereGeometry args={[0.15, 32, 32]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
      )}
    </animated.group>
  );
};

