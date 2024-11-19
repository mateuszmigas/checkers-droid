import { PromiseQueue } from "./utils/promise";

export type ChromeSession = {
  prompt: (prompt: string) => Promise<string>;
  promptStreaming: (prompt: string) => ReadableStream<string>;
  destroy: () => void;
};

const promiseQueue = new PromiseQueue();

export const chromeApi = {
  isAvailable: async () => {
    try {
      const capabilities = await window.ai.languageModel.capabilities();
      return capabilities.available === "readily";
    } catch {
      return false;
    }
  },
  createSession: async (systemPrompt: string): Promise<ChromeSession> => {
    const languageModel = await window.ai.languageModel.create({
      systemPrompt,
    });

    return {
      prompt: (prompt: string) =>
        promiseQueue.push(() => languageModel.prompt(prompt)),
      promptStreaming: (prompt: string) =>
        languageModel.promptStreaming(prompt),
      destroy: () => languageModel.destroy(),
    };
  },
};

