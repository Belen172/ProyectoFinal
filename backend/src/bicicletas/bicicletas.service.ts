import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bicicleta } from './entities/bicicleta.entity';
import { CreateBicicletaDto } from './dto/create-bicicleta.dto';
import { UpdateBicicletaDto } from './dto/update-bicicleta.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MailerService } from '@nestjs-modules/mailer';


@Injectable()
export class BicicletasService {
  // Inyectamos el repositorio para poder usar los métodos de la base de datos
  constructor(
    @InjectRepository(Bicicleta)
    private bicicletaRepository: Repository<Bicicleta>,

    // INYECTO EL SERVICIO DE CORREOS ACÁ
    private readonly mailerService: MailerService,
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
      where: { activa: true },
      // 1. Le decimos que traiga la relación (el nombre 'usuario' sale de tu entidad)
      relations: ['usuario', 'servicios'], 
      
      // 2. Elegimos qué datos devolver para mantener todo seguro y limpio
      select: {
        id: true,
        marca: true,
        modelo: true,
        tipo: true,
        color: true,
        observaciones: true,
        usuario: { // Del usuario, solo traemos estos datos:
          id: true,
          nombre: true,
          apellido: true,
          dni: true,
          telefono: true,
          email: true,
        },
        servicios: {
          id: true,
          fecha_ingreso: true,
          estado: true,
          problema_informado: true,
          trabajo_realizado: true,
          fecha_entrega: true
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

  // BORRADO LÓGICO (soft delete):
  async remove(id: number) {
    await this.bicicletaRepository.update(id, { activa: false });
    return { mensaje: `Bicicleta con id ${id} eliminada correctamente` };
  }

  // BUSCAR TODAS LAS BICIS DE UN DUEÑO ESPECÍFICO:
  async findByUsuario(usuarioId: number) {
    return this.bicicletaRepository.find({
      where: { 
        usuario: { id: usuarioId } // Acá filtramos por el ID del dueño
      },
      relations: ['usuario', 'servicios'],
      select: {
        id: true, marca: true, modelo: true, tipo: true, observaciones: true,
        servicios: {
          id: true,
          fecha_ingreso: true,
          estado: true,
          problema_informado: true,
          trabajo_realizado: true,
          fecha_entrega: true
        }
      }
    });
  }

  // NOTIFICACIONES AUTOMÁTICAS POR MAIL - CADA 6 MESES
  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async notificarMantenimientoSeisMeses() {
    console.log('Ejecutando tarea automática: Revisando bicis de hace 6 meses...');

    const hace6Meses = new Date();
    hace6Meses.setMonth(hace6Meses.getMonth() - 6);
    const fechaObjetivo = hace6Meses.toISOString().split('T')[0];

    try {
      const bicicletas = await this.bicicletaRepository.find({
        where: { activa: true },
        relations: ['usuario', 'servicios'],
      });

      for (const bici of bicicletas) {
        const servicioVencido = bici.servicios?.find(
          (servicio) => {
            if (!servicio.fecha_ingreso) return false;
            const fechaServicio = new Date(servicio.fecha_ingreso).toISOString().split('T')[0];
            return fechaServicio === fechaObjetivo;
          }
        );

        if (servicioVencido && bici.usuario?.email) {
          await this.mailerService.sendMail({
            to: bici.usuario.email,
            subject: '¡Es hora de un nuevo service para tu bicicleta!',
            html: `
              <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #2c3e50;">¡Hola ${bici.usuario.nombre}!</h2>
                <p>Te escribimos desde <strong>PROYECTO bike</strong>.</p>
                <p>Notamos que pasaron exactamente 6 meses desde el último service que le hicimos a tu bicicleta <strong>${bici.marca} ${bici.modelo}</strong>.</p>
                <p>Para mantenerla en perfecto estado y evitar desgastes mayores, te recomendamos traerla para un chequeo general.</p>
                <br/>
                <p>¡Te esperamos!</p>
                <p><em>El equipo de tu taller de confianza.</em></p>
              </div>
            `,
          });
          console.log(`Correo enviado exitosamente a: ${bici.usuario.email}`);
        }
      }
    } catch (error) {
      console.error('Error al ejecutar la tarea automática de correos:', error);
    }
  }
}
