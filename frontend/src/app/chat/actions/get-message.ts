"use server";

import { apiWithAuthentication } from "@/lib/axios";
import { AxiosError } from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const getMessageForRoom = async (id: string) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    redirect("/auth");
  }

  try {
    const response = await apiWithAuthentication(token).get(`/room/${id}`);
    return response.data;
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

  return { success: true };
};
