interface CheckerProps {
  position?: [number, number, number];
  color?: string;
}

export const Checker: React.FC<CheckerProps> = ({
  position = [0, 0, 0],
  color = "#ff0000",
}) => {
  return (
    <mesh position={position}>
      {/* Main checker body - cylinder with small height */}
      <cylinderGeometry args={[0.4, 0.4, 0.15, 32]} />
      {/* Use MeshStandardMaterial for better lighting effects */}
      <meshStandardMaterial color={color} metalness={0.5} roughness={0.2} />
    </mesh>
  );
};

