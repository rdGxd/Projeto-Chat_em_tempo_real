"use server";

import { apiWithAuthentication } from "@/lib/axios";
import { JoinRoomInput, JoinRoomSchema } from "@/validators/room.schema";
import { cookies } from "next/headers";

export const enterRoom = async (data: JoinRoomInput) => {
  const parsed = JoinRoomSchema.safeParse(data);
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return { errors: [{ message: "User is not authenticated." }] };
  }

  if (!parsed.success) {
    return {
      errors: parsed.error.issues.map((issue) => ({ path: issue.path, message: issue.message })),
    };
  }

  try {
    const result = await apiWithAuthentication(token).post(`room/join/${data.roomId}`);
    if (result.status !== 200) {
      return { errors: [{ message: "Failed to enter the room." }] };
    }
    return { success: true };
  } catch (error) {
    console.error(error);
  }
  return { success: false };
};
