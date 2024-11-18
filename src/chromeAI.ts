export type ChromeSession = {
  prompt: (prompt: string) => Promise<string>;
  promptStreaming: (prompt: string) => ReadableStream<string>;
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
  createSession: async (systemPrompt: string): Promise<ChromeSession> => {
    const model = await window.ai.languageModel.create({
      systemPrompt,
    });

    return {
      prompt: (prompt: string) => model.prompt(prompt),
      promptStreaming: (prompt: string) => model.promptStreaming(prompt),
    };
  },
};
