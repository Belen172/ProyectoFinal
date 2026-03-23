import { Module } from '@nestjs/common';
import { ServiciosService } from './servicios.service';
import { ServiciosController } from './servicios.controller';
import { Servicio } from './entities/servicio.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [ServiciosController],
  providers: [ServiciosService],
  imports: [TypeOrmModule.forFeature([Servicio])]
})
export class ServiciosModule {}
