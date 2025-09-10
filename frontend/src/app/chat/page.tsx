"use client";

import { CreateRoomForm } from "@/components/chat-forms/create-room";
import { EnterRoomForm } from "@/components/chat-forms/enter-room";
import { ModeToggle } from "@/components/mode-toggle";
import { GetRooms } from "@/components/rooms";
import { RoomData } from "@/validators/room.schema";
import { useEffect, useState } from "react";
import { getRooms } from "./actions/get-rooms";

export default function ChatPage() {
  const [rooms, setRooms] = useState<RoomData[]>([]);

  useEffect(() => {
    const fetchRooms = async () => {
      const fetchChatRooms = await getRooms();
      setRooms(fetchChatRooms);
    };
    fetchRooms();
  }, []);

  return (
    <>
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
      <div className="flex justify-center pt-10 text-center">
        <h1 className="text-2xl">
          Crie sua <strong className="text-green-500">sala</strong> ou entre em uma{" "}
          <strong className="text-green-500">sala</strong> existente
        </h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto p-8 content-center min-h-screen ">
        <CreateRoomForm setRooms={setRooms} />
        <GetRooms data={rooms} />
        <EnterRoomForm />
      </div>
    </>
  );
}
