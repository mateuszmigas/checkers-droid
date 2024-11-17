import { useTypewriter } from "@/hooks/useTypeWriter";
import { useState } from "react";
import { Typewriter } from "./typeWriter";

type RobotSpeechBubbleProps = {
  message?: string;
};

export const RobotSpeechBubble = ({ message }: RobotSpeechBubbleProps) => {
  const [opacity] = useState(0.7);
  const typewriter = useTypewriter(message ?? "");

  if (!message) return null;

  return (
    <div
      style={{
        background: "rgba(0, 0, 0, 0.8)",
        color: "white",
        padding: "8px 12px",
        borderRadius: "8px",
        fontSize: "14px",
        opacity: opacity,
        transform: "translateY(-50px)",
        whiteSpace: "nowrap",
        textAlign: "center",
      }}
    >
      <Typewriter
        className="font-mono text-sm"
        text={message}
        typingDurationSeconds={typewriter.typingDurationSeconds}
      />
    </div>
  );
};

