export const chromeApi = {
  isAvilable: async () => {
    try {
      const capabilities = await window.ai.languageModel.capabilities();
      return capabilities.available === "readily";
    } catch {
      return false;
    }
  },
  createSession: async (systemPrompt: string) => {
    return await window.ai.languageModel.create({
      systemPrompt,
    });
  },
  //sequential promises?
};

