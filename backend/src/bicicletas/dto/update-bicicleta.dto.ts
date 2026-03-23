import { PartialType } from '@nestjs/mapped-types';
import { CreateBicicletaDto } from './create-bicicleta.dto';

export class UpdateBicicletaDto extends PartialType(CreateBicicletaDto) {}
