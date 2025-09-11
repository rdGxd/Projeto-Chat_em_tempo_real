"use client";

import { enterRoom } from "@/app/chat/actions/enter-room";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { JoinRoomInput } from "@/validators/room.schema";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

export function EnterRoomForm() {
  const { register, handleSubmit } = useForm<JoinRoomInput>();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const onSubmit = (data: JoinRoomInput) => {
    startTransition(async () => {
      try {
        const result = await enterRoom(data);
        if (result.errors) {
          result.errors.forEach((error) => toast.error(error.message));
          return;
        }
        toast.success("Successfully entered the room!");
        router.push(`/chat/${data.roomId}`);
      } catch {
        toast.error("An error occurred while entering the room.");
      }
    });
  };

  return (
    <div className={cn("flex flex-col gap-6")}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Enter in a Room</CardTitle>
          <CardDescription>Enter the room ID to join</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-6">
              <div className="grid gap-6">
                <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t"></div>
                <div className="grid gap-3">
                  <Label htmlFor="nameOfRoom" className="justify-center">
                    ID of room you want to enter
                  </Label>
                  <Input
                    id="nameOfRoom"
                    type="text"
                    placeholder="Digite o ID da sala"
                    required
                    {...register("roomId")}
                    disabled={isPending}
                  />
                </div>

                <Button type="submit" className="w-full cursor-pointer" disabled={isPending}>
                  Enter for the room
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
