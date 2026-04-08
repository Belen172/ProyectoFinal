import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity'; 

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

  @Column({ type: 'text', nullable: true })
  observaciones!: string;

  // Relación: Muchas bicicletas pertenecen a un Usuario
  @ManyToOne(() => Usuario) 
  @JoinColumn({ name: 'usuario_id' })
  usuario!: Usuario;
}