"use server";

import { apiWithAuthentication } from "@/lib/axios";
import { CreateRoomInput, CreateRoomSchema } from "@/validators/room.schema";
import { AxiosError } from "axios";
import { cookies } from "next/headers";

export const createRoom = async (data: CreateRoomInput) => {
  const parsed = CreateRoomSchema.safeParse(data);
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return { errors: [{ message: "User is not authenticated" }] };
  }

  if (!parsed.success) {
    return {
      errors: parsed.error.issues.map((issue) => ({ path: issue.path, message: issue.message })),
    };
  }

  const { roomName } = parsed.data;

  try {
    const response = await apiWithAuthentication(token).post("/room", {
      name: roomName,
    });
    console.log(response.data);

    return {
      room: response.data,
    };
  } catch (error) {
    console.error("Login failed:", error);
    if ((error as AxiosError).isAxiosError) {
      const axiosError = error as AxiosError;
      console.log(axiosError.response);
      const message =
        typeof axiosError.response?.data === "object" &&
        "message" in (axiosError.response?.data ?? {})
          ? (axiosError.response?.data as { message?: string }).message || "Erro desconhecido"
          : "Erro desconhecido";
      return { errors: [{ message }] };
    }
  }

  return { success: false };
};
