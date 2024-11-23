import { memo } from "react";
import { Button } from "../button";

export const AiNotSupportedPage = memo((props: { onContinue: () => void }) => {
  const { onContinue } = props;
  return (
    <div className="size-full text-white absolute flex flex-col items-center justify-center">
      <p className="text-lg font-semibold">
        Looks like this browser doesn't support Chrome AI or it's not enabled.
      </p>
      <p className="text-lg font-semibold">
        You can still play the game, but it won't have any AI features.
      </p>
      <Button className="mt-4" onClick={onContinue}>
        Continue
      </Button>
    </div>
  );
});

