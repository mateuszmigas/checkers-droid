import { GameMode } from "@/game-logic/gameMode";

const renderModeCard = (
  title: string,
  imageUrl: string,
  onClick: () => void,
  className?: string
) => {
  return (
    <div
      onClick={onClick}
      className={`
        group cursor-pointer rounded-lg overflow-hidden border border-background-light hover:border-primary transition-colors
        flex flex-col
        ${className}
      `}
    >
      <img
        src={imageUrl}
        alt={title}
        width={256}
        height={256}
        className="object-cover"
      />
      <div className="p-4 text-center bg-background-light group-hover:bg-primary transition-colors">
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
    <div className="size-full absolute inset-0 z-20 flex items-center justify-center">
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

