import { CheckerPosition } from "@/game-logic/types";
import { constants, mapCheckerPosition } from "./constants";
import { Piece } from "./piece";

export const MoveIndicator = (props: {
  position: CheckerPosition;
  onClick: () => void;
}) => {
  const { onClick } = props;
  const position = mapCheckerPosition(props.position);

  return (
    <group
      position={position}
      onPointerDown={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={() => {
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "default";
      }}
    >
      <Piece
        materialProps={{
          color: constants.checkerIndicatorColor,
          roughness: 0.1,
          transparent: true,
          opacity: 0.5,
        }}
      />
    </group>
  );
};
