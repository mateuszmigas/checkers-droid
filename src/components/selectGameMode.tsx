import { GameMode } from "@/game-logic/gameMode";
import { Button } from "./ui/button";

export const SelectGameMode = (props: {
  onSelect: (gameMode: GameMode) => void;
}) => {
  return (
    <div>
      <Button onClick={() => props.onSelect("AI_VS_AI")}>AI vs AI</Button>
      <Button onClick={() => props.onSelect("HUMAN_VS_AI")}>Human vs AI</Button>
      <Button onClick={() => props.onSelect("HUMAN_VS_HUMAN")}>
        Human vs Human
      </Button>
    </div>
  );
};

