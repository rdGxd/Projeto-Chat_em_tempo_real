"use client";

import { connectSocket } from "@/lib/socket";
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
  const socket = connectSocket();

  useEffect(() => {
    const fetchMessages = async () => {
      const takeMessages: RoomData = await getMessageForRoom(id);
      if (!takeMessages) return;
      setMessages(takeMessages.messages);
    };

    fetchMessages();

    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    socket.emit("sendMessage", { content: "algo", room: id });
  };

  const joinRoom = () => {
    socket.emit("joinRoom", id);
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
        <button onClick={joinRoom} className="bg-blue-500 text-white px-4 rounded-r">
          Enviar
        </button>
      </div>
    </div>
  );
}
