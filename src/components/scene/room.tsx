import { useEffect } from "react";
import { useCanvas2dTexture } from "./hooks/useCanvas2dTexture";
import { renderRectangleShadow } from "./texture-renderers/renderRectangleShadow";
import { constants } from "./constants";

const renderWall = (
  position: [number, number, number],
  rotation: [number, number, number],
  lightColor: string
) => (
  <mesh position={position} rotation={rotation}>
    <planeGeometry args={[constants.roomWidth, constants.roomHeight]} />
    <meshStandardMaterial color={lightColor} />
  </mesh>
);

export const Room = () => {
  const { updateTexture, textureRef } = useCanvas2dTexture({
    width: constants.tableShadowSize,
    height: constants.tableShadowSize,
  });

  useEffect(() => {
    updateTexture((context) =>
      renderRectangleShadow(context, constants.tableShadowSize)
    );
  }, [updateTexture]);

  return (
    <>
      {/* Table spotlight */}
      <spotLight
        position={[0, constants.roomHeight / 2, 0]}
        angle={Math.PI / 2}
        penumbra={0.25}
        intensity={200}
      />

      {/* Subtle ambient light */}
      <ambientLight intensity={0.4} />

      <group>
        {/* Ceiling */}
        <mesh
          position={[0, constants.roomHeight, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[constants.roomWidth, constants.roomWidth]} />
          <meshStandardMaterial color={constants.ceilingColor} />
        </mesh>

        {/* Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[constants.roomWidth, constants.roomWidth]} />
          <meshStandardMaterial color={constants.floorColor} />
        </mesh>

        {/* Walls */}
        {renderWall(
          [0, constants.roomHeight / 2, constants.roomWidth / 2],
          [0, Math.PI, 0],
          constants.wallColor
        )}
        {renderWall(
          [constants.roomWidth / 2, constants.roomHeight / 2, 0],
          [0, Math.PI * 1.5, 0],
          constants.wallColor
        )}
        {renderWall(
          [0, constants.roomHeight / 2, -constants.roomWidth / 2],
          [0, 0, 0],
          constants.wallColor
        )}
        {renderWall(
          [-constants.roomWidth / 2, constants.roomHeight / 2, 0],
          [0, Math.PI / 2, 0],
          constants.wallColor
        )}
      </group>

      {/* Table */}
      <group>
        <mesh position={[0, constants.tableHeight / 2, 0]}>
          <boxGeometry
            args={[
              constants.tableSize,
              constants.tableHeight,
              constants.tableSize,
            ]}
          />
          <meshStandardMaterial color={constants.tableColor} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry
            args={[constants.tableSize + 8, constants.tableSize + 8]}
          />
          <meshBasicMaterial map={textureRef.current} transparent={true} />
        </mesh>
      </group>
    </>
  );
};

