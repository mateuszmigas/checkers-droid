interface MoveIndicatorProps {
  position: [number, number, number];
  onClick: () => void;
}

export const MoveIndicator: React.FC<MoveIndicatorProps> = ({
  position,
  onClick,
}) => {
  return (
    <mesh position={position} onClick={onClick}>
      <cylinderGeometry args={[0.4, 0.4, 0.05, 32]} />
      <meshStandardMaterial
        color="#ffff00"
        transparent={true}
        opacity={0.5}
        emissive="#ffff00"
        emissiveIntensity={0.5}
      />
    </mesh>
  );
};
