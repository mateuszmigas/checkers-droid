import { z } from "zod";
import { ChromeAiSession } from "@/chromeAI";

const cleanJSONString = (json: string) => json.replace(/```json|```/g, "");

type PromptRequest<T extends z.ZodType> = {
  prompt: string;
  resultSchema: T;
  defaultValue: z.infer<T>;
  validator?: (result: z.infer<T>) => boolean | string;
};

export const runWithStructuredOutput = async <T extends z.ZodType>(
  session: ChromeAiSession,
  promptRequest: PromptRequest<T>
): Promise<{ success: boolean; data: z.infer<T> }> => {
  const { prompt, resultSchema, defaultValue, validator } = promptRequest;
  try {
    const result = await session.prompt(prompt);
    const parsed = JSON.parse(cleanJSONString(result));
    const validated = resultSchema.safeParse(parsed);

    if (validated.success && (!validator || validator(validated.data))) {
      return {
        success: true,
        data: { ...defaultValue, ...validated.data },
      };
    }

    return { success: false, data: defaultValue };
  } catch (e) {
    return { success: false, data: defaultValue };
  }
};

