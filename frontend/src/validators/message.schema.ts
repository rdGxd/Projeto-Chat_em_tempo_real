import z from "zod";

export const MessageSchema = z.object({
  id: z.uuid(),
  content: z.string().min(1).max(500).trim(),
  author: {
    id: z.uuid(),
    name: z.string().min(2).max(100).trim(),
    email: z.email().trim(),
  },
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type MessageTypes = z.infer<typeof MessageSchema>;
