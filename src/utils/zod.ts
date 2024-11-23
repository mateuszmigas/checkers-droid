import { z } from "zod";

export const coerceToNumber = z
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

export const coerceToEnum = <T extends readonly [string, ...string[]]>(
  values: T
) =>
  z
    .string()
    .transform((value) => value.toLowerCase())
    .pipe(z.enum(values));

