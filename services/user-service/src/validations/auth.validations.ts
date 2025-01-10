import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long."),
  email: z.string().email("Invalid email format."),
  password: z.string().min(6, "Password must be at least 6 characters long."),
  phone_number: z
    .string()
    .min(10, "Phone number must be at least 10 characters long.")
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format.")
    .optional(),
});

export const signinSchema = z.object({
  email: z.string().email("Invalid email format."),
  password: z.string().min(6, "Password must be at least 6 characters long."),
});
