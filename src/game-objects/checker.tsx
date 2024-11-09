interface CheckerProps {
  position?: [number, number, number];
  color?: string;
  isSelected?: boolean;
  onClick?: () => void;
}

export const Checker: React.FC<CheckerProps> = ({
  position = [0, 0, 0],
  color = "#ff0000",
  isSelected = false,
  onClick,
}) => {
  return (
    <group position={position}>
      {/* Outer glow/outline cylinder - only visible when selected */}
      {isSelected && (
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.45, 0.45, 0.14, 32]} />
          <meshStandardMaterial
            color={color}
            transparent={true}
            opacity={0.6}
            emissive={color}
            emissiveIntensity={1}
          />
        </mesh>
      )}

      {/* Main checker piece */}
      <mesh onClick={onClick}>
        <cylinderGeometry args={[0.4, 0.4, 0.15, 32]} />
        <meshStandardMaterial
          color={color}
          metalness={0.5}
          roughness={0.2}
          emissive={isSelected ? color : "#000000"}
          emissiveIntensity={isSelected ? 0.3 : 0}
        />
      </mesh>
    </group>
  );
};

