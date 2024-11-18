import { delay } from "./promise";

const TYPE_SPEED = 25;

export const createTypingStream = (
  input: string | ReadableStream<string>
): ReadableStream<string> => {
  return new ReadableStream({
    async start(controller) {
      if (typeof input === "string") {
        for (const char of input) {
          controller.enqueue(char);
          await delay(TYPE_SPEED);
        }
        controller.close();
        return;
      }

      const reader = input.getReader();
      try {
        let previousValue = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          for (const char of value.slice(previousValue.length)) {
            controller.enqueue(char);
            await delay(TYPE_SPEED);
          }
          previousValue = value;
        }
        controller.close();
      } finally {
        reader.releaseLock();
      }
    },
  });
};

