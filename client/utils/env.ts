import { z } from "zod";

export const privateEvnSchema = z.object({
  MORALIS_API_KEY: z.string().nonempty(),
});

/**
 * @type {{ [k in keyof z.infer<typeof clientSchema>]: z.infer<typeof clientSchema>[k] | undefined }}
 */

export const ENV = privateEvnSchema.parse(process.env);
