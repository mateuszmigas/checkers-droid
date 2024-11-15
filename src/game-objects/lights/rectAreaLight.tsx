import { RectAreaLightHelper } from "three/examples/jsm/helpers/RectAreaLightHelper.js";
import { RectAreaLight as RectAreaLightThree } from "three";
import { useEffect, useRef } from "react";

interface RectAreaLightProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  color: string;
  intensity?: number;
  width?: number;
  height?: number;
  showHelper?: boolean;
}

export const RectAreaLight = ({
  position,
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  color,
  intensity = 15,
  width = 4,
  height = 10,
  showHelper = true,
}: RectAreaLightProps) => {
  const lightRef = useRef<RectAreaLightThree>(null!);

  useEffect(() => {
    if (showHelper && lightRef.current) {
      const helper = new RectAreaLightHelper(lightRef.current);
      lightRef.current.add(helper);

      return () => {
        helper.dispose();
        lightRef.current?.remove(helper);
      };
    }
  }, [showHelper]);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <rectAreaLight
        ref={lightRef}
        color={color}
        intensity={intensity}
        width={width}
        height={height}
      />
    </group>
  );
};

