import { Injectable } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import * as bcrypt from 'bcrypt'; // Importamos bcrypt para encriptar las contraseñas de los usuarios

@Injectable()
export class UsuariosService {
  // Inyectamos el repositorio para poder usar los métodos de la base de datos
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
  ) {}

  // Este método recibe los datos y los guarda en MySQL
  async create(createUsuarioDto: any) {
    // 3. Se define la complejidad de la encriptación (10 es el estándar recomendado)
    const saltos = 10;
    // 4. Encriptamos la contraseña usando bcrypt
    const passwordEncriptada = await bcrypt.hash(createUsuarioDto.password, saltos);
    // 5. Creamos el usuario pisando la contraseña original con la encriptada
    const nuevoUsuario = this.usuarioRepository.create({
      ...createUsuarioDto, // Esto copia todos los datos (nombre, email, etc.)
      password: passwordEncriptada, // Pisamos la contraseña con la versión encriptada
    });
    return this.usuarioRepository.save(nuevoUsuario);
  }

  async findAll() {
    return this.usuarioRepository.find({
      // Selecciono explícitamente los campos que quiero devolver, sin incluir la contraseña
      select: ['id', 'nombre', 'apellido', 'telefono', 'email', 'rol', 'fecha_registro'],
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} usuario`;
  }

  update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    return `This action updates a #${id} usuario`;
  }

  remove(id: number) {
    return `This action removes a #${id} usuario`;
  }
}

