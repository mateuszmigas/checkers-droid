import { useSpring, animated } from "@react-spring/three";
import { constants } from "./constants";

interface TurnIndicatorProps {
  player: "PLAYER_ONE" | "PLAYER_TWO";
}

export const TurnIndicator: React.FC<TurnIndicatorProps> = ({ player }) => {
  const targetPosition: [number, number, number] =
    player === "PLAYER_ONE" ? [4.5, 0.5, -4.5] : [4.5, 0.5, 4.5];

  const color =
    player === "PLAYER_ONE"
      ? constants.playerOneColor
      : constants.playerTwoColor;

  const { position } = useSpring({
    position: targetPosition,
  });

  return (
    <animated.mesh position={position}>
      <sphereGeometry args={[0.2, 32, 32]} />
      <meshStandardMaterial color={color} />
    </animated.mesh>
  );
};

