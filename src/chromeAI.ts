import { PromiseQueue } from "./utils/promise";

export type ChromeAiSession = {
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
  createSession: async (systemPrompt: string): Promise<ChromeAiSession> => {
    const languageModel = await window.ai.languageModel.create({
      systemPrompt,
    });

    const session = {
      prompt: async (prompt: string) => {
        console.log("🤖 Prompt:", prompt);
        const startTime = performance.now();
        const promise = await promiseQueue.push(() =>
          languageModel.prompt(prompt)
        );
        const endTime = performance.now();
        const duration = endTime - startTime;
        console.log(`⏱️ Prompt duration: ${duration.toFixed(2)}ms`);
        const response = await promise;
        console.log("🤖 Response:", response);
        return response;
      },
      promptStreaming: (prompt: string) =>
        languageModel.promptStreaming(prompt),
      destroy: () => languageModel.destroy(),
    };

    return session;
  },
};

