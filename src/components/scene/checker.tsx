import { CheckerPosition, PlayerType } from "@/game-logic/types";
import { useSpring, animated } from "@react-spring/three";
import { constants, mapCheckerPosition } from "./constants";
import { CanvasTexture } from "three";
import { Piece } from "./piece";
import { extend } from "@react-three/fiber";

extend({ CanvasTexture });

export const Checker = (props: {
  position: CheckerPosition;
  player: PlayerType;
  isKing: boolean;
  isSelected: boolean;
  isSelectable: boolean;
  onClick: () => void;
  selectedTexture: CanvasTexture;
  selectableTexture: CanvasTexture;
}) => {
  const {
    player,
    isKing,
    isSelected,
    isSelectable,
    onClick,
    selectedTexture,
    selectableTexture,
  } = props;
  const position = mapCheckerPosition(props.position);

  const color =
    player === "PLAYER_ONE"
      ? constants.playerOneColor
      : constants.playerTwoColor;

  const materialProps = { color, roughness: 0.1 };

  const { x, z } = useSpring({
    x: position[0],
    z: position[2],
  });

  return (
    <animated.group
      position-x={x}
      position-y={position[1]}
      position-z={z}
      onPointerDown={(e) => {
        e.stopPropagation();
        if (isSelectable) onClick();
      }}
      onPointerOver={() => {
        if (isSelectable) document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "default";
      }}
    >
      {isSelected && (
        <mesh rotation-x={-Math.PI / 2} position={[0, -0.025, 0]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial map={selectedTexture} transparent={true} />
        </mesh>
      )}
      {!isSelected && isSelectable && (
        <mesh rotation-x={-Math.PI / 2} position={[0, -0.025, 0]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial map={selectableTexture} transparent={true} />
        </mesh>
      )}
      <Piece isKing={isKing} materialProps={materialProps} />
    </animated.group>
  );
};

