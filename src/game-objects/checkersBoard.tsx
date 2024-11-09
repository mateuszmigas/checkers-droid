import { useMemo } from "react";

export const CheckersBoard = () => {
  const squares = useMemo(() => {
    const boardSquares = [];
    const size = 1; // Size of each square

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        // Alternate colors based on position
        const isWhite = (row + col) % 2 === 0;
        const color = isWhite ? "#ffffff" : "#000000";

        // Calculate position for each square
        const x = col * size - 3.5 * size; // Center the board
        const z = row * size - 3.5 * size;

        boardSquares.push(
          <mesh key={`${row}-${col}`} position={[x, 0, z]}>
            <boxGeometry args={[size, 0.1, size]} />
            <meshStandardMaterial color={color} />
          </mesh>
        );
      }
    }
    return boardSquares;
  }, []);

  return <group>{squares}</group>;
};

