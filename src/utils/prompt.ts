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
  } catch {
    return { success: false, data: defaultValue };
  }
};

export const createSection = (sectionName: string, content: string) => {
  return `<${sectionName}>
${content}
</${sectionName}>`;
};

export const createStructuredResponse = (schema: z.ZodType) => {
  if (schema instanceof z.ZodObject) {
    const shape = schema._def.shape();
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(shape)) {
      const zodValue = value as z.ZodType;
      if ("_def" in zodValue && zodValue._def.description) {
        result[key] = zodValue._def.description;
      } else {
        result[key] = key;
      }
    }
    return `<Response Format>
${JSON.stringify(result, null, 2)}
</Response Format>`;
  }
  throw new Error("Schema must be an object type");
};
