import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('API Chat em tempo real')
    .setDescription(
      'API para um sistema de chat em tempo real com autenticação JWT, gerenciamento de usuários, salas e mensagens',
    )
    .setVersion('1.0')
    .addTag('auth', 'Operações de autenticação e autorização')
    .addTag('user', 'Gerenciamento de usuários')
    .addTag('room', 'Gerenciamento de salas de chat')
    .addTag('message', 'Gerenciamento de mensagens')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, documentFactory());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.listen(Number(process.env.APP_PORT ?? 3001));
}
void bootstrap();
