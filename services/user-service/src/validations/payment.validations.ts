import { z } from "zod";

export const paymentSchema = z.object({
  card_number: z
    .string()
    .regex(/^\d{13,19}$/, "Card number must be 13-19 digits long."),
  expiry_date: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Expiry date must be in MM/YY format."),
  cardholder_name: z
    .string()
    .min(1, "Cardholder name must not be empty.")
    .max(100, "Cardholder name must be less than 100 characters."),
});
