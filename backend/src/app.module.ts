import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BicicletasModule } from './bicicletas/bicicletas.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ServiciosModule } from './servicios/servicios.module';
import { AuthModule } from './auth/auth.module';
import { ScheduleModule } from '@nestjs/schedule';
import { MailerModule } from '@nestjs-modules/mailer';


@Module({
  imports: [
  ConfigModule.forRoot(),

  // INICIO EL TEMPORIZADOR
  ScheduleModule.forRoot(),

  // CONFIGURAMOS EL MÓDULO DE GMAIL
  MailerModule.forRoot({
    transport: {
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER, // Toma el correo de tu archivo .env
        pass: process.env.GMAIL_PASS, // Toma la contraseña de 16 letras de tu .env
      },
    },
    defaults: {
      from: `"PROYECTO bike" <${process.env.GMAIL_USER}>`, // Así aparece el remitente lindo en la bandeja
    },
  }),

  TypeOrmModule.forRoot({
      type: "mysql",
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      database: process.env.DB_NAME, // nombre de tu base de datos
      username: process.env.DB_USERNAME, // usuario MySQL
      password: process.env.DB_PASSWORD, // password MySQL
      autoLoadEntities: true, // detecta automáticamente tus entidades
      synchronize: true, // sincroniza el esquema de la base de datos (solo en desarrollo) 
                          // SOLO en desarrollo, crea/actualiza tablas
    }),
  BicicletasModule,
  UsuariosModule,
  ServiciosModule,
  AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}