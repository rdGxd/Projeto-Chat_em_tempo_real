"use client";

import { connectSocket, getSocket } from "@/lib/socket";
import { MessageTypes } from "@/validators/message.schema";
import { RoomData } from "@/validators/room.schema";
import React, { useEffect, useState } from "react";
import { getMessageForRoom } from "../actions/get-message";

interface SlugIdChatPageProps {
  readonly params: Promise<{
    readonly id: string;
  }>;
}

export default function SlugIdChatPage({ params }: SlugIdChatPageProps) {
  const { id } = React.use(params);
  const [messages, setMessages] = useState<MessageTypes[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const fetchMessages = async () => {
      const takeMessages: RoomData = await getMessageForRoom(id);
      setMessages(takeMessages.messages);
    };

    fetchMessages();
    const socket = connectSocket();

    socket.on("connect", () => {
      console.log("✅ Conectado ao servidor:", socket.id);
    });

    socket.on("send_message", (msg: string) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("receive_message", (msg: string) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("disconnect", () => {
      console.log("❌ Desconectado do servidor");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    const socket = getSocket();
    if (socket && input.trim() !== "") {
      socket.emit("send_message", input);
      setInput("");
    }
  };

  return (
    <div className="flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-4">💬 Chat</h1>

      <div className="w-full max-w-md border rounded p-4 mb-4 h-64 overflow-y-auto">
        {messages.map((msg) => (
          <div key={msg.id}>
            <p className="text-sm mb-1">{msg.content}</p>
          </div>
        ))}
      </div>

      <div className="flex w-full max-w-md">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border p-2 rounded-l"
          placeholder="Digite sua mensagem..."
        />
        <button onClick={sendMessage} className="bg-blue-500 text-white px-4 rounded-r">
          Enviar
        </button>
      </div>
    </div>
  );
}
