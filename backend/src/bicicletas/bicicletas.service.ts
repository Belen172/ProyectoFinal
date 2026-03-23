import { Injectable } from '@nestjs/common';
import { CreateBicicletaDto } from './dto/create-bicicleta.dto';
import { UpdateBicicletaDto } from './dto/update-bicicleta.dto';

@Injectable()
export class BicicletasService {
  create(createBicicletaDto: CreateBicicletaDto) {
    return 'This action adds a new bicicleta';
  }

  findAll() {
    return `This action returns all bicicletas`;
  }

  findOne(id: number) {
    return `This action returns a #${id} bicicleta`;
  }

  update(id: number, updateBicicletaDto: UpdateBicicletaDto) {
    return `This action updates a #${id} bicicleta`;
  }

  remove(id: number) {
    return `This action removes a #${id} bicicleta`;
  }
}
