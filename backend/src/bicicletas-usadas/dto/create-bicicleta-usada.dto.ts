import { Transform } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  Min,
} from 'class-validator';

export class CreateBicicletaUsadaDto {
  @IsString()
  @IsNotEmpty({ message: 'La marca es obligatoria' })
  marca!: string;

  @IsString()
  @IsNotEmpty({ message: 'El modelo es obligatorio' })
  modelo!: string;

  @IsString()
  @IsOptional()
  talle?: string;

  @Transform(({ value }) => {
    if (typeof value === 'string' && value.trim() !== '') {
      return Number(value);
    }

    return value;
  })
  @IsNumber({}, { message: 'El precio debe ser un número' })
  @Min(0, { message: 'El precio no puede ser negativo' })
  precio!: number;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;

    return value;
  })
  @IsBoolean({
    message: 'La disponibilidad debe ser verdadero o falso',
  })
  @IsOptional()
  disponible?: boolean;

  @IsString()
  @IsOptional()
  imagenUrl?: string;
}