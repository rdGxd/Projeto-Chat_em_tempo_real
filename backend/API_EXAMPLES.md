# Exemplos de Uso da API

Este documento contém exemplos práticos de como usar a API do Chat em Tempo Real.

## Autenticação

### 1. Registro de Usuário

```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@example.com",
    "password": "minhasenha123"
  }'
```

**Resposta:**

```json
{
  "id": "64a7b2f5e1b2c3d4e5f6a7b8",
  "name": "João Silva",
  "email": "joao@example.com",
  "status": "active",
  "roles": ["user"],
  "createdAt": "2023-07-01T12:34:56.789Z",
  "updatedAt": "2023-07-01T12:34:56.789Z"
}
```

### 2. Login

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "password": "minhasenha123"
  }'
```

**Resposta:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600,
  "refreshTokenExpiresIn": 604800
}
```

### 3. Obter Perfil

```bash
curl -X GET http://localhost:3001/auth/profile \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

## Gerenciamento de Salas

### 1. Criar Sala

```bash
curl -X POST http://localhost:3001/room \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN" \
  -d '{
    "name": "Sala de Desenvolvimento"
  }'
```

### 2. Listar Salas

```bash
curl -X GET http://localhost:3001/room
```

### 3. Entrar em uma Sala

```bash
curl -X POST http://localhost:3001/room/join/ROOM_ID \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

### 4. Sair de uma Sala

```bash
curl -X POST http://localhost:3001/room/leave/ROOM_ID \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

## Gerenciamento de Mensagens

### 1. Enviar Mensagem

```bash
curl -X POST http://localhost:3001/message \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN" \
  -d '{
    "content": "Olá, pessoal! Como vocês estão?",
    "room": "ROOM_ID"
  }'
```

### 2. Listar Mensagens do Usuário

```bash
curl -X GET http://localhost:3001/message \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

### 3. Atualizar Mensagem

```bash
curl -X PATCH http://localhost:3001/message/MESSAGE_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN" \
  -d '{
    "content": "Mensagem atualizada!"
  }'
```

## Gerenciamento de Usuários

### 1. Listar Usuários

```bash
curl -X GET http://localhost:3001/user \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

### 2. Atualizar Perfil

```bash
curl -X PATCH http://localhost:3001/user/USER_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN" \
  -d '{
    "name": "João Silva Santos"
  }'
```

### 3. Alterar Senha

```bash
curl -X PATCH http://localhost:3001/user/USER_ID/password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN" \
  -d '{
    "oldPassword": "senhaantiga123",
    "newPassword": "novasenh@456"
  }'
```

## Exemplo com JavaScript/Fetch

```javascript
class ChatAPI {
  constructor(baseURL = 'http://localhost:3001') {
    this.baseURL = baseURL;
    this.accessToken = null;
  }

  async login(email, password) {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    this.accessToken = data.accessToken;
    return data;
  }

  async createRoom(name) {
    const response = await fetch(`${this.baseURL}/room`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: JSON.stringify({ name }),
    });

    return response.json();
  }

  async sendMessage(content, roomId) {
    const response = await fetch(`${this.baseURL}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: JSON.stringify({ content, room: roomId }),
    });

    return response.json();
  }

  async joinRoom(roomId) {
    const response = await fetch(`${this.baseURL}/room/join/${roomId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    return response.json();
  }
}

// Exemplo de uso
const api = new ChatAPI();

async function exemplo() {
  // 1. Fazer login
  const tokens = await api.login('joao@example.com', 'minhasenha123');

  // 2. Criar uma sala
  const room = await api.createRoom('Minha Sala de Chat');

  // 3. Entrar na sala
  await api.joinRoom(room.id);

  // 4. Enviar uma mensagem
  const message = await api.sendMessage('Olá pessoal!', room.id);
}
```

## Exemplo com Socket.IO (Cliente)

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Chat em Tempo Real</title>
    <script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
  </head>
  <body>
    <div id="messages"></div>
    <input type="text" id="messageInput" placeholder="Digite sua mensagem..." />
    <button onclick="sendMessage()">Enviar</button>

    <script>
      // Conectar ao servidor com autenticação
      const socket = io('http://localhost:3001', {
        auth: {
          token: 'SEU_ACCESS_TOKEN_AQUI',
        },
      });

      const roomId = 'ROOM_ID_AQUI';

      // Entrar na sala
      socket.emit('joinRoom', roomId);

      // Escutar confirmação de entrada na sala
      socket.on('joinedRoom', (data) => {
        console.log('Entrou na sala:', data.roomId);
      });

      // Escutar novas mensagens
      socket.on('newMessage', (message) => {
        const messagesDiv = document.getElementById('messages');
        const messageElement = document.createElement('div');
        messageElement.textContent = `${message.userId}: ${message.content}`;
        messagesDiv.appendChild(messageElement);
      });

      // Escutar lista de usuários na sala
      socket.on('usersInRoom', (users) => {
        console.log('Usuários na sala:', users);
      });

      // Função para enviar mensagem
      function sendMessage() {
        const input = document.getElementById('messageInput');
        const content = input.value.trim();

        if (content) {
          socket.emit('sendMessage', {
            content: content,
            room: roomId,
          });
          input.value = '';
        }
      }

      // Enviar mensagem ao pressionar Enter
      document
        .getElementById('messageInput')
        .addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            sendMessage();
          }
        });

      // Solicitar histórico de mensagens
      socket.emit('getMessages', roomId);

      // Escutar histórico de mensagens
      socket.on('messagesInRoom', (messages) => {
        const messagesDiv = document.getElementById('messages');
        messagesDiv.innerHTML = ''; // Limpar mensagens existentes

        messages.forEach((message) => {
          const messageElement = document.createElement('div');
          messageElement.textContent = `${message.author?.name || 'Usuário'}: ${message.content}`;
          messagesDiv.appendChild(messageElement);
        });
      });
    </script>
  </body>
</html>
```

## Códigos de Status HTTP

| Código | Descrição                                        |
| ------ | ------------------------------------------------ |
| 200    | OK - Sucesso                                     |
| 201    | Created - Recurso criado com sucesso             |
| 400    | Bad Request - Dados de entrada inválidos         |
| 401    | Unauthorized - Token não fornecido ou inválido   |
| 403    | Forbidden - Sem permissão para acessar o recurso |
| 404    | Not Found - Recurso não encontrado               |
| 500    | Internal Server Error - Erro interno do servidor |

## Dicas de Uso

1. **Sempre inclua o Bearer token** nos headers para endpoints que requerem autenticação
2. **Use refresh tokens** para renovar access tokens expirados
3. **Valide sempre os dados** antes de enviar para a API
4. **Gerencie conexões WebSocket** adequadamente para evitar vazamentos de memória
5. **Implemente tratamento de erros** robusto em sua aplicação cliente
