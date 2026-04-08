import { Injectable } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { NotFoundException } from '@nestjs/common';
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

  // BUSCAR POR ID:
  async findOne(id: number) {
    return this.usuarioRepository.findOne({
      where: { id }, // Le digo qué ID buscar
      // Igual que antes, le oculto la contraseña por seguridad
      select: ['id', 'nombre', 'apellido', 'telefono', 'email', 'rol', 'fecha_registro'],
    });
  }

  // ACTUALIZAR (EDITAR):
  async update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    const usuario = await this.usuarioRepository.findOneBy({ id });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    Object.assign(usuario, updateUsuarioDto);
   
    // Devuelvo el usuario ya actualizado para ver cómo quedó
    return await this.usuarioRepository.save(usuario);
  }

  // ELIMINAR:
  async remove(id: number) {
    // Uso delete() que borra la fila directamente en MySQL
    await this.usuarioRepository.delete(id);
    return { mensaje: `Usuario con id ${id} eliminado correctamente` };
  }
}

