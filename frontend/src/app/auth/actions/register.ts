"use server";

import { api } from "@/lib/axios";
import { RegisterAuthInput, registerAuthSchema } from "@/validators/auth.schema";
import { AxiosError } from "axios";

export async function registerUser(dataRegister: RegisterAuthInput) {
  const parsed = registerAuthSchema.safeParse(dataRegister);

  if (!parsed.success) {
    return {
      errors: parsed.error.issues.map((issue) => ({ path: issue.path, message: issue.message })),
    };
  }

  const { email, password, name } = parsed.data;

  try {
    await api.post("/auth/register", { email, password, name });
    return { success: true };
  } catch (error) {
    console.error("Registration failed:", error);
    if ((error as AxiosError).isAxiosError) {
      const axiosError = error as AxiosError;
      const message =
        typeof axiosError.response?.data === "object" &&
        "message" in (axiosError.response?.data ?? {})
          ? (axiosError.response?.data as { message?: string }).message || "Erro desconhecido"
          : "Erro desconhecido";
      return { errors: [{ message }] };
    }
  }

  return { success: false };
}
