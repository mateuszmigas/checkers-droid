import { useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import { TextureLoader, RepeatWrapping } from "three";

export const CheckersBoard = () => {
  // Load the wood texture
  const woodTexture = useLoader(TextureLoader, "/wood2.jpg");

  const boardElements = useMemo(() => {
    // Configure the wood texture
    woodTexture.wrapS = woodTexture.wrapT = RepeatWrapping;
    woodTexture.repeat.set(1, 1);

    const elements = [];
    const squareSize = 1; // Size of each square
    const edgeHeight = 0.1; // Height of the border
    const edgeWidth = 0.4; // Width of the border

    // Create the squares
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const isWhite = (row + col) % 2 === 0;
        const x = col * squareSize - 3.5 * squareSize;
        const z = row * squareSize - 3.5 * squareSize;

        elements.push(
          <mesh key={`${row}-${col}`} position={[x, 0, z]}>
            <boxGeometry args={[squareSize, 0.1, squareSize]} />
            <meshStandardMaterial
              map={woodTexture}
              color={isWhite ? "#ffffff" : "#481808"}
            />
          </mesh>
        );
      }
    }

    // Add the edges
    const edgePositions = [
      // North edge
      {
        pos: [0, edgeHeight / 2, -4 - edgeWidth / 2] as [
          number,
          number,
          number
        ],
        scale: [8.8, edgeHeight, edgeWidth] as [number, number, number],
      },
      // South edge
      {
        pos: [0, edgeHeight / 2, 4 + edgeWidth / 2] as [number, number, number],
        scale: [8.8, edgeHeight, edgeWidth] as [number, number, number],
      },
      // West edge
      {
        pos: [-4 - edgeWidth / 2, edgeHeight / 2, 0] as [
          number,
          number,
          number
        ],
        scale: [edgeWidth, edgeHeight, 8.8] as [number, number, number],
      },
      // East edge
      {
        pos: [4 + edgeWidth / 2, edgeHeight / 2, 0] as [number, number, number],
        scale: [edgeWidth, edgeHeight, 8.8] as [number, number, number],
      },
    ];

    // Create the edge meshes
    edgePositions.forEach((edge, index) => {
      // Calculate texture repeat based on edge dimensions
      // Using scale[0] for width and scale[2] for length
      const textureRepeatX = edge.scale[0] / 2; // Adjust this divisor to control texture density
      const textureRepeatZ = edge.scale[2] / 2;

      woodTexture.repeat.set(textureRepeatX, textureRepeatZ);

      elements.push(
        <mesh key={`edge-${index}`} position={edge.pos}>
          <boxGeometry args={edge.scale} />
          <meshStandardMaterial
            map={woodTexture}
            color="#B5744C"
            metalness={0}
            roughness={0.8}
          />
        </mesh>
      );
    });

    // Reset texture settings for the board squares
    woodTexture.repeat.set(1, 1);

    return elements;
  }, [woodTexture]);

  return <mesh position={[0, 0, 0]}>{boardElements}</mesh>;
};
