import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BicicletasModule } from './bicicletas/bicicletas.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ServiciosModule } from './servicios/servicios.module';
import { AuthModule } from './auth/auth.module';
import { ScheduleModule } from '@nestjs/schedule';
import { MailerModule } from '@nestjs-modules/mailer';
import { PassportModule } from '@nestjs/passport';


@Module({
  imports: [
  // Esto carga las variables de entorno de forma global
  ConfigModule.forRoot({
    isGlobal: true, 
  }),

  // INICIO EL TEMPORIZADOR
  ScheduleModule.forRoot(),

  // CONFIGURAMOS EL MÓDULO DE GMAIL. El Mailer ahora usa el ConfigService para ir a buscar las variables seguras
  MailerModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (config: ConfigService) => ({
      transport: {
        service: 'gmail',
        auth: {
          user: config.get<string>('GMAIL_USER'), // Toma el correo de tu archivo .env
          pass: config.get<string>('GMAIL_PASS'), // Toma la contraseña de 16 letras de tu .env
        },
      },
      defaults: {
        from: `"PROYECTO bike" <${config.get<string>('GMAIL_USER')}>`, // Así aparece el remitente lindo en la bandeja
      },
    }),
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