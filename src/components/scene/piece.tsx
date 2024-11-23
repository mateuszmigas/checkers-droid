import { MeshStandardMaterialProps } from "@react-three/fiber";
import { memo } from "react";

export const Piece = memo(
  (props: { materialProps: MeshStandardMaterialProps; isKing?: boolean }) => {
    const { isKing = false, materialProps } = props;
    return (
      <group>
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
      </group>
    );
  }
);

