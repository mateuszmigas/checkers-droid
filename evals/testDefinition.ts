export type TestDefinition = {
  name: string;
  prompt: string;
  criteria: {
    type: "includes" | "notIncludes";
    value: string;
  }[];
};

