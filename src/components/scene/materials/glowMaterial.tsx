import { MeshBasicMaterialProps } from "@react-three/fiber";

export const BasicGlowMaterial = (
  props: {
    color: [number, number, number];
    intensity: number;
  } & MeshBasicMaterialProps
) => (
  <meshBasicMaterial
    {...props}
    color={[
      props.color[0] * props.intensity,
      props.color[1] * props.intensity,
      props.color[2] * props.intensity,
    ]}
    toneMapped={false}
  />
);
