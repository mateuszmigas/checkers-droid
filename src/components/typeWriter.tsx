import { memo, useEffect, useState } from "react";
import { useIsMounted } from "../hooks/useIsMounted";

const TYPE_SPEED = 25;

export const Typewriter = memo(
  (props: { text: string | ReadableStream<string>; className?: string }) => {
    const { text, className } = props;
    const [displayedText, setDisplayedText] = useState("");
    const [fullText, setFullText] = useState("");
    const getIsMounted = useIsMounted();

    useEffect(() => {
      if (typeof text === "string") {
        setFullText(text);
      } else {
        const reader = text.getReader();

        async function readStream() {
          try {
            while (getIsMounted()) {
              const { done, value } = await reader.read();
              if (done) break;
              setFullText(value);
            }
          } finally {
            reader.releaseLock();
          }
        }

        readStream();

        return () => {
          reader.cancel();
        };
      }
    }, [text, getIsMounted]);

    useEffect(() => {
      const interval = setInterval(() => {
        if (!getIsMounted()) {
          clearInterval(interval);
          return;
        }

        setDisplayedText((current) => {
          if (current.length >= fullText.length) {
            clearInterval(interval);
            return current;
          }
          return current + fullText[current.length];
        });
      }, TYPE_SPEED);

      return () => clearInterval(interval);
    }, [fullText, getIsMounted]);

    return <div className={className}>{displayedText}</div>;
  }
);

