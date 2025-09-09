export class UserDto {
  id: string;
  name: string;
  email?: string;
}

export class MessageDto {
  id: string;
  content: string;
  author?: UserDto;
  createdAt: string;
  updatedAt: string;
}

export class ResponseRoomDto {
  id: string;
  name: string;
  users: UserDto[];
  owner: UserDto;
  messages: MessageDto[];
  createdAt: string;
  updatedAt: string;
}
