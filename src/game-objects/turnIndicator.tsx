interface TurnIndicatorProps {
  player: "PLAYER_ONE" | "PLAYER_TWO";
}

export const TurnIndicator: React.FC<TurnIndicatorProps> = ({ player }) => {
  const position: [number, number, number] =
    player === "PLAYER_ONE"
      ? [0, 0, -4.2] // Player One at bottom (negative z)
      : [0, 0, 4.2]; // Player Two at top (positive z)

  const color = player === "PLAYER_ONE" ? "#cc0000" : "#00cc00";

  return (
    <mesh position={position}>
      {/* Simple bar extending from the board */}
      <boxGeometry args={[8, 0.1, 0.4]} />{" "}
      {/* Width matches board, thin height, small depth */}
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.3}
        metalness={0.5}
        roughness={0.2}
      />
    </mesh>
  );
};

