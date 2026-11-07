import { PartialType } from '@nestjs/mapped-types';
import { CreateBicicletaUsadaDto } from './create-bicicleta-usada.dto';

export class UpdateBicicletaUsadaDto extends PartialType(CreateBicicletaUsadaDto) {}