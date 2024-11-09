import { useRef, useState, useEffect } from "react";
import { Mesh } from "three";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";

export const RobotHead = () => {
  const robotRef = useRef<Mesh>(null);
  const [isBlinking, setIsBlinking] = useState(false);

  useFrame((state) => {
    if (robotRef.current) {
      robotRef.current.position.y = 2 + Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 500); // Keep eye closed for 200ms
    }, 3000); // Blink every 3 seconds

    return () => clearInterval(blinkInterval);
  }, []);

  return (
    <group position={[0, 2, 0]}>
      <RoundedBox ref={robotRef} args={[1, 1, 1]} radius={0.1} smoothness={4}>
        <meshStandardMaterial color="#888888" />

        {/* Hair spikes */}
        <mesh position={[-0.35, 0.55, 0]} rotation={[0, 0, Math.PI / 6]}>
          <boxGeometry args={[0.1, 0.3, 0.1]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
        <mesh position={[-0.15, 0.6, 0]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.1, 0.35, 0.1]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
        <mesh position={[0.05, 0.63, 0]} rotation={[0, 0, -Math.PI / 12]}>
          <boxGeometry args={[0.1, 0.4, 0.1]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
        <mesh position={[0.25, 0.58, 0]} rotation={[0, 0, -Math.PI / 6]}>
          <boxGeometry args={[0.1, 0.3, 0.1]} />
          <meshStandardMaterial color="#333333" />
        </mesh>

        {/* Right eye (blinking) */}
        <mesh position={[0.2, 0.2, 0.51]}>
          <boxGeometry args={[0.2, isBlinking ? 0.01 : 0.1, 0.01]} />
          <meshStandardMaterial
            color="#00ffff"
            emissive="#00ffff"
            emissiveIntensity={0.5}
          />
        </mesh>

        {/* Left eye (static) */}
        <mesh position={[-0.2, 0.2, 0.51]}>
          <boxGeometry args={[0.2, 0.1, 0.01]} />
          <meshStandardMaterial
            color="#00ffff"
            emissive="#00ffff"
            emissiveIntensity={0.5}
          />
        </mesh>

        {/* Smile */}
        <mesh position={[-0.2, -0.15, 0.51]}>
          <boxGeometry args={[0.1, 0.05, 0.01]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
        <mesh position={[-0.1, -0.2, 0.51]}>
          <boxGeometry args={[0.1, 0.05, 0.01]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
        <mesh position={[0, -0.22, 0.51]}>
          <boxGeometry args={[0.1, 0.05, 0.01]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
        <mesh position={[0.1, -0.2, 0.51]}>
          <boxGeometry args={[0.1, 0.05, 0.01]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
        <mesh position={[0.2, -0.15, 0.51]}>
          <boxGeometry args={[0.1, 0.05, 0.01]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
      </RoundedBox>
    </group>
  );
};

