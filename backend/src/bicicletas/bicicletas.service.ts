import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bicicleta } from './entities/bicicleta.entity';
import { CreateBicicletaDto } from './dto/create-bicicleta.dto';
import { UpdateBicicletaDto } from './dto/update-bicicleta.dto';

@Injectable()
export class BicicletasService {
  // Inyectamos el repositorio para poder usar los métodos de la base de datos
  constructor(
    @InjectRepository(Bicicleta)
    private bicicletaRepository: Repository<Bicicleta>,
  ) {}

  async create(createBicicletaDto: CreateBicicletaDto) {
    // 1. Extraemos el usuarioId del resto de los datos
    const { usuarioId, ...datosBici } = createBicicletaDto;

    // 2. Armamos el objeto de la bicicleta relacionándolo con el dueño
    const nuevaBicicleta = this.bicicletaRepository.create({
      ...datosBici,
      usuario: { id: usuarioId }, // Así le decimos a TypeORM de quién es la bici
    });

    // 3. Guardamos en la base de datos
    return this.bicicletaRepository.save(nuevaBicicleta);
  }

  async findAll() {
    return this.bicicletaRepository.find({
      // 1. Le decimos que traiga la relación (el nombre 'usuario' sale de tu entidad)
      relations: ['usuario'], 
      
      // 2. Elegimos qué datos devolver para mantener todo seguro y limpio
      select: {
        id: true,
        marca: true,
        modelo: true,
        tipo: true,
        observaciones: true,
        usuario: { // Del usuario, solo traemos estos datos:
          id: true,
          nombre: true,
          apellido: true,
          telefono: true,
          email: true,
        }
      }
    });
  }

  // BUSCAR UNA SOLA BICI POR ID:
  async findOne(id: number) {
    return this.bicicletaRepository.findOne({
      where: { id },
      relations: ['usuario'], // Traemos al dueño también
      select: {
        id: true, marca: true, modelo: true, tipo: true, observaciones: true,
        usuario: { id: true, nombre: true, apellido: true, telefono: true, email: true }
      }
    });
  }

  // ACTUALIZAR (EDITAR):
  async update(id: number, updateBicicletaDto: any) {
    await this.bicicletaRepository.update(id, updateBicicletaDto);
    return this.findOne(id); // Devolvemos la bici actualizada para ver cómo quedó
  }

  // ELIMINAR:
  async remove(id: number) {
    await this.bicicletaRepository.delete(id);
    return { mensaje: `Bicicleta con id ${id} eliminada correctamente` };
  }

  // BUSCAR TODAS LAS BICIS DE UN DUEÑO ESPECÍFICO:
  async findByUsuario(usuarioId: number) {
    return this.bicicletaRepository.find({
      where: { 
        usuario: { id: usuarioId } // Acá filtramos por el ID del dueño
      },
      relations: ['usuario'],
      select: {
        id: true, marca: true, modelo: true, tipo: true, observaciones: true,
      }
    });
  }
}
