import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity'; 
import { Servicio } from '../../servicios/entities/servicio.entity';

@Entity('bicicletas')
export class Bicicleta {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 50 })
  marca!: string;

  @Column({ type: 'varchar', length: 50 })
  modelo!: string;

  @Column({ type: 'varchar', length: 50 })
  tipo!: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  color!: string;

  @Column({ type: 'text', nullable: true })
  observaciones!: string;

  @Column({ type: 'boolean', default: true })
  activa!: boolean;

  // Relación: Muchas bicicletas pertenecen a un Usuario
  @ManyToOne(() => Usuario) 
  @JoinColumn({ name: 'usuario_id' })
  usuario!: Usuario;

  // Relación: Muchas bicicletas pueden tener muchos servicios
  @OneToMany(() => Servicio, (servicio) => servicio.bicicleta)
  servicios!: Servicio[];
}