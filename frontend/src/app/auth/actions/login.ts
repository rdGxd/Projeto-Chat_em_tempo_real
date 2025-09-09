"use server";

import { api } from "@/lib/axios";
import { LoginAuthInput, loginAuthSchema } from "@/validators/auth.schema";
import { AxiosError } from "axios";
import { cookies } from "next/headers";
import Cookies from "js-cookie";

export async function loginUser(dataLogin: LoginAuthInput) {
  const parsed = loginAuthSchema.safeParse(dataLogin);
  const cookieStore = await cookies();

  if (!parsed.success) {
    return {
      errors: parsed.error.issues.map((issue) => ({ path: issue.path, message: issue.message })),
    };
  }

  const { email, password } = parsed.data;

  try {
    const response = await api.post("/auth/login", { email, password });

    cookieStore.set("accessToken", response.data.accessToken, {
      // httpOnly: true,
      // secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: response.data.expiresIn,
    });

    Cookies.set("refreshToken", response.data.refreshToken, {
      // httpOnly: true,
      // secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: response.data.refreshTokenExpiresIn,
    });
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
}
