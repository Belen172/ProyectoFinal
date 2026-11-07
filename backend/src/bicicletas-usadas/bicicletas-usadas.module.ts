import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BicicletasUsadasService } from './bicicletas-usadas.service';
import { BicicletasUsadasController } from './bicicletas-usadas.controller';
import { BicicletaUsada } from './entities/bicicleta-usada.entity';
import { AuthModule } from '../auth/auth.module';
import { AdminGuard } from '../auth/admin.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([BicicletaUsada]),
    AuthModule,
  ],
  controllers: [BicicletasUsadasController],
  providers: [BicicletasUsadasService, AdminGuard],
})
export class BicicletasUsadasModule {}