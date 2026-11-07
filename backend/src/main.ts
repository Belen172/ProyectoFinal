import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express'; // <--- 1. Importar esto
import { join } from 'path'; // <--- 2. Importar esto

async function bootstrap() {
  // 3. Tipamos la aplicación con NestExpressApplication
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Habilita CORS para que el frontend pueda comunicarse con el backend
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'https://proyecto-bike.vercel.app',
      'https://proyectobike.com.ar',
      'https://www.proyectobike.com.ar',
    ], 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 4. CONFIGURACIÓN PARA SERVIR LA CARPETA UPLOADS PÚBLICAMENTE
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Filtra los datos que no estén definidos en el DTO
      forbidNonWhitelisted: true, // Tira error si mandan un dato que no corresponde
      transform: true, // Convierte automáticamente string a número/booleano según el DTO
    })
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();