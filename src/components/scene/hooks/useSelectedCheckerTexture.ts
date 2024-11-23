import { PlayerType } from "@/game-logic/types";
import { useEffect } from "react";
import { useCanvas2dTexture } from "./useCanvas2dTexture";
import { renderSelectedCheckerIndicator } from "../texture-renderers/renderSelectedCheckerIndicator";
import { constants } from "../constants";

export const useSelectedCheckerTexture = (player: PlayerType) => {
  const color =
    player === "PLAYER_ONE"
      ? constants.playerTwoColor
      : constants.playerOneColor;

  const { textureRef, updateTexture } = useCanvas2dTexture({
    width: 256,
    height: 256,
  });

  useEffect(() => {
    updateTexture((context) => renderSelectedCheckerIndicator(context, color));
  }, [color, updateTexture]);

  return textureRef.current;
};

