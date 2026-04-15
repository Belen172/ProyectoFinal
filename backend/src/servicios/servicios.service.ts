import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Servicio } from './entities/servicio.entity';
import { CreateServicioDto } from './dto/create-servicio.dto';
import { UpdateServicioDto } from './dto/update-servicio.dto';

@Injectable()
export class ServiciosService {
  constructor(
    @InjectRepository(Servicio)
    private readonly servicioRepository: Repository<Servicio>,
  ) {}

  async create(createServicioDto: CreateServicioDto) {
    // Relacionar el servicio con la bicicleta usando su id (referencia)
    const { bicicletaId, ...servicioData } = createServicioDto;
    const servicio = this.servicioRepository.create({
      ...servicioData,
      bicicleta: { id: bicicletaId },
    });
    return await this.servicioRepository.save(servicio);
  }

  async findAll() {
    // Selecciona la bicicleta Y el usuario dueño, omitiendo contraseñas
    return await this.servicioRepository.find({
      relations: ['bicicleta', 'bicicleta.usuario'],
      select: {
        id: true,
        fecha_ingreso: true,
        problema_informado: true,
        estado: true,
        trabajo_realizado: true,
        fecha_entrega: true,
        proximo_service_estimado: true,
        bicicleta: {
          id: true,
          marca: true,
          modelo: true,
          tipo: true,
          observaciones: true,
          usuario: {
            id: true,
            nombre: true,
            email: true,
            // asegurarse de NO traer password ni campos sensibles
          }
        }
      }
    });
  }

  async findOne(id: number) {
    const servicio = await this.servicioRepository.findOne({
      where: { id },
      relations: ['bicicleta', 'bicicleta.usuario'],
      select: {
        id: true,
        fecha_ingreso: true,
        problema_informado: true,
        estado: true,
        trabajo_realizado: true,
        fecha_entrega: true,
        proximo_service_estimado: true,
        bicicleta: {
          id: true,
          marca: true,
          modelo: true,
          tipo: true,
          observaciones: true,
          usuario: {
            id: true,
            nombre: true,
            email: true,
          }
        }
      }
    });
    if (!servicio) {
      throw new NotFoundException('Servicio no encontrado');
    }
    return servicio;
  }

  async update(id: number, updateServicioDto: UpdateServicioDto) {
    const servicio = await this.servicioRepository.findOneBy({ id });
    if (!servicio) {
      throw new NotFoundException('Servicio no encontrado');
    }

    // Si el update trae un nuevo bicicletaId, actualizar la relación
    if ((updateServicioDto as any).bicicletaId) {
      (servicio as any).bicicleta = { id: (updateServicioDto as any).bicicletaId };
    }

    Object.assign(servicio, updateServicioDto);
    return await this.servicioRepository.save(servicio);
  }

  async remove(id: number) {
    const result = await this.servicioRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Servicio no encontrado');
    }
    return { deleted: true };
  }

  // Nuevo: Buscar servicios de una bicicleta específica
  async findByBicicleta(bicicletaId: number) {
    return this.servicioRepository.find({
      where: {
        bicicleta: { id: bicicletaId },
      },
      relations: ['bicicleta', 'bicicleta.usuario'],
      select: {
        id: true,
        fecha_ingreso: true,
        problema_informado: true,
        estado: true,
        trabajo_realizado: true,
        fecha_entrega: true,
        proximo_service_estimado: true,
        bicicleta: {
          id: true,
          marca: true,
          modelo: true,
          tipo: true,
          observaciones: true,
          usuario: {
            id: true,
            nombre: true,
            email: true,
          }
        }
      },
      order: { fecha_ingreso: 'DESC' }
    });
  }
}



