import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Bicicleta } from '../../bicicletas/entities/bicicleta.entity';

export enum EstadoServicio {
  PENDIENTE = 'PENDIENTE',
  EN_REPARACION = 'EN_REPARACION',
  TERMINADO = 'TERMINADO',
  ENTREGADO = 'ENTREGADO',
}

@Entity('servicios')
export class Servicio {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn() // TypeORM llena la fecha y hora solas al crear el registro
  fecha_ingreso!: Date;

  @Column({ type: 'text' })
  problema_informado!: string;

  @Column({ type: 'enum', enum: EstadoServicio, default: EstadoServicio.PENDIENTE })
  estado!: EstadoServicio;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  precio!: number;

  @Column({ type: 'text', nullable: true })
  trabajo_realizado!: string;

  @Column({ type: 'datetime', nullable: true })
  fecha_entrega!: Date;

  @Column({ type: 'date', nullable: true })
  proximo_service_estimado!: Date;

  // Relación: Muchos servicios se le hacen a una Bicicleta
  @ManyToOne(() => Bicicleta)
  @JoinColumn({ name: 'bicicleta_id' })
  bicicleta!: Bicicleta;
}