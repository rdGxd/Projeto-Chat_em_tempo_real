"use server";

import { apiWithAuthentication } from "@/lib/axios";
import { cookies } from "next/headers";

export const getMessageForRoom = async (id: string) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  if (!token) {
    throw new Error("Unauthorized");
  }
  const response = await apiWithAuthentication(token).get(`/room/${id}`);

  if (!response.data) {
    throw new Error("Failed to fetch messages");
  }
  return response.data;
};
