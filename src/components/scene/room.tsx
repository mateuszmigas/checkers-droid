import { useEffect } from "react";
import { useCanvas2dTexture } from "./hooks/useCanvas2dTexture";

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

const shadowSize = 256;

export const Room = () => {
  const { updateTexture, textureRef } = useCanvas2dTexture({
    width: shadowSize,
    height: shadowSize,
  });

  // const shadow = useTexture("shadow-png.png");

  useEffect(() => {
    updateTexture((ctx) => {
      ctx.shadowColor = "black";
      ctx.shadowBlur = 25;
      ctx.fillStyle = "red";
      ctx.fillRect(
        shadowSize * 0.2,
        shadowSize * 0.2,
        shadowSize * 0.6,
        shadowSize * 0.6
      );
    });
  }, [updateTexture]);

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
          <meshStandardMaterial color="#005066" />
        </mesh>
        <Wall
          rotation={[0, 0, 0]}
          position={[0, 10, 20]}
          lightColor="#4F7988"
        />
        <Wall
          rotation={[0, Math.PI / 2, 0]}
          position={[20, 10, 0]}
          lightColor="#4F7988"
        />
        <Wall
          rotation={[0, -Math.PI, 0]}
          position={[0, 10, -20]}
          lightColor="#4F7988"
        />
        <Wall
          rotation={[0, -Math.PI / 2, 0]}
          position={[-20, 10, 0]}
          lightColor="#4F7988"
        />
      </group>

      {/* Table */}
      <group position={[0, -1.5, 0]}>
        <mesh>
          <boxGeometry args={[10, 3, 10]} />
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </mesh>
        <mesh position={[0, -1.47, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[16, 16]} />
          <meshBasicMaterial map={textureRef.current} transparent={true} />
        </mesh>
      </group>
    </>
  );
};
