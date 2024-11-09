import { useRef } from "react";
import { Mesh, Shape, ExtrudeGeometry } from "three";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { useSpring, animated } from "@react-spring/three";

type Expression = "happy" | "sad" | "focused";

interface RobotHeadProps {
  expression?: Expression;
}

export const RobotHead = ({ expression = "happy" }: RobotHeadProps) => {
  const robotRef = useRef<Mesh>(null);

  // Expression-based animations with more pronounced values
  const { mouthCurve, eyeY } = useSpring({
    mouthCurve: expression === "happy" ? 1.2 : expression === "sad" ? -1 : 0,
    eyeY: expression === "sad" ? 0.2 : expression === "focused" ? 0.25 : 0.3,
    config: { tension: 100, friction: 10 },
  });

  // Create curved mouth shape with more pronounced curves
  const createMouthShape = (smile: number) => {
    const shape = new Shape();
    const width = expression === "focused" ? 0.15 : 0.3;
    const height = expression === "focused" ? 0.05 : 0.15;

    shape.moveTo(-width, 0);
    if (expression === "focused") {
      shape.lineTo(width, 0);
    } else {
      // Control point calculation adjusted for better curve
      const controlY = height * -smile; // Removed negative sign to fix curve direction
      shape.quadraticCurveTo(0, controlY, width, 0);
    }

    return new ExtrudeGeometry(shape, {
      steps: 1,
      depth: 0.02,
      bevelEnabled: false,
    });
  };

  // Animate floating movement
  useFrame((state) => {
    if (robotRef.current) {
      const floatIntensity = expression === "sad" ? 0.05 : 0.1;
      robotRef.current.position.y =
        Math.sin(state.clock.elapsedTime) * floatIntensity;
    }
  });

  return (
    <group position={[0, 1.5, -5]}>
      {/* Robot Torso */}
      <group position={[0, -1.2, 0]}>
        {/* Main body */}
        <RoundedBox args={[0.8, 1.2, 0.6]} radius={0.1} smoothness={4}>
          <meshStandardMaterial
            color="#4a4a4a"
            metalness={0.8}
            roughness={0.2}
          />
        </RoundedBox>

        {/* Chest plate */}
        <mesh position={[0, 0.2, 0.31]}>
          <boxGeometry args={[0.4, 0.3, 0.01]} />
          <meshStandardMaterial
            color="#6e6e6e"
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>

        {/* Arms */}
        <group position={[-0.6, 0.2, 0]}>
          {/* Left arm */}
          <RoundedBox args={[0.2, 0.8, 0.2]} radius={0.05} smoothness={4}>
            <meshStandardMaterial
              color="#3d3d3d"
              metalness={0.8}
              roughness={0.2}
            />
          </RoundedBox>
          {/* Left hand */}
          <mesh position={[0, -0.5, 0]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial
              color="#2a2a2a"
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
        </group>

        {/* Right arm */}
        <group position={[0.6, 0.2, 0]}>
          {/* Right arm */}
          <RoundedBox args={[0.2, 0.8, 0.2]} radius={0.05} smoothness={4}>
            <meshStandardMaterial
              color="#3d3d3d"
              metalness={0.8}
              roughness={0.2}
            />
          </RoundedBox>
          {/* Right hand */}
          <mesh position={[0, -0.5, 0]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial
              color="#2a2a2a"
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
        </group>
      </group>

      {/* Existing robot head components */}
      <RoundedBox ref={robotRef} args={[1, 1, 1]} radius={0.1} smoothness={4}>
        <meshStandardMaterial color="#4a4a4a" metalness={0.8} roughness={0.2} />

        {/* Hair spikes - removed animation */}
        <group>
          <mesh position={[-0.35, 0.55, 0]} rotation={[0, 0, Math.PI / 6]}>
            <boxGeometry args={[0.1, 0.3, 0.1]} />
            <meshStandardMaterial
              color="#2a2a2a"
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
          <mesh position={[-0.15, 0.6, 0]} rotation={[0, 0, 0]}>
            <boxGeometry args={[0.1, 0.35, 0.1]} />
            <meshStandardMaterial
              color="#2a2a2a"
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
          <mesh position={[0.05, 0.63, 0]} rotation={[0, 0, -Math.PI / 12]}>
            <boxGeometry args={[0.1, 0.4, 0.1]} />
            <meshStandardMaterial
              color="#2a2a2a"
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
          <mesh position={[0.25, 0.58, 0]} rotation={[0, 0, -Math.PI / 6]}>
            <boxGeometry args={[0.1, 0.3, 0.1]} />
            <meshStandardMaterial
              color="#2a2a2a"
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
        </group>

        {/* Animated eyes */}
        <group>
          {/* Right eye */}
          <animated.mesh
            position-x={0.2}
            position-y={eyeY}
            position-z={0.51}
            rotation={expression === "happy" ? [-Math.PI / 2, 0, 0] : [0, 0, 0]}
          >
            <cylinderGeometry args={[0.1, 0.1, 0.1, 32]} />
            <meshStandardMaterial
              color="#00ffff"
              emissive="#00ffff"
              emissiveIntensity={expression === "focused" ? 0.8 : 0.5}
            />
          </animated.mesh>

          {/* Left eye */}
          <animated.mesh
            position-x={-0.2}
            position-y={eyeY}
            position-z={0.51}
            rotation={expression === "happy" ? [-Math.PI / 2, 0, 0] : [0, 0, 0]}
          >
            <cylinderGeometry args={[0.1, 0.1, 0.1, 32]} />
            <meshStandardMaterial
              color="#00ffff"
              emissive="#00ffff"
              emissiveIntensity={expression === "focused" ? 0.8 : 0.5}
            />
          </animated.mesh>
        </group>

        {/* Animated curved mouth */}
        <animated.mesh
          position={[0, -0.15, 0.51]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <primitive object={createMouthShape(mouthCurve.get())} />
          <meshStandardMaterial
            color="#00ffff"
            emissive="#00ffff"
            emissiveIntensity={expression === "focused" ? 0.8 : 0.5}
          />
        </animated.mesh>
      </RoundedBox>
    </group>
  );
};

