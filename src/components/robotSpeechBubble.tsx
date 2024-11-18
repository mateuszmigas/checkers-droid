import { memo } from "react";
import { Typewriter } from "./typeWriter";

export const RobotSpeechBubble = memo(
  (props: { message: string | ReadableStream<string> }) => {
    const { message } = props;
    return (
      <div
        className={`bg-black/80 text-white px-3 py-2 rounded-lg text-sm opacity-70 
        -translate-y-1/2 w-max max-w-[300px] whitespace-normal text-center break-words select-none
      `}
      >
        <Typewriter className="font-mono text-sm" text={message} />
      </div>
    );
  }
);

