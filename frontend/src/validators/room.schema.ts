import z from "zod";

export const MessageSchema = z.object({
  _id: z.string(),
  content: z.string(),
  author: z.string(),
  room: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  __v: z.number(),
});

export const CreateRoomSchema = z.object({
  roomName: z.string().min(2).max(100).trim(),
});

export const JoinRoomSchema = z.object({
  roomId: z.string(),
});

export const RoomDataSchema = z.object({
  id: z.uuid(),
  name: z.string().min(2).max(100).trim(),
  users: z.array(
    z.object({
      messages: z.array(MessageSchema),
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
export type TMessageSchema = z.infer<typeof MessageSchema>;
