import { z } from "zod";

const resultSchema = z.object({
  first: z.string(),
  last: z.string(),
});

export const createPromptRequest = (
  name: string,
  defaultValue: z.infer<typeof resultSchema>,
  validator?: (result: z.infer<typeof resultSchema>) => boolean | string
) => {
  const prompt = `
Split the name into first and last names.
<Response Format>
{
"first": "First name",
"last": "Last name"
}
</Response Format>
  ${name}
  `;

  return { prompt, resultSchema, defaultValue, validator };
};

