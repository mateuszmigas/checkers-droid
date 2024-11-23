import { describe, it, expect } from "vitest";
import {
  createSection,
  createStructuredResponse,
  runWithStructuredOutput,
} from "./prompt";
import { z } from "zod";
import { ChromeAiSession } from "@/chromeAI";

describe("createSection", () => {
  it("should create a section with the given name and content", () => {
    const section = createSection("test", "content");
    expect(section).toBe(`<test>\ncontent\n</test>`);
  });
});

describe("createStructuredResponse", () => {
  it("should create a structured response from a schema", () => {
    const response = createStructuredResponse(
      z.object({
        name: z.string().describe("The name of the person"),
        age: z.number().describe("The age of the person"),
      })
    );
    console.log(response);
    expect(response).toBe(
      `<Response Format>
{
  "name": "The name of the person",
  "age": "The age of the person"
}
</Response Format>`
    );
  });

  it("should create a structured response from a schema with no description", () => {
    const response = createStructuredResponse(
      z.object({
        name: z.string(),
        age: z.number(),
      })
    );
    expect(response).toBe(`<Response Format>
{
  "name": "name",
  "age": "age"
}
</Response Format>`);
  });
});

describe("runWithStructuredOutput", () => {
  const createFakeSession = (result: string) =>
    ({ prompt: async () => result } as unknown as ChromeAiSession);

  it("should run with structured output", async () => {
    const fakeSession = createFakeSession('{"name": "Ted"}');
    const response = await runWithStructuredOutput(fakeSession, {
      prompt: "Hello",
      resultSchema: z.object({ name: z.string() }),
      defaultValue: { name: "John" },
    });

    expect(response.success).toBe(true);
    expect(response.data.name).toBe("Ted");
  });

  it("should return the default value if the response is invalid", async () => {
    const fakeSession = createFakeSession('{"age": 25}');
    const response = await runWithStructuredOutput(fakeSession, {
      prompt: "Hello",
      resultSchema: z.object({ name: z.string() }),
      defaultValue: { name: "John" },
    });

    expect(response.success).toBe(false);
    expect(response.data.name).toBe("John");
  });

  it("should return the default value if the response is empty", async () => {
    const fakeSession = createFakeSession("{}");
    const response = await runWithStructuredOutput(fakeSession, {
      prompt: "Hello",
      resultSchema: z.object({ name: z.string() }),
      defaultValue: { name: "John" },
    });

    expect(response.success).toBe(false);
    expect(response.data.name).toBe("John");
  });

  it("should return the default value if the response is not valid JSON", async () => {
    const fakeSession = createFakeSession("not valid JSON");
    const response = await runWithStructuredOutput(fakeSession, {
      prompt: "Hello",
      resultSchema: z.object({ name: z.string() }),
      defaultValue: { name: "John" },
    });

    expect(response.success).toBe(false);
    expect(response.data.name).toBe("John");
  });

  it("should clean the JSON response", async () => {
    const fakeSession = createFakeSession('```json\n{"name": "Ted"}```');
    const response = await runWithStructuredOutput(fakeSession, {
      prompt: "Hello",
      resultSchema: z.object({ name: z.string() }),
      defaultValue: { name: "John" },
    });

    expect(response.success).toBe(true);
    expect(response.data.name).toBe("Ted");
  });
});

