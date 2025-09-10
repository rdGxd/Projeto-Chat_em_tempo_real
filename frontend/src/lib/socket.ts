import Cookies from "js-cookie";
import { io, Socket } from "socket.io-client";

let socket: Socket;

export const connectSocket = () => {
  const token = Cookies.get("accessToken");

  if (!socket || socket.disconnected) {
    socket = io("http://localhost:3001", {
      auth: {
        token,
      },
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000,
    });

    socket.on("connect", () => {
      console.log("Conectado ao servidor Socket.IO", socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("Desconectado do servidor Socket.IO:", reason);
    });

    socket.on("connect_error", (error) => {
      console.error("Erro de conexão Socket.IO:", error);
    });
  }

  return socket;
};
export const getSocket = () => socket;
