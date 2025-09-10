"use client";

import { Button } from "@/components/ui/button";
import { connectSocket } from "@/lib/socket";
import { RoomData, TMessageSchema } from "@/validators/room.schema";
import React, { useEffect, useRef, useState } from "react";

interface SlugIdChatPageProps {
  readonly params: Promise<{
    readonly id: string;
  }>;
}
interface User {
  _id: string;
  name: string;
  email: string;
}

export default function SlugIdChatPage({ params }: SlugIdChatPageProps) {
  const { id } = React.use(params);
  const [messages, setMessages] = useState<TMessageSchema[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [input, setInput] = useState("");
  const socketRef = useRef(connectSocket());
  const socket = socketRef.current;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socket.emit("joinRoom", id);
    socket.emit("usersInRoom", id);
    socket.emit("getMessages", id);

    const handleUsers = (users: User[]) => setUsers(users);
    const handleMessages = (msgs: RoomData) => setMessages(msgs.messages);

    const handleNewMessage = (msg: TMessageSchema) => setMessages((prev) => [...prev, msg]);

    socket.on("usersInRoom", handleUsers);
    socket.on("messagesInRoom", handleMessages);
    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.emit("leaveRoom", id);
      socket.off("usersInRoom", handleUsers);
      socket.off("messagesInRoom", handleMessages);
      socket.off("newMessage", handleNewMessage);
    };
  }, [id, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (input: string) => {
    socket.emit("sendMessage", { room: String(id), content: input });
    setInput("");
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const tempMessage: TMessageSchema = {
      _id: crypto.randomUUID(),
      content: input,
      room: id,
      author: "me",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      __v: 0,
    };

    setMessages((prev) => [...prev, tempMessage]);

    sendMessage(input);
    setInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };
  return (
    <div className="flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-4">💬 Chat</h1>
      <div className="flex justify-between w-full max-w-4xl mb-4">
        <div className="grid grid-cols-1 gap-4 mr-4 border p-4 h-96 overflow-y-auto w-full text-center">
          <div className="text-lg font-bold">Pessoas conectadas a sala:</div>
          {users.map((user) => (
            <div key={user._id}>
              <p className="text-sm mb-1 text-green-300">{user.name}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-col w-full max-w-md">
          <div className="h-96 w-96 overflow-y-auto border p-4 mb-4">
            {messages.map((msg) => (
              <div key={msg._id}>
                <p className="text-sm mb-1">{msg.content}</p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1 border p-2 rounded-l w-1/2"
              placeholder="Digite sua mensagem..."
            />
            <Button
              onClick={handleSend}
              className="bg-blue-500 text-white px-4 rounded-r cursor-pointer hover:bg-blue-600 w-1/3"
            >
              Enviar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
