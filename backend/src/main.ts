import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilita CORS para que el frontend pueda comunicarse con el backend
  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Filtra los datos que no estén definidos en el DTO
      forbidNonWhitelisted: true, // Tira error si mandan un dato que no corresponde
    })
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
