import { Module } from '@nestjs/common';
import { BicicletasService } from './bicicletas.service';
import { BicicletasController } from './bicicletas.controller';
import { Bicicleta } from './entities/bicicleta.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [BicicletasController],
  providers: [BicicletasService],
  imports: [TypeOrmModule.forFeature([Bicicleta])]
})
export class BicicletasModule {}
