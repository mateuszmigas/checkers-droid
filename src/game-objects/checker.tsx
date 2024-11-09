import { useSpring, animated } from "@react-spring/three";
import { ThreeEvent } from "@react-three/fiber";
import { Vector3 } from "three";
import { easings } from "@react-spring/three";

interface CheckerProps {
  position: [number, number, number];
  color: string;
  isSelected: boolean;
  onClick: (event: ThreeEvent<MouseEvent>) => void;
}

export const Checker = ({
  position,
  color,
  isSelected,
  onClick,
}: CheckerProps) => {
  const { position: animatedPosition } = useSpring({
    position,
    config: {
      duration: 150,
      easing: easings.easeInOutQuad,
    },
  });

  return (
    <animated.mesh
      position={animatedPosition}
      onClick={onClick}
      scale={isSelected ? 1.1 : 1}
    >
      <cylinderGeometry args={[0.4, 0.4, 0.2, 32]} />
      <meshStandardMaterial color={color} />
    </animated.mesh>
  );
};

