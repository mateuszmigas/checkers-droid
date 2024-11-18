import { memo, useEffect, useState } from "react";
import { useIsMounted } from "../hooks/useIsMounted";
import { createTypingStream } from "@/utils/stream";

export const TypewriterEffect = memo(
  (props: { text: string | ReadableStream<string>; className?: string }) => {
    const { text, className } = props;
    const [displayedText, setDisplayedText] = useState("");
    const getIsMounted = useIsMounted();

    useEffect(() => {
      setDisplayedText("");
      const reader = createTypingStream(text).getReader();

      const typeText = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done || !getIsMounted()) break;
            setDisplayedText((current) => current + value);
          }
        } finally {
          reader.releaseLock();
        }
      };

      typeText();

      return () => {
        reader.cancel();
      };
    }, [text, getIsMounted]);

    return <div className={className}>{displayedText}</div>;
  }
);

