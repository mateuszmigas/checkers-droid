import { useEffect } from "react";
import { renderSelectableCheckerIndicator } from "../texture-renderers/renderSelectableCheckerIndicator";
import { useCanvas2dTexture } from "./useCanvas2dTexture";
import { PlayerType } from "@/game-logic/types";
import { constants } from "../constants";

export const useSelectableCheckerTexture = (player: PlayerType) => {
  const color =
    player === "PLAYER_ONE"
      ? constants.playerTwoColor
      : constants.playerOneColor;

  const { textureRef, updateTexture } = useCanvas2dTexture({
    width: 256,
    height: 256,
  });

  useEffect(() => {
    updateTexture((context) =>
      renderSelectableCheckerIndicator(context, color)
    );
  }, [color, updateTexture]);

  return textureRef.current;
};

