interface WallProps {
  rotation?: [number, number, number];
  position: [number, number, number];
  lightColor: string;
}

const Wall = ({ rotation, position, lightColor }: WallProps) => {
  const wallHeight = 20;
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <boxGeometry args={[40, wallHeight, 0]} />
        <meshStandardMaterial color={lightColor} />
      </mesh>
      {/* <spotLight
        position={[0, 0, -2]}
        angle={0.5}
        penumbra={0.5}
        intensity={100}
        color={lightColor}
      /> */}
      {/* <RectAreaLight
        rotation={[0, 0, 0]}
        position={[0, -wallHeight / 2, -0.1]}
        width={40}
        height={0.1}
        intensity={50}
        color="#ffffff"
        showHelper={true}
      /> */}
    </group>
  );
};

export const Room = () => {
  return (
    <>
      {/* Table spotlight */}
      <spotLight
        position={[0, 10, 0]}
        angle={Math.PI / 2}
        penumbra={0.25}
        intensity={200}
        color="#ffffff"
      />

      {/* Subtle ambient light */}
      <ambientLight intensity={0.4} />

      <group position={[0, -3, 0]}>
        {/* Ceiling */}
        <mesh position={[0, 20, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[40, 40]} />
          <meshStandardMaterial color="#f0f0f0" />
        </mesh>

        {/* Floor */}
        <mesh
          receiveShadow
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0, 0]}
        >
          <planeGeometry args={[40, 40]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <Wall
          rotation={[0, 0, 0]}
          position={[0, 10, 20]}
          lightColor="#FF1350"
        />
        <Wall
          rotation={[0, Math.PI / 2, 0]}
          position={[20, 10, 0]}
          lightColor="#FF00A1"
        />
        <Wall
          rotation={[0, -Math.PI, 0]}
          position={[0, 10, -20]}
          lightColor="#FE76FE"
        />
        <Wall
          rotation={[0, -Math.PI / 2, 0]}
          position={[-20, 10, 0]}
          lightColor="#7B03EC"
        />
      </group>

      {/* Table */}
      <group position={[0, -2, 0]}>
        <mesh>
          <boxGeometry args={[10, 4, 10]} />
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </mesh>
        {/* <mesh position={[0, -0.95, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[12, 12]} />
          <meshBasicMaterial
            color="#000000"
            transparent={true}
            opacity={0.5}
            depthWrite={false}
          />
        </mesh> */}
      </group>
    </>
  );
};
