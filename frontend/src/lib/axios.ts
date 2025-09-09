import axios from "axios";
import { cookies } from "next/headers";

const getToken = async () => {
  const cookieStore = await cookies();
  return cookieStore.get("accessToken")?.value;
};

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const apiWithAuthentication = (token: string) => {
  return axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  });
};
