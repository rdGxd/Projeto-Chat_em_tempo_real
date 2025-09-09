import z from "zod";
import { MessageSchema } from "./message.schema";

export const CreateRoomSchema = z.object({
  roomName: z.string().min(2).max(100).trim(),
});

export const JoinRoomSchema = z.object({
  roomId: z.uuid(),
});

export const RoomDataSchema = z.object({
  id: z.uuid(),
  name: z.string().min(2).max(100).trim(),
  users: z.array(
    z.object({
      id: z.uuid(),
      name: z.string().min(2).max(100).trim(),
      email: z.email().trim(),
    }),
  ),
  owner: {
    id: z.uuid(),
    name: z.string().min(2).max(100).trim(),
    email: z.email().trim(),
  },
  messages: z.array(MessageSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type CreateRoomInput = z.infer<typeof CreateRoomSchema>;
export type JoinRoomInput = z.infer<typeof JoinRoomSchema>;
export type RoomData = z.infer<typeof RoomDataSchema>;
