import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsInt,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { EstadoServicio } from '../entities/servicio.entity';

export class CreateServicioDto {
  @IsString()
  @IsNotEmpty()
  problema_informado: string;

  @IsEnum(EstadoServicio)
  @IsOptional()
  estado?: EstadoServicio;

  @IsNumber({}, { message: 'El precio debe ser un número válido' })
  @IsOptional()
  precio: number;

  @IsString()
  @IsOptional()
  trabajo_realizado?: string;

  @IsDateString()
  @IsOptional()
  fecha_entrega?: string;

  @IsDateString()
  @IsOptional()
  proximo_service_estimado?: string;

  @IsInt({ message: 'El ID de la bicicleta debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID de la bicicleta es obligatorio' })
  bicicletaId: number;
}