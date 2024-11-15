import { useSpring, animated } from "@react-spring/three";

interface TurnIndicatorProps {
  player: "PLAYER_ONE" | "PLAYER_TWO";
}

export const TurnIndicator: React.FC<TurnIndicatorProps> = ({ player }) => {
  const targetPosition: [number, number, number] =
    player === "PLAYER_ONE"
      ? [4, 0.5, -4.5] // Player One at bottom (negative z)
      : [4, 0.5, 4.5]; // Player Two at top (positive z)

  const color = player === "PLAYER_ONE" ? "#cc0000" : "#ffffff";

  const { position } = useSpring({
    position: targetPosition,
  });

  return (
    <animated.mesh position={position}>
      {/* Small cube indicator */}
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.5}
      />
    </animated.mesh>
  );
};
