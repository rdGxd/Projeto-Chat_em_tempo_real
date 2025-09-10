"use client";

import { createRoom } from "@/app/chat/actions/create-room";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { CreateRoomInput } from "@/validators/room.schema";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

interface CreateRoomFormProps {
  readonly setRooms?: React.Dispatch<React.SetStateAction<any[]>>;
}

export function CreateRoomForm({ setRooms }: CreateRoomFormProps) {
  const { register, handleSubmit } = useForm<CreateRoomInput>();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const onSubmit = (data: CreateRoomInput) => {
    startTransition(async () => {
      try {
        const result = await createRoom(data);

        if (result?.errors) {
          result.errors.forEach((error: { message: string }) => toast.error(error.message));
          return;
        }

        if (result?.room) {
          setRooms?.((prev) => [...prev, result.room]);
          toast.success("Room created successfully!");
          router.push("/chat");
        }
      } catch {
        toast.error("An error occurred while creating the room.");
      }
    });
  };

  return (
    <div className={cn("flex flex-col gap-6")}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create a new room</CardTitle>
          <CardDescription>Fill in the details below to create a new chat room</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-6">
              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t"></div>
              <div className="grid gap-6 text-center">
                <div className="grid gap-3">
                  <Label htmlFor="roomName" className="justify-center flex">
                    Name of room
                  </Label>
                  <Input
                    id="roomName"
                    type="text"
                    placeholder="Enter room name"
                    required
                    disabled={isPending}
                    {...register("roomName")}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isPending}>
                  Create Room
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
