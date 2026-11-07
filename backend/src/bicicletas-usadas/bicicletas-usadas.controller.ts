import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { BicicletasUsadasService } from './bicicletas-usadas.service';
import { CreateBicicletaUsadaDto } from './dto/create-bicicleta-usada.dto';
import { UpdateBicicletaUsadaDto } from './dto/update-bicicleta-usada.dto';
import { AdminGuard } from '../auth/admin.guard';

@Controller('bicicletas-usadas')
export class BicicletasUsadasController {
  constructor(
    private readonly bicicletasUsadasService: BicicletasUsadasService,
  ) {}

  @Post()
  @UseGuards(AdminGuard)
  @UseInterceptors(
    FileInterceptor('imagen', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);

          callback(
            null,
            'bici-' + uniqueSuffix + extname(file.originalname),
          );
        },
      }),
    }),
  )
  create(
    @Body() createDto: CreateBicicletaUsadaDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      createDto.imagenUrl = `/uploads/${file.filename}`;
    }

    return this.bicicletasUsadasService.create(createDto);
  }

  @Get()
  findAll() {
    return this.bicicletasUsadasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bicicletasUsadasService.findOne(id);
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateBicicletaUsadaDto,
  ) {
    return this.bicicletasUsadasService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.bicicletasUsadasService.remove(id);
  }
}