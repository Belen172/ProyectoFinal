import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

// Definimos los roles permitidos
export enum RolUsuario {
  ADMIN = 'ADMIN',
  CLIENTE = 'CLIENTE',
}

@Entity('usuarios') // Así se va a llamar la tabla en MySQL
export class Usuario {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 50 })
  nombre!: string;

  @Column({ type: 'varchar', length: 50 })
  apellido!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @Column({ type: 'enum', enum: RolUsuario, default: RolUsuario.CLIENTE })
  rol!: RolUsuario;

  @CreateDateColumn()
  fecha_registro!: Date;
}