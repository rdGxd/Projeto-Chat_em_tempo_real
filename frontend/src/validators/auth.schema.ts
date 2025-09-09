import { z } from "zod";

export const registerAuthSchema = z.object({
  email: z.email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be between 6 and 100 characters long" })
    .max(100, { message: "Password must be between 6 and 100 characters long" }),
  name: z
    .string()
    .min(2, { message: "Name must be between 2 and 100 characters long" })
    .max(100, { message: "Name must be between 2 and 100 characters long" }),
});

export const loginAuthSchema = registerAuthSchema.omit({ name: true });

export type RegisterAuthInput = z.infer<typeof registerAuthSchema>;
export type LoginAuthInput = z.infer<typeof loginAuthSchema>;
