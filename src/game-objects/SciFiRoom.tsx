import { BasicGlowMaterial } from "./materials/glowMaterial";

const tableSize = [12, 1, 12] as const;

export const SciFiRoom = () => {
  return (
    <>
      <spotLight
        castShadow
        position={[0, 10, 0]}
        angle={0.3}
        penumbra={0.5}
        intensity={1}
        color="#b0e0e6"
      />
      <directionalLight
        position={[5, 15, 5]}
        intensity={0.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <ambientLight intensity={0.1} />
      <ambientLight intensity={0.1} color="#b0e0e6" />

      {/* Floor */}
      <mesh
        receiveShadow
        position={[0, -50, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial
          color="#ffffff"
          envMapIntensity={1}
          metalness={0.5}
          roughness={0.2}
        />
      </mesh>

      {/* Table */}
      <group position={[0, -0.1, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[12, 0.2, 12]} />
          <meshStandardMaterial
            color="#000000"
            roughness={0.1}
            metalness={0.8}
            envMapIntensity={1}
          />
        </mesh>

        <mesh position={[0, -3, 0]} scale={tableSize}>
          <boxGeometry args={[1, 1, 1]} />
          <BasicGlowMaterial color={[1, 1, 1]} intensity={2} />
        </mesh>
      </group>
    </>
  );
};
