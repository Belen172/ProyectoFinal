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
    // 1. Buscamos primero al usuario
    const usuario = await this.usuariosService.findByEmailOrDni(
      loginDto.identificador,
    );

    // 2. Si no existe, cortamos acá mismo
    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 3. Probamos encriptación bcrypt primero
    let passwordValida = await bcrypt.compare(
      loginDto.password,
      usuario.password,
    );

    // 4. Si bcrypt falla, probamos comparación directa (texto plano)
    if (!passwordValida) {
      passwordValida = loginDto.password === usuario.password;
    }

    // 5. Si después de ambas pruebas sigue siendo inválida, tiramos el error
    if (!passwordValida) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 6. Si llegamos acá, todo está bien, generamos el payload y el token
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
