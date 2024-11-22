import { GameMode } from "@/game-logic/gameMode";
import { cn } from "@/utils/css";

const renderModeCard = (
  title: string,
  imageUrl: string,
  onClick: () => void,
  className?: string
) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-lg overflow-hidden border border-gray-200 shadow-md hover:shadow-lg transition-shadow",
        "flex flex-col w-[250px]",
        className
      )}
    >
      <div className="h-[200px] w-full">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4 text-center bg-white">
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
    </div>
  );
};

export const SelectGameModePage = (props: {
  onSelect: (gameMode: GameMode) => void;
}) => {
  const { onSelect } = props;
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center">
      <div className="flex flex-wrap gap-6 justify-center items-center py-12 p-4">
        {renderModeCard("Human vs AI", "human_vs_ai.webp", () =>
          onSelect("HUMAN_VS_AI")
        )}
        {renderModeCard("Human vs Human", "human_vs_human.webp", () =>
          onSelect("HUMAN_VS_HUMAN")
        )}
        {renderModeCard("AI vs AI", "ai_vs_ai.webp", () =>
          onSelect("AI_VS_AI")
        )}
      </div>
    </div>
  );
};

