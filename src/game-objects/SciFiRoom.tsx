import {
  useGLTF,
  CameraControls,
  Center,
  AccumulativeShadows,
  RandomizedLight,
} from "@react-three/drei";

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
      <ambientLight intensity={0.2} />
      <ambientLight intensity={0.2} color="#b0e0e6" />

      <mesh receiveShadow position={[0, -5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      <group position={[0, -0.1, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[12, 0.2, 12]} />
          <meshStandardMaterial
            color="#ffffff"
            roughness={0.1}
            metalness={0.8}
          />
        </mesh>

        <mesh position={[0, -1.5, 0]}>
          <boxGeometry args={[2, 3, 2]} />
          <meshStandardMaterial
            color="#ffffff"
            metalness={0.9}
            roughness={0.1}
            envMapIntensity={1.5}
          />
        </mesh>

        <mesh position={[0, -3, 0]}>
          <boxGeometry args={[4, 0.1, 4]} />
          <meshBasicMaterial color={[5, 0, 0]} toneMapped={false} />
        </mesh>
      </group>

      <mesh position={[-2, 0, 0]}>
        <boxGeometry />
        <meshBasicMaterial color={[5, 0, 0]} toneMapped={false} />
      </mesh>

      <mesh position={[2, 0, 0]}>
        <boxGeometry />
        <meshBasicMaterial color="green" />
      </mesh>
    </>
  );
};

