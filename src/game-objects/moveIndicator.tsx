interface MoveIndicatorProps {
  position: [number, number, number];
  onClick: () => void;
}

export const MoveIndicator: React.FC<MoveIndicatorProps> = ({
  position,
  onClick,
}) => {
  return (
    <group position={position}>
      {/* Outer glow/outline cylinder */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.45, 0.45, 0.04, 32]} />
        <meshStandardMaterial
          color="#4444ff"
          transparent={true}
          opacity={0.4}
          emissive="#4444ff"
          emissiveIntensity={1}
        />
      </mesh>

      {/* Main indicator piece */}
      <mesh onClick={onClick}>
        <cylinderGeometry args={[0.4, 0.4, 0.05, 32]} />
        <meshStandardMaterial
          color="#2222ff"
          transparent={true}
          opacity={0.6}
          emissive="#2222ff"
          emissiveIntensity={0.5}
          metalness={0.5}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
};

