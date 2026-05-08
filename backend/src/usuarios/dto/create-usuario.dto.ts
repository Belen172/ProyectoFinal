import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, Length } from 'class-validator';

export class CreateUsuarioDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre!: string;

  @IsString()
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  apellido!: string;

  @IsString()
  @IsOptional()
  dni?: string;

  @IsString()
  @IsOptional()
  @Length(11, 11, { message: 'El CUIT debe tener 11 dígitos' })
  cuit?: string;

  @IsString()
  @IsOptional() // El teléfono es opcional
  telefono?: string;

  @IsEmail({}, { message: 'El formato del email no es válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password!: string;

  @IsString()
  @IsOptional()
  rol?: string;
}