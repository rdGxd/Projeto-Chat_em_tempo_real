# WebSocket API Documentation

## Overview

Este documento descreve os eventos WebSocket disponíveis no Chat Gateway para comunicação em tempo real.

**Endpoint:** `ws://localhost:3001`

**Autenticação:** Requerida via JWT token (Bearer Token)

## Eventos do Cliente para o Servidor

### 1. joinRoom

**Descrição:** Usuário entra em uma sala de chat específica

**Payload:**

```typescript
string; // roomId
```

**Exemplo:**

```javascript
socket.emit('joinRoom', '64a7b2f5e1b2c3d4e5f6a7b8');
```

**Resposta:**

- `joinedRoom`: Confirmação de entrada na sala
- `usersInRoom`: Lista atualizada de usuários na sala

---

### 2. leaveRoom

**Descrição:** Usuário sai de uma sala de chat específica

**Payload:**

```typescript
string; // roomId
```

**Exemplo:**

```javascript
socket.emit('leaveRoom', '64a7b2f5e1b2c3d4e5f6a7b8');
```

**Resposta:**

- `leftRoom`: Confirmação de saída da sala
- `usersInRoom`: Lista atualizada de usuários na sala

---

### 3. sendMessage

**Descrição:** Envia uma nova mensagem para uma sala específica

**Payload:**

```typescript
{
  content: string;
  room: string;
}
```

**Exemplo:**

```javascript
socket.emit('sendMessage', {
  content: 'Olá, pessoal!',
  room: '64a7b2f5e1b2c3d4e5f6a7b8',
});
```

**Resposta:**

- `newMessage`: A mensagem é enviada para todos os usuários na sala

---

### 4. usersInRoom

**Descrição:** Solicita a lista de usuários conectados em uma sala específica

**Payload:**

```typescript
string; // roomId
```

**Exemplo:**

```javascript
socket.emit('usersInRoom', '64a7b2f5e1b2c3d4e5f6a7b8');
```

**Resposta:**

- `usersInRoom`: Lista de usuários na sala

---

### 5. getMessages

**Descrição:** Solicita o histórico de mensagens de uma sala específica

**Payload:**

```typescript
string; // roomId
```

**Exemplo:**

```javascript
socket.emit('getMessages', '64a7b2f5e1b2c3d4e5f6a7b8');
```

**Resposta:**

- `messagesInRoom`: Lista de mensagens da sala

---

## Eventos do Servidor para o Cliente

### 1. joinedRoom

**Descrição:** Confirmação de que o usuário entrou na sala com sucesso

**Payload:**

```typescript
{
  roomId: string;
}
```

---

### 2. leftRoom

**Descrição:** Confirmação de que o usuário saiu da sala com sucesso

**Payload:**

```typescript
{
  roomId: string;
}
```

---

### 3. newMessage

**Descrição:** Nova mensagem recebida na sala

**Payload:**

```typescript
{
  id: string;
  content: string;
  userId: string;
  roomId: string;
  createdAt: string;
  updatedAt: string;
}
```

---

### 4. usersInRoom

**Descrição:** Lista atualizada de usuários conectados na sala

**Payload:**

```typescript
Array<{
  id: string;
  name: string;
  email?: string;
}>;
```

---

### 5. messagesInRoom

**Descrição:** Histórico de mensagens da sala solicitada

**Payload:**

```typescript
Array<{
  id: string;
  content: string;
  author?: {
    id: string;
    name: string;
    email?: string;
  };
  createdAt: string;
  updatedAt: string;
}>;
```

---

### 6. messageSent

**Descrição:** Notificação geral de evento na sala

**Payload:**

```typescript
string; // Mensagem de notificação
```

## Exemplo de Uso com Socket.io Client

```javascript
import io from 'socket.io-client';

// Conectar com autenticação
const socket = io('http://localhost:3001', {
  auth: {
    token: 'seu_jwt_token_aqui',
  },
});

// Entrar em uma sala
socket.emit('joinRoom', 'room-id');

// Escutar novas mensagens
socket.on('newMessage', (message) => {
  console.log('Nova mensagem:', message);
});

// Enviar mensagem
socket.emit('sendMessage', {
  content: 'Olá!',
  room: 'room-id',
});

// Escutar lista de usuários
socket.on('usersInRoom', (users) => {
  console.log('Usuários na sala:', users);
});
```

## Códigos de Erro Comuns

- **401 Unauthorized:** Token JWT inválido ou ausente
- **403 Forbidden:** Usuário não tem permissão para acessar a sala
- **404 Not Found:** Sala não encontrada
- **400 Bad Request:** Dados de entrada inválidos
