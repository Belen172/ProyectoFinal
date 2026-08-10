import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilita CORS para que el frontend pueda comunicarse con el backend
  app.enableCors({
    origin: ['http://localhost:5173', // Para cuando siga desarrollando en la PC
          'https://proyecto-bike.vercel.app', // La URL exacta del frontend, por si lo sigo usando de prueba a vercel
          'https://proyectobike.com.ar', // El dominio nuevo
          'https://www.proyectobike.com.ar', // La versión con www
    ], 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Filtra los datos que no estén definidos en el DTO
      forbidNonWhitelisted: true, // Tira error si mandan un dato que no corresponde
    })
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
