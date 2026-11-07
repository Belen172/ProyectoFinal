import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('bicicletas_usadas')
export class BicicletaUsada {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100 })
  marca!: string;

  @Column({ type: 'varchar', length: 100 })
  modelo!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  talle?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio!: number;

  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @Column({ type: 'boolean', default: true })
  disponible!: boolean; // True si está a la venta, false si ya se vendió

  @Column({ type: 'varchar', length: 255, nullable: true })
  imagenUrl?: string;
}