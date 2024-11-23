import { z } from "zod";

export const stringToNumber = z
  .union([z.string(), z.number()])
  .transform((value) => {
    if (typeof value === "string") {
      const parsed = parseFloat(value);
      if (isNaN(parsed)) {
        throw new Error("Invalid value: cannot parse string to number");
      }
      return parsed;
    }
    return value;
  });

