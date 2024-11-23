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
  aiAvailable: boolean;
  onSelect: (gameMode: GameMode) => void;
}) => {
  const { aiAvailable, onSelect } = props;
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 gap-6">
      <div className="flex flex-wrap gap-6 justify-center items-center">
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
      {!aiAvailable && (
        <div className="text-white text-center">
          <p className="text-lg font-semibold">
            Looks like this browser doesn't support Chrome AI or it's not
            enabled.
          </p>
          <p className="text-lg font-semibold">
            You can still play the game, but it won't have any AI features.
          </p>
        </div>
      )}
    </div>
  );
};

