import {
  BadRequestException,
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
import { memoryStorage } from 'multer';
import { put, del } from '@vercel/blob';
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
      storage: memoryStorage(),

      // Máximo 4 MB por imagen.
      limits: {
        fileSize: 4 * 1024 * 1024,
      },

      fileFilter: (req, file, callback) => {
        const tiposPermitidos = ['image/jpeg', 'image/png'];

        if (!tiposPermitidos.includes(file.mimetype)) {
          return callback(
            new BadRequestException(
              'La imagen debe ser un archivo JPG o PNG.',
            ),
            false,
          );
        }

        callback(null, true);
      },
    }),
  )
  async create(
    @Body() createDto: CreateBicicletaUsadaDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    // La URL la genera el servidor al subir la imagen.
    delete createDto.imagenUrl;

    let imagenSubidaUrl: string | undefined;

    try {
      if (file) {
        const extension =
          file.mimetype === 'image/png' ? 'png' : 'jpg';

        const blob = await put(
          `bicicletas/bici.${extension}`,
          file.buffer,
          {
            access: 'public',
            addRandomSuffix: true,
            contentType: file.mimetype,
          },
        );

        imagenSubidaUrl = blob.url;
        createDto.imagenUrl = blob.url;
      }

      return await this.bicicletasUsadasService.create(createDto);
    } catch (error) {
      // Si falla el guardado, intentamos quitar la foto recién subida.
      if (imagenSubidaUrl) {
        try {
          await del(imagenSubidaUrl);
        } catch (cleanupError) {
          console.error(
            'No se pudo eliminar la imagen de una publicación fallida:',
            cleanupError,
          );
        }
      }

      throw error;
    }
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
    // La edición de los datos conserva la foto actual.
    delete updateDto.imagenUrl;

    return this.bicicletasUsadasService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.bicicletasUsadasService.remove(id);
  }
}