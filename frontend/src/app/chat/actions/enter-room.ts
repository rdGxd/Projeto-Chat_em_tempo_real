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
    const result = await apiWithAuthentication(token).post("");
    console.log(result.data);
  } catch (error) {
    console.error(error);
  }
  return { success: false };
  // Proceed with entering the room
};
