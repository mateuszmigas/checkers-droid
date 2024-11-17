import { memo, useEffect, useState } from "react";

export const Typewriter = memo(
  (props: {
    text: string;
    typingDurationSeconds: number;
    className?: string;
  }) => {
    const { text, typingDurationSeconds, className } = props;

    const [displayedText, setDisplayedText] = useState("");

    useEffect(() => {
      const speed = (1000 * typingDurationSeconds) / text.length;
      setDisplayedText(""); // Reset text when input text changes

      const interval = setInterval(() => {
        setDisplayedText((current) => {
          if (current.length >= text.length) {
            clearInterval(interval);
            return current;
          }
          return current + text[current.length];
        });
      }, speed);

      return () => clearInterval(interval);
    }, [text, typingDurationSeconds]);

    return <div className={className}>{displayedText}</div>;
  }
);

