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

export const stringToEnum = <T extends readonly [string, ...string[]]>(
  values: T
) =>
  z
    .string()
    .transform((value) => value.toLowerCase())
    .pipe(z.enum(values));
