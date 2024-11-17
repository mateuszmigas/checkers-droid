import { useState } from "react";

type RobotMessageProps = {
  message?: string;
};

export const RobotMessage = ({ message }: RobotMessageProps) => {
  const [opacity] = useState(0.7);

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
      {message}
    </div>
  );
};

