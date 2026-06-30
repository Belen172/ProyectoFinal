import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    // Primero, intentamos la comparación de bcrypt (por si tenés usuarios encriptados)
    let passwordValida = await bcrypt.compare(loginDto.password, usuario.password);
    
    // Si no es válida, probamos comparación directa (por si el usuario está en texto plano)
    if (!passwordValida) {
      passwordValida = loginDto.password === usuario.password;
    }

    if (!passwordValida) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const usuario = await this.usuariosService.findByEmailOrDni(
      loginDto.identificador,
    );

    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordValida = await bcrypt.compare(
      loginDto.password,
      usuario.password,
    );

    if (!passwordValida) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = {
      sub: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        dni: usuario.dni,
        email: usuario.email,
        rol: usuario.rol,
        fecha_registro: usuario.fecha_registro,
      },
    };
  }
}
