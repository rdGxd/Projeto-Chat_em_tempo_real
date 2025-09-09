import Cookies from "js-cookie";
import { io, Socket } from "socket.io-client";
let socket: Socket;

export const connectSocket = () => {
  if (!socket) {
    const token = Cookies.get("accessToken");
    socket = io("http://localhost:3001", {
      auth: {
        token,
      },
      transports: ["websocket"],
    });
  }
  return socket;
};

export const getSocket = () => socket;
