# Chat em Tempo Real - Backend

API backend para sistema de chat em tempo real utilizando NestJS, Socket.IO, MongoDB e JWT.

## Descrição

Esta API fornece funcionalidades completas para um sistema de chat em tempo real, incluindo:

- Autenticação e autorização com JWT
- Gerenciamento de usuários
- Criação e gerenciamento de salas de chat
- Envio e recebimento de mensagens em tempo real via WebSocket
- Documentação completa da API com Swagger

## Tecnologias Utilizadas

- **NestJS** - Framework Node.js
- **Socket.IO** - WebSocket para comunicação em tempo real
- **MongoDB com Mongoose** - Banco de dados NoSQL
- **JWT** - Autenticação e autorização
- **Swagger** - Documentação da API
- **TypeScript** - Linguagem de programação
- **Class Validator** - Validação de dados

## Project setup

```bash
$ pnpm install
```

## Pré-requisitos

- Node.js (versão 16 ou superior)
- PNPM
- MongoDB (local ou na nuvem)

## Configuração

1. Clone o repositório
2. Instale as dependências:

```bash
pnpm install
```

3. Configure as variáveis de ambiente (crie um arquivo `.env`):

```env
APP_PORT=3001
MONGO_URI=mongodb://localhost:27017/chat-realtime
JWT_SECRET=seu-jwt-secret-aqui
JWT_EXPIRES_IN=3600
JWT_REFRESH_SECRET=seu-refresh-secret-aqui
JWT_REFRESH_EXPIRES_IN=604800
```

## Executando o Projeto

```bash
# desenvolvimento
pnpm run start

# modo watch (desenvolvimento com hot reload)
pnpm run start:dev

# produção
pnpm run start:prod
```

## Documentação da API

### Swagger UI

Após iniciar o servidor, acesse a documentação interativa da API:

- **URL:** http://localhost:3001/api
- **Descrição:** Interface completa com todos os endpoints, modelos de dados e possibilidade de testar as APIs

### WebSocket Documentation

Para documentação dos eventos WebSocket, consulte o arquivo:

- [`WEBSOCKET_DOCUMENTATION.md`](./WEBSOCKET_DOCUMENTATION.md)

## Endpoints Principais

### Autenticação (`/auth`)

- `POST /auth/login` - Login do usuário
- `POST /auth/register` - Registro de novo usuário
- `GET /auth/profile` - Obter perfil do usuário autenticado
- `POST /auth/refresh` - Renovar tokens

### Usuários (`/user`)

- `GET /user` - Listar todos os usuários
- `GET /user/:id` - Buscar usuário por ID
- `PATCH /user/:id` - Atualizar usuário
- `PATCH /user/:id/password` - Atualizar senha
- `DELETE /user/:id` - Deletar usuário

### Salas (`/room`)

- `POST /room` - Criar sala
- `GET /room` - Listar salas (público)
- `GET /room/:id` - Buscar sala por ID (público)
- `DELETE /room/:id` - Deletar sala
- `POST /room/join/:id` - Entrar na sala
- `POST /room/leave/:id` - Sair da sala

### Mensagens (`/message`)

- `POST /message` - Criar mensagem
- `GET /message` - Listar mensagens do usuário
- `GET /message/:id` - Buscar mensagem por ID
- `PATCH /message/:id` - Atualizar mensagem
- `DELETE /message/:id` - Deletar mensagem

## WebSocket Events

### Cliente para Servidor

- `joinRoom` - Entrar em sala
- `leaveRoom` - Sair da sala
- `sendMessage` - Enviar mensagem
- `usersInRoom` - Listar usuários na sala
- `getMessages` - Obter mensagens da sala

### Servidor para Cliente

- `joinedRoom` - Confirmação de entrada na sala
- `leftRoom` - Confirmação de saída da sala
- `newMessage` - Nova mensagem recebida
- `usersInRoom` - Lista de usuários na sala
- `messagesInRoom` - Histórico de mensagens

## Testes

```bash
# testes unitários
pnpm run test

# testes e2e
pnpm run test:e2e

# cobertura de testes
pnpm run test:cov
```

## Estrutura do Projeto

```
src/
├── auth/              # Módulo de autenticação
│   ├── controllers/   # Controllers
│   ├── services/      # Services
│   ├── dto/          # Data Transfer Objects
│   ├── guards/       # Guards de autenticação
│   └── decorators/   # Decorators customizados
├── user/             # Módulo de usuários
├── room/             # Módulo de salas
├── message/          # Módulo de mensagens
├── chat/             # Gateway WebSocket
└── common/           # Utilitários compartilhados
```

## Funcionalidades

- ✅ Autenticação JWT com refresh tokens
- ✅ CRUD completo de usuários, salas e mensagens
- ✅ Chat em tempo real via WebSocket
- ✅ Documentação Swagger completa
- ✅ Validação de dados com class-validator
- ✅ Guards de autorização
- ✅ Criptografia de senhas com bcrypt
- ✅ CORS configurado
- ✅ Testes unitários e e2e

## Segurança

- Autenticação JWT obrigatória (exceto endpoints públicos)
- Validação rigorosa de entrada de dados
- Criptografia de senhas com bcrypt
- Guards de autorização para proteger recursos
- CORS configurado adequadamente

## Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request
