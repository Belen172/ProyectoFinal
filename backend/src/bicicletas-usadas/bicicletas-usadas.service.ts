import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BicicletaUsada } from './entities/bicicleta-usada.entity';
import { CreateBicicletaUsadaDto } from './dto/create-bicicleta-usada.dto';
import { UpdateBicicletaUsadaDto } from './dto/update-bicicleta-usada.dto';

@Injectable()
export class BicicletasUsadasService {
  constructor(
    @InjectRepository(BicicletaUsada)
    private readonly bicicletaUsadaRepository: Repository<BicicletaUsada>,
  ) {}

  async create(createDto: CreateBicicletaUsadaDto): Promise<BicicletaUsada> {
    const nuevaBici = this.bicicletaUsadaRepository.create(createDto);
    return await this.bicicletaUsadaRepository.save(nuevaBici);
  }

  async findAll(): Promise<BicicletaUsada[]> {
    return await this.bicicletaUsadaRepository.find();
  }

  async findOne(id: number): Promise<BicicletaUsada> {
    const bici = await this.bicicletaUsadaRepository.findOne({ where: { id } });
    if (!bici) {
      throw new NotFoundException(`La bicicleta usada con ID ${id} no fue encontrada.`);
    }
    return bici;
  }

  async update(id: number, updateDto: UpdateBicicletaUsadaDto): Promise<BicicletaUsada> {
    const bici = await this.findOne(id);
    Object.assign(bici, updateDto);
    return await this.bicicletaUsadaRepository.save(bici);
  }

  async remove(id: number): Promise<void> {
    const bici = await this.findOne(id);
    await this.bicicletaUsadaRepository.remove(bici);
  }
}