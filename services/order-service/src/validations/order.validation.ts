import { z } from "zod";

export const OrderSchema = z.object({
  item: z.string().min(1, "Item cannot be empty"),
  amount: z.number().min(0, "Amount must be a positive number"),
});
