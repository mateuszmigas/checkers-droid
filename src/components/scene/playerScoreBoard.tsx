import { PlayerType } from "@/game-logic/types";

export const PlayerScoreBoard = (props: {
  position: [number, number, number];
  playerType: PlayerType;
}) => {
  return (
    <mesh position={props.position} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry />
      <meshStandardMaterial color={"red"} />
    </mesh>
  );
};

