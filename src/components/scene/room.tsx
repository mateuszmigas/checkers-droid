import { useGLTF } from "@react-three/drei";

export const Room = () => {
  const { scene } = useGLTF("/room.glb");

  return (
    <>
      <spotLight
        position={[0, 10, 0]}
        angle={0.3}
        penumbra={0.5}
        intensity={1}
        color="#b0e0e6"
      />
      <directionalLight position={[5, 15, 5]} intensity={0.5} />
      <ambientLight intensity={0.1} />
      <ambientLight intensity={0.1} color="#b0e0e6" />

      <primitive position={[0, -3, 0]} object={scene} />

      {/* Table */}
      <group position={[0, -0.1, 0]}>
        <mesh>
          <boxGeometry args={[12, 0.2, 12]} />
          <meshStandardMaterial
            color="#000000"
            roughness={0.1}
            metalness={0.8}
            envMapIntensity={1}
          />
        </mesh>
      </group>
    </>
  );
};
