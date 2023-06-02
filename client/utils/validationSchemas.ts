import { z } from "zod";

export const campaignSchema = z.object({
  title: z
    .string({ required_error: "Title is required field" })
    .nonempty("Title is required field")
    .min(10, "Title must have at least 10 characters")
    .max(50, "Title can not have more than 50 characters"),

  description: z
    .string({ required_error: "Description is required field" })
    .min(20, "Description must have at least 20 characters")
    .max(200, "Description can not have more than 200 characters"),

  image: z
    .string({ required_error: "Image url is required field" })
    .nonempty("You must provide image url")
    .url("Provide correct image url"),

  deadline: z.number().nonnegative(),
});
