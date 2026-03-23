import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BicicletasService } from './bicicletas.service';
import { CreateBicicletaDto } from './dto/create-bicicleta.dto';
import { UpdateBicicletaDto } from './dto/update-bicicleta.dto';

@Controller('bicicletas')
export class BicicletasController {
  constructor(private readonly bicicletasService: BicicletasService) {}

  @Post()
  create(@Body() createBicicletaDto: CreateBicicletaDto) {
    return this.bicicletasService.create(createBicicletaDto);
  }

  @Get()
  findAll() {
    return this.bicicletasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bicicletasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBicicletaDto: UpdateBicicletaDto) {
    return this.bicicletasService.update(+id, updateBicicletaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bicicletasService.remove(+id);
  }
}
