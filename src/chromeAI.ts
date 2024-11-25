// import { PromiseQueue } from "./utils/promise";

export type ChromeAiManagedSession = {
  prompt: (prompt: string) => Promise<string>;
  promptStreaming: (prompt: string) => Promise<ReadableStream<string>>;
  destroy: () => void;
};

// const _promiseQueue = new PromiseQueue();

const useLogMiddleware = import.meta.env.mode === "development";

const logPrompt = (execute: (prompt: string) => Promise<string>) => {
  return async (prompt: string) => {
    console.log("🤖 Prompt:", prompt);
    const startTime = performance.now();
    const promise = await execute(prompt);
    const endTime = performance.now();
    const duration = endTime - startTime;
    console.log(`⏱️ Prompt duration: ${duration.toFixed(2)}ms`);
    const response = await promise;
    console.log("🤖 Response:", response);
    return response;
  };
};

const logStream = (
  execute: (prompt: string) => Promise<ReadableStream<string>>
) => {
  let buffer = "";
  return async (prompt: string) => {
    const stream = await execute(prompt);
    return stream.pipeThrough(
      new TransformStream({
        transform: (chunk, controller) => {
          console.log("🤖 Stream buffer:", chunk.slice(buffer.length));
          controller.enqueue(chunk);
          buffer = chunk;
        },
      })
    );
  };
};

export const chromeApi = {
  isAvailable: async () => {
    try {
      const capabilities = await window.ai.languageModel.capabilities();
      return capabilities.available === "readily";
    } catch {
      return false;
    }
  },

  createManagedSession: async (options: {
    systemPrompt: string;
    topK?: number;
    temperature?: number;
  }): Promise<ChromeAiManagedSession> => {
    const createModel = () => window.ai.languageModel.create(options);
    let languageModel = await createModel();

    const getModel = async () => {
      // recreate the model if it's low on tokens
      if (languageModel.tokensLeft < 1000) {
        languageModel.destroy();
        languageModel = await createModel();
      }

      return languageModel;
    };

    const prompt = async (prompt: string) => {
      const model = await getModel();
      return model.prompt(prompt);
    };
    const promptStreaming = async (prompt: string) => {
      const model = await getModel();
      return model.promptStreaming(prompt);
    };
    const destroy = () => languageModel.destroy();

    return {
      prompt: useLogMiddleware ? logPrompt(prompt) : prompt,
      promptStreaming: useLogMiddleware
        ? logStream(promptStreaming)
        : promptStreaming,
      destroy,
    };
  },
};
