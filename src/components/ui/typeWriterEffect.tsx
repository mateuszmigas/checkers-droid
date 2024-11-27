import { memo, useEffect, useState } from "react";
import { useIsMounted } from "@/components/ui/hooks/useIsMounted";
import { createTypingStream } from "@/utils/stream";

export const TypewriterEffect = memo(
  (props: { text: string | ReadableStream<string>; className?: string }) => {
    const { text, className } = props;
    const [displayedText, setDisplayedText] = useState("");
    const getIsMounted = useIsMounted();

    useEffect(() => {
      const abortController = new AbortController();
      const reader = createTypingStream(text, abortController).getReader();
      setDisplayedText("");

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
        return abortController.abort();
      };
    }, [text, getIsMounted]);

    return (
      <div className={className}>
        {displayedText.length > 0 ? displayedText : "..."}
      </div>
    );
  }
);

