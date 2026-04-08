import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBicicletaDto {
  @IsString()
  @IsNotEmpty({ message: 'La marca es obligatoria' })
  marca!: string;

  @IsString()
  @IsNotEmpty({ message: 'El modelo es obligatorio' })
  modelo!: string;

  @IsString()
  @IsNotEmpty({ message: 'El tipo de bicicleta es obligatorio' })
  tipo!: string;

  @IsString()
  @IsOptional() // Es opcional
  observaciones?: string;

  // Necesitamos el ID del dueño que ya existe en la base de datos
  @IsInt({ message: 'El ID del usuario debe ser un número' })
  @IsNotEmpty({ message: 'La bicicleta debe tener un dueño asignado' })
  usuarioId!: number; 
}